package main

import (
	sync "app-market-cost-report-sync"
	"context"

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

type State struct {
	applications map[string]*sync.Application
	instances    []*sync.Instance
	clusters     []*sync.Cluster
}

func getAllClusters(client *rorclient.RorClient) ([]*sync.Cluster, error) {
	unmapped, err := client.Clusters().GetAll()
	if err != nil {
		return nil, err
	}

	clusters := make([]*sync.Cluster, len(*unmapped))

	for i, u := range *unmapped {
		clusters[i] = new(sync.Cluster)
		clusters[i].ID = u.ClusterId
		clusters[i].Name = u.ClusterName
		clusters[i].Workorder = u.Metadata.Billing.Workorder
	}

	return clusters, nil
}

func getApplications(client *rorclient.RorClient, id string) ([]string, error) {
	apps, err := client.ResourceV2().Get(context.Background(), rorresources.ResourceQuery{
		VersionKind: schema.GroupVersionKind{
			Group:   "",
			Version: "argoproj.io/v1alpha1",
			Kind:    "Application",
		},
		OwnerRefs: []rorresourceowner.RorResourceOwnerReference{{Scope: aclmodels.Acl2ScopeCluster, Subject: aclmodels.Acl2Subject(id)}},
	})

	if err != nil {
		return nil, err
	}

	applications := []string{}
	for _, app := range apps.Resources {
		if app.Metadata.Labels["argocd.argoproj.io/instance"] != "nhn-appmarket" {
			continue
		}

		if app.Metadata.Labels["billable"] != "true" {
			continue
		}

		applicationName := app.Metadata.Annotations["appmarket.nhn.no/application"]
		applications = append(applications, applicationName)
	}

	return applications, nil
}

func getAllInstances(state *State, client *rorclient.RorClient) error {
	for _, cluster := range state.clusters {
		apps, err := getApplications(client, cluster.ID)
		if err != nil {
			return err
		}

		for _, appName := range apps {
			app, ok := state.applications[appName]
			if !ok {
				app = &sync.Application{
					ID:   uuid.NewString(),
					Name: appName,
				}
				state.applications[appName] = app
			}

			instance := new(sync.Instance)
			instance.ID = uuid.NewString()
			instance.ApplicationID = app.ID
			instance.ClusterID = cluster.ID
			state.instances = append(state.instances, instance)
		}
	}

	return nil
}

func (s *State) clusterById(id string) *sync.Cluster {
	for _, cluster := range s.clusters {
		if cluster.ID == id {
			return cluster
		}
	}
	return nil
}

func (s *State) appById(id string) *sync.Application {
	for _, app := range s.applications {
		if app.ID == id {
			return app
		}
	}
	return nil
}

func main() {
	db, err := sync.OpenDatabase()
	if err != nil {
		panic(err)
	}

	if err := db.Automigrate(); err != nil {
		panic(err)
	}

	transport := resttransport.NewRorHttpTransport(&httpclient.HttpTransportClientConfig{
		BaseURL:      "https://api.ror.nhn.no",
		AuthProvider: httpauthprovider.NewAuthProvider(httpauthprovider.AuthPoviderTypeAPIKey, "dd7994bd-f0a7-41ba-90ee-da335fc12852"),
		Version:      rorversion.NewRorVersion("", ""),
		Role:         "",
	})

	client := rorclient.NewRorClient(transport)

	state := &State{
		applications: make(map[string]*sync.Application),
		instances:    []*sync.Instance{},
		clusters:     []*sync.Cluster{},
	}

	state.clusters, err = getAllClusters(client)
	if err != nil {
		panic(err)
	}

	if err := getAllInstances(state, client); err != nil {
		panic(err)
	}

	db.Wipe()
	db.PersistClusters(state.clusters)
	db.PersistApplications(state.applications)
	db.PersistInstances(state.instances)
	db.Close()
}
