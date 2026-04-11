import { Document, Types } from "mongoose";

export interface IApiHistory extends Document {
  user_id: Types.ObjectId;
  user_alias_key_id: Types.ObjectId;

  request_info: Record<string, any>;
  response: Record<string, any>;

  execution_time: string; // in ms

  status: "Success" | "Fail";

  createdAt?: Date;
  updatedAt?: Date;
}