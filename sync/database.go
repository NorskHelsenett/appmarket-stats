package sync

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Application struct {
	ID   string `gorm:"primaryKey"`
	Name string
}

type Cluster struct {
	ID        string `gorm:"primaryKey"`
	Name      string
	Workorder string
}

type Instance struct {
	ID            string `gorm:"primaryKey"` // Remove if you don't need this
	ApplicationID string `gorm:"primaryKey"`
	ClusterID     string `gorm:"primaryKey"`

	Application Application `gorm:"foreignKey:ApplicationID;references:ID;constraint:OnDelete:CASCADE"`
	Cluster     Cluster     `gorm:"foreignKey:ClusterID;references:ID;constraint:OnDelete:CASCADE"`
}

type Database struct {
	driver *gorm.DB
}

func OpenDatabase() (*Database, error) {
	dsn := "host=localhost user=acr123 password=acr123 dbname=acr port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	return &Database{db}, err
}

func (d *Database) Automigrate() error {
	return d.driver.AutoMigrate(&Application{}, &Cluster{}, &Instance{})
}

func (d *Database) Wipe() error {
	return d.driver.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("DELETE FROM instances").Error; err != nil {
			return err
		}
		if err := tx.Exec("DELETE FROM applications").Error; err != nil {
			return err
		}
		if err := tx.Exec("DELETE FROM clusters").Error; err != nil {
			return err
		}
		return nil
	})
}

func (d *Database) PersistClusters(clusters []*Cluster) error {
	for _, cluster := range clusters {
		result := d.driver.Create(cluster)
		if err := result.Error; err != nil {
			fmt.Printf("failed to insert cluster: %v\n", err)
			continue
		}
	}

	return nil
}

func (d *Database) PersistApplications(apps map[string]*Application) error {
	for _, app := range apps {
		result := d.driver.Create(app)
		if err := result.Error; err != nil {
			fmt.Printf("failed to insert app: %v\n", err)
			continue
		}
	}

	return nil
}

func (d *Database) PersistInstances(instances []*Instance) error {
	for _, instance := range instances {
		result := d.driver.Create(instance)
		if err := result.Error; err != nil {
			fmt.Printf("failed to insert instance: %v\n", err)
			continue
		}
	}
	return nil
}

func (d *Database) Close() {
}
