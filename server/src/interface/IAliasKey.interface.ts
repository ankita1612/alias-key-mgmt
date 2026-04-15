export interface IAliasKey {
  user_id: string; // ObjectId reference (users)
  proxy_id: string; // ObjectId reference (parent_keys)
  project_name: string;
  proxy_permission_required: string;
  cost_calculation: string;
  total_estimated_cost: number;
  alias_key: string;
  domain: string;
  status: "Active" | "Inactive" | "Pending" | "Rejected";
  total_quota: number;
  remaining_quota: number;
  description?: String;
  createdAt?: Date;
  updatedAt?: Date;
}
