import { Schema, model } from "mongoose";
import { IParentKey } from "../interface/IParentKey.interface";

const ParentKeySchema: Schema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users", // 👈 make sure your user model name is "users"
      required: true,
    },
    parent_key: {
      type: String,
      required: true,
      trim: true,
      unique: true, // optional but recommended
    },
    total_quota: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    remaining_quota: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // ✅ adds createdAt & updatedAt
  },
);

export const ParentKey = model<IParentKey>("parent_keys", ParentKeySchema);
