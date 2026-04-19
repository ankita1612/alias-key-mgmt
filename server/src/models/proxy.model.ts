import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IProxy extends Document {
  domain_name: string;
  project_name: string;
  proxy_name: string;
  proxy_token: string;
  curl: string;
  curl_token?: string;
  query_params: Record<string, string>;
  credit: number;
  counter: number;
}

const ProxySchema: Schema = new Schema(
  {
    domain_name: {
      type: String,
    },
    project_name: {
      type: String,
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
    curl_token: {
      type: String,
      trim: true,
    },
    curl: {
      type: String,
      required: true,
      trim: true,
    },
    query_params: {
      type: Map,
      of: String,
      default: {},
    },
    credit: {
      type: Number,
      default: 0,
    },
    counter: {
      type: Number,
      default: 0,
    },
    is_deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const ProxyModel = model<IProxy>("proxy", ProxySchema);
export default ProxyModel;
