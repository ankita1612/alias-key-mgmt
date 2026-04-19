export interface IAliasKey {
  _id: string;
  user_id: string;
  domain: string;
  status: string;
  alias_key: string;
  total_quota: number;
  remaining_quota?: number;
  proxy_permission_required?:string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
