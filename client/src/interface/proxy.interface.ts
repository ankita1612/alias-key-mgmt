export interface IProxy {
  _id: string;
  domain_name: string;
  project_name: string;
  proxy_name: string;
  proxy_token: string;
  curl: string;
  curl_token: string;
  credit: number;
  createdAt: Date;
  updatedAt: Date;
}
