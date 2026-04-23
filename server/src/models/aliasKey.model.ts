import mongoose, { Schema, model, Document, Types } from "mongoose";
import { IAliasKey } from "../interface/IAliasKey.interface";

export interface IAliasKeyDocument extends IAliasKey, Document {
  user_id: Types.ObjectId;
  parent_key: Types.ObjectId;
}

const AliasKeySchema: Schema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    project_name: {
      type: String,
    },
    domain_name: {
      type: String,
      required: true,
      // trim: true,
    },
    proxy_id: {
      type: Schema.Types.ObjectId,
      ref: "ProxyModel",
    },
    proxy_permission_required: {
      type: String,
    },
    cost_calculation: {
      type: String,
    },
    total_estimated_cost: {
      type: Number,
    },

    alias_key: {
      type: String,
    },
    rejection_reason: {
      type: String,
    },
    approval_status: {
      type: String,
      enum: ["Approved", "Pending", "Rejected"],
      default: "Pending",
    },
    key_status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    total_quota: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    remaining_quota: {
      type: Number,
    },
  },
  {
    timestamps: true, // ✅ createdAt & updatedAt
  },
);

// ✅ Optional compound index (useful for queries)
AliasKeySchema.index({ user_id: 1, parent_key: 1 });

// Add index for getProxyResponse query
AliasKeySchema.index({ alias_key: 1, status: 1, remaining_quota: 1 });

const AliasKeyModel = model<IAliasKeyDocument>("alias_keys", AliasKeySchema);
export default AliasKeyModel;
