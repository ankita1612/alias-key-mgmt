export interface IAliasKey {
  _id: string;
  user_id: string;
  project_name?: string;
  domain_name: string;
  proxy_id?: string;
  proxy_permission_required?: string;
  cost_calculation?: string;
  total_estimated_cost?: number;
  alias_key: string;
  rejection_reason?: string;
  approval_status: "Approved" | "Pending" | "Rejected";
  key_status: "Active" | "Inactive";
  total_quota: number;
  description?: string;
  remaining_quota?: number;
  createdAt: Date;
  updatedAt: Date;
}
