import mongoose, { Schema, Document } from "mongoose";

export interface IProxy extends Document {
  domain: string;
  project_name: string;
  proxy_name: string;
  proxy_token: string;
  curl: string;
  credit: number;
}

const ProxySchema: Schema = new Schema(
  {
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    project_name: {
      type: String,
      required: true,
      trim: true,
    },
    proxy_name: {
      type: String,
      required: true,
      trim: true,
    },
    proxy_token: {
      type: String,
      required: true,
      trim: true,
    },
    curl: {
      type: String,
      required: true,
    },
    credit: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IProxy>("Proxy", ProxySchema);
