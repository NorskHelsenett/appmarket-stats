package main

import (
	"context"
	"fmt"
	"os"

	sync "app-market-cost-report-sync"

	"github.com/NorskHelsenett/ror/pkg/clients/rorclient"
	"github.com/NorskHelsenett/ror/pkg/clients/rorclient/transports/resttransport"
	"github.com/NorskHelsenett/ror/pkg/clients/rorclient/transports/resttransport/httpauthprovider"
	"github.com/NorskHelsenett/ror/pkg/clients/rorclient/v2/transports/resttransport/httpclient"
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



func NewAppMarketSync() (*AppMarketSync, error) {
	db, err := sync.OpenDatabase()
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Automigrate(); err != nil {
		return nil, fmt.Errorf("failed to automigrate database: %w", err)
	}

	transport := resttransport.NewRorHttpTransport(&httpclient.HttpTransportClientConfig{
		BaseURL:      "https://api.ror.nhn.no",
		//BaseURL:      "http://localhost:10000",
		AuthProvider: httpauthprovider.NewAuthProvider(httpauthprovider.AuthPoviderTypeAPIKey, os.Getenv("API_KEY")),
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
		apiVersion: "v2",
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

	ctx := context.Background()

const pageSize = 100

	var clusters []*sync.Cluster
offset := 0

for {
query := rorresources.ResourceQuery{
    VersionKind: schema.GroupVersionKind{
 
        Kind:    "KubernetesCluster",
    },
    Limit: pageSize,
	Offset: offset,
}

	unmapped, err := s.client.ResourcesV2().Get(ctx, query)
	if err != nil {
		return err
	}


		for _, u := range unmapped.Resources {
			clusters = append(clusters, &sync.Cluster{
				ID:   string(u.Metadata.UID),
				Name: u.Metadata.Name,
			})
		}

		if len(unmapped.Resources) < pageSize {
			break
		}
		offset += pageSize
}
	s.state.clusters = clusters
	return nil
}


func (s *AppMarketSync) fetchInstances() error {
	for _, cluster := range s.state.clusters {
		apps, err := s.getApplications(cluster.ID)
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


func (s *AppMarketSync) getApplications(clusterID string) ([]appResult, error) {
	apps, err := s.client.ResourcesV2().Get(context.Background(), rorresources.ResourceQuery{
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
	},
)
	if err != nil {
		return nil, err
	}
	results := []appResult{}
	for _, app := range apps.Resources {
	if _, ok := app.Metadata.Annotations["appmarket.nhn.no/application"]; !ok {
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
	sync, err := NewAppMarketSync()
	if err != nil {
		panic(err)
	}

	if err := sync.Run(); err != nil {
		panic(err)
	}
}
