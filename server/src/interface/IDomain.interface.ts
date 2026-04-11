export interface IDomain {
  name: string;
  url: string;
  response?: string;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}
