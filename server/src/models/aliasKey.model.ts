import mongoose, { Schema,model, Document, Types } from "mongoose";
import { IAliasKey } from "../interface/IAliasKey.interface";


export interface IAliasKeyDocument extends IAliasKey, Document {
  user_id: Types.ObjectId;
  parent_key: Types.ObjectId;
}

const AliasKeySchema: Schema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User", // ✅ FIX
    },

    parent_key: {
      type: Schema.Types.ObjectId,
      ref: "ParentKey", // ✅ FIX
    },
    alias_key: {
      type: String,
      //  required: true,
      //  unique: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      // trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending", "Rejected"],
      default: "Pending",
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
export default  AliasKeyModel;
