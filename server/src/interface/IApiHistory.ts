import { Document, Types } from "mongoose";

export interface IApiHistory extends Document {
  user_id: Types.ObjectId;
  user_alias_key_id: Types.ObjectId;
  method: string;
  response_code_str: string;
  execution_time: string; // in ms
  response_status: string;
  response_msg: string;
  response_code: number;
  createdAt?: Date;
  updatedAt?: Date;
}
