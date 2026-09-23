export interface App {
  id: number;
  name: string;
  instance_count: number;
}

export interface Cluster {
  id: number;
  name: string;
  environment: string;
  workspace: string;
}

export interface Instance {
  id: number;
  application_id: string;
  cluster_id: string;
  billable: boolean;
  version: string;
}

export interface AppInstall {
  app: string;
  installs: number;
}