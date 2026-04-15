export interface IProxy {
  _id: string;
  domain: string;
  project_name: string;
  proxy_name: string;
  proxy_token: string;
  curl: string;
  credit: number;
  createdAt: Date;
  updatedAt: Date;
}
