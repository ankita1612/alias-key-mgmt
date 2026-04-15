export interface IAliasKey {
  user_id: string; // ObjectId reference (users)
  parent_key: string; // ObjectId reference (parent_keys)
  alias_key: string;
  domain: string;
  status: "Active" | "Inactive" | "Pending" | "Rejected";
  total_quota: number;
  remaining_quota: number;
  description?: String;
  createdAt?: Date;
  updatedAt?: Date;
}
