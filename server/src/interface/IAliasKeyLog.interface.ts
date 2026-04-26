import { Types } from "mongoose";

export interface IAliasKeyLog {
  _id?: Types.ObjectId;

  alias_id: Types.ObjectId; // reference to AliasKey
  history: string; // log message
  user_id: Types.ObjectId; // reference to User
  meta?: Record<string, any>;
  created_date?: Date;
}
