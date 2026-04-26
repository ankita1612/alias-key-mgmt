import mongoose, { Schema, Document } from "mongoose";
import { IProxyLog } from "../interface/IProxyLog.interface";

export interface IProxyLogDocument extends IProxyLog, Document {}

const ProxyLogSchema = new Schema<IProxyLogDocument>(
  {
    proxy_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "proxy", // ✅ MUST MATCH model name exactly
      required: true,
    },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      required: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    meta: {
      type: Schema.Types.Mixed, // ✅ flexible object
      default: {},
    },
    created_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

export const ProxyLogModel =
  mongoose.models.ProxyLog ||
  mongoose.model<IProxyLogDocument>("ProxyLog", ProxyLogSchema);
