export interface IParentKey {
  user_id: string; // ObjectId reference
  parent_key: string;
  total_quota: number;
  remaining_quota: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
