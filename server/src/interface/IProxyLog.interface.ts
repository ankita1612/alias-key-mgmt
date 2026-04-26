import { Types } from "mongoose";

export interface IProxyLog {
  _id?: Types.ObjectId;
  proxy_id: Types.ObjectId; // reference to proxy
  action: "CREATE" | "UPDATE" | "DELETE"; // type of action
  desc: string; // log message
  user_id: Types.ObjectId; // reference to User
  meta?: Record<string, any>; // flexible object to store additional data
  created_date?: Date;
}
