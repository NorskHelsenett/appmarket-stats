package sync

import (
	"fmt"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Application struct {
	ID   string `gorm:"primaryKey"`
	Name string `gorm:"default:0"`
    SyncID        int64 `gorm:"not null;default:0;index"`
}

type Cluster struct {
	ID          string `gorm:"primaryKey"`
	Name        string `gorm:"default:0"`
	Workspace   string `gorm:"default:0"`
	Environment string `gorm:"default:0"`
    SyncID        int64 `gorm:"not null;default:0;index"`
}

type Instance struct {
	ID            string `gorm:"primaryKey"` // Remove if you don't need this
	ApplicationID string `gorm:"primaryKey;index:idx_instances_cluster_application,priority:2"`
	ClusterID     string `gorm:"primaryKey;index:idx_instances_cluster_application,priority:1"`
	CreatedAt     time.Time `gorm:"autoCreateTime"`
	Billable      bool `gorm:"default:false"`
	SyncID        int64 `gorm:"not null;default:0;index"`
	Application Application `gorm:"foreignKey:ApplicationID;references:ID;constraint:OnDelete:CASCADE"`
	Cluster     Cluster     `gorm:"foreignKey:ClusterID;references:ID;constraint:OnDelete:CASCADE"`
}

type Database struct {
	driver *gorm.DB
}

func OpenDatabase() (*Database, error) {
	dsn := os.Getenv("DB_URL")
	fmt.Print("Got DB URL ? ", dsn)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	return &Database{db}, err
}

func (d *Database) Automigrate() error {
	return d.driver.AutoMigrate(&Application{}, &Cluster{}, &Instance{})
}

func (d *Database) PersistClusters(clusters []*Cluster, syncID int64) error {

	for _, cluster := range clusters {
		old := new(Cluster)
		if tx := d.driver.First(old, "id = ?", cluster.ID); tx.Error != nil {
			if tx.Error != gorm.ErrRecordNotFound {
				fmt.Printf("failed to find cluster: %v\n", tx.Error)
				continue
			}

			result := d.driver.Create(cluster)
			if err := result.Error; err != nil {
				fmt.Printf("failed to insert cluster: %v\n", err)
				continue
			}
		}
		cluster.SyncID = syncID

		if tx := d.driver.Save(cluster); tx.Error != nil {
			fmt.Printf("failed to update cluster: %v\n", tx.Error)
			continue
		}

	}

	return nil
}

func (d *Database) PersistApplications(apps map[string]*Application, syncID int64) error {

	for _, app := range apps {
		old := new(Application)
		if tx := d.driver.First(old, "name = ?", app.Name); tx.Error != nil {
			if tx.Error != gorm.ErrRecordNotFound {
				fmt.Printf("failed to find app: %v\n", tx.Error)
				continue
			}

			result := d.driver.Create(app)
			if err := result.Error; err != nil {
				fmt.Printf("failed to insert app: %v\n", err)
				continue
			}
		}
		app.SyncID = syncID

		if tx := d.driver.Save(app); tx.Error != nil {
			fmt.Printf("failed to update app: %v\n", tx.Error)
			continue
		}
	}

	return nil
}

func (d *Database) PersistInstances(instances []*Instance, syncID int64) error {

	for _, instance := range instances {
		instance.SyncID = syncID
		result := d.driver.Create(instance)
		if err := result.Error; err != nil {
			fmt.Printf("failed to insert instance: %v\n", err)
			continue
		}
	}

	return nil
}

func (d *Database) GetApplications() ([]*Application, error) {
	apps := []*Application{}
	tx := d.driver.Find(&apps)
	return apps, tx.Error
}

func (d *Database) Close() {
}
