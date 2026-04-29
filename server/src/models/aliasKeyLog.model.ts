import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAliasKeyLogDocument extends IAliasKeyLog, Document {}

const AliasKeyLogSchema = new Schema<IAliasKeyLogDocument>(
  {
    alias_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "alias_keys", // ✅ MUST MATCH EXACTLY
    },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "RESTORE"],
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

export const AliasKeyLogModel =
  mongoose.models.AliasKeyLog ||
  mongoose.model<IAliasKeyLogDocument>("AliasKeyLog", AliasKeyLogSchema);
