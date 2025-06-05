package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	sync "app-market-cost-report-sync"

	"github.com/NorskHelsenett/ror/pkg/apicontracts/apiresourcecontracts"
	"github.com/NorskHelsenett/ror/pkg/clients/rorclient"
	"github.com/NorskHelsenett/ror/pkg/clients/rorclient/transports/resttransport"
	"github.com/NorskHelsenett/ror/pkg/clients/rorclient/transports/resttransport/httpauthprovider"
	"github.com/NorskHelsenett/ror/pkg/clients/rorclient/transports/resttransport/httpclient"
	"github.com/NorskHelsenett/ror/pkg/config/rorversion"
	"github.com/NorskHelsenett/ror/pkg/models/aclmodels"
	"github.com/NorskHelsenett/ror/pkg/models/aclmodels/rorresourceowner"
	"github.com/NorskHelsenett/ror/pkg/rorresources"
	"github.com/google/uuid"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

type AppMarketSync struct {
	db         *sync.Database
	client     *rorclient.RorClient
	state      *State
	apiVersion string // "v1" or "v2"
}

type State struct {
	applications map[string]*sync.Application
	instances    []*sync.Instance
	clusters     []*sync.Cluster
}

type appResult struct {
	name     string
	billable bool
}

func NewAppMarketSync(apiVersion string) (*AppMarketSync, error) {
	db, err := sync.OpenDatabase()
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Automigrate(); err != nil {
		return nil, fmt.Errorf("failed to automigrate database: %w", err)
	}

	transport := resttransport.NewRorHttpTransport(&httpclient.HttpTransportClientConfig{
		BaseURL:      "https://api.ror.nhn.no",
		AuthProvider: httpauthprovider.NewAuthProvider(httpauthprovider.AuthPoviderTypeAPIKey, os.Getenv("API_KEY")),
		Version:      rorversion.NewRorVersion("", ""),
		Role:         "",
	})

	return &AppMarketSync{
		db:     db,
		client: rorclient.NewRorClient(transport),
		state: &State{
			applications: make(map[string]*sync.Application),
			instances:    []*sync.Instance{},
			clusters:     []*sync.Cluster{},
		},
		apiVersion: apiVersion,
	}, nil
}

func (s *AppMarketSync) Run() error {
	defer s.db.Close()

	if err := s.syncExistingData(); err != nil {
		return fmt.Errorf("failed to sync existing data: %w", err)
	}

	if err := s.fetchClusters(); err != nil {
		return fmt.Errorf("failed to fetch clusters: %w", err)
	}

	if err := s.fetchInstances(); err != nil {
		return fmt.Errorf("failed to fetch instances: %w", err)
	}

	if err := s.persistData(); err != nil {
		return fmt.Errorf("failed to persist data: %w", err)
	}

	return nil
}

func (s *AppMarketSync) syncExistingData() error {
	apps, err := s.db.GetApplications()
	if err != nil {
		return err
	}

	for _, app := range apps {
		s.state.applications[app.Name] = app
	}
	return nil
}

func (s *AppMarketSync) fetchClusters() error {
	unmapped, err := s.client.Clusters().GetAll()
	if err != nil {
		return err
	}

	clusters := make([]*sync.Cluster, len(*unmapped))
	for i, u := range *unmapped {
		name := "undefined"
		if u.Metadata.Project != nil {
			name = u.Metadata.Project.Name
		}

		clusters[i] = &sync.Cluster{
			ID:          u.ClusterId,
			Name:        u.ClusterName,
			Workorder:   u.Metadata.Billing.Workorder,
			ProjectId:   u.Metadata.ProjectID,
			ProjectName: name,
		}
	}

	s.state.clusters = clusters
	return nil
}

func (s *AppMarketSync) fetchInstances() error {
	var err error
	switch s.apiVersion {
	case "v1":
		err = s.fetchInstancesV1()
	case "v2":
		err = s.fetchInstancesV2()
	default:
		return fmt.Errorf("unsupported API version: %s", s.apiVersion)
	}
	return err
}

func (s *AppMarketSync) fetchInstancesV1() error {
	for _, cluster := range s.state.clusters {
		apps, err := s.getApplicationsV1(cluster.ID)
		if err != nil {
			return err
		}

		for _, appRes := range apps {
			trimmed := strings.ReplaceAll(appRes.name, " ", "")
			app, ok := s.state.applications[trimmed]
			if !ok {
				app = &sync.Application{
					ID:   uuid.NewString(),
					Name: trimmed,
				}
				s.state.applications[trimmed] = app
			}

			s.state.instances = append(s.state.instances, &sync.Instance{
				ID:            uuid.NewString(),
				ApplicationID: app.ID,
				ClusterID:     cluster.ID,
				Billable:      appRes.billable,
			})
		}
	}
	return nil
}

func (s *AppMarketSync) fetchInstancesV2() error {
	for _, cluster := range s.state.clusters {
		apps, err := s.getApplicationsV2(cluster.ID)
		if err != nil {
			return err
		}

		for _, appRes := range apps {
			app, ok := s.state.applications[appRes.name]
			if !ok {
				app = &sync.Application{
					ID:   uuid.NewString(),
					Name: appRes.name,
				}
				s.state.applications[appRes.name] = app
			}

			s.state.instances = append(s.state.instances, &sync.Instance{
				ID:            uuid.NewString(),
				ApplicationID: app.ID,
				ClusterID:     cluster.ID,
				Billable:      appRes.billable,
			})
		}
	}
	return nil
}

func (s *AppMarketSync) getApplicationsV1(clusterID string) ([]appResult, error) {
	req, err := http.NewRequest(
		"GET",
		fmt.Sprintf("https://api.ror.nhn.no/v1/resources?ownerScope=cluster&ownerSubject=%s&apiversion=argoproj.io/v1alpha1&kind=Application", clusterID),
		nil,
	)
	if err != nil {
		return nil, err
	}

	req.Header.Add("X-API-KEY", os.Getenv("API_KEY"))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var apps []apiresourcecontracts.ResourceApplication
	if err := json.NewDecoder(resp.Body).Decode(&apps); err != nil {
		return nil, err
	}

	results := []appResult{}
	for _, app := range apps {
		if app.Metadata.Labels["argocd.argoproj.io/instance"] != "nhn-appmarket" {
			continue
		}

		results = append(results, appResult{
			name:     app.Metadata.Annotations["appmarket.nhn.no/application"],
			billable: app.Metadata.Labels["billable"] == "true",
		})
	}

	return results, nil
}

func (s *AppMarketSync) getApplicationsV2(clusterID string) ([]appResult, error) {
	apps, err := s.client.ResourceV2().Get(context.Background(), rorresources.ResourceQuery{
		VersionKind: schema.GroupVersionKind{
			Group:   "",
			Version: "argoproj.io/v1alpha1",
			Kind:    "Application",
		},
		OwnerRefs: []rorresourceowner.RorResourceOwnerReference{
			{
				Scope:   aclmodels.Acl2ScopeCluster,
				Subject: aclmodels.Acl2Subject(clusterID),
			},
		},
	})

	if err != nil {
		return nil, err
	}

	results := []appResult{}
	for _, app := range apps.Resources {
		if app.Metadata.Labels["argocd.argoproj.io/instance"] != "nhn-appmarket" {
			continue
		}

		results = append(results, appResult{
			name:     app.Metadata.Annotations["appmarket.nhn.no/application"],
			billable: app.Metadata.Labels["billable"] == "true",
		})
	}

	return results, nil
}

func (s *AppMarketSync) persistData() error {
	if err := s.db.PersistClusters(s.state.clusters); err != nil {
		return err
	}

	if err := s.db.PersistApplications(s.state.applications); err != nil {
		return err
	}

	return s.db.PersistInstances(s.state.instances)
}

func main() {
	fmt.Println("api key", os.Getenv("API_KEY"))

	sync, err := NewAppMarketSync("v1") // or "v2" depending on which API version you want to use
	if err != nil {
		panic(err)
	}

	if err := sync.Run(); err != nil {
		panic(err)
	}
}
