import mongoose, { Schema, Document } from "mongoose";
import { IDomain } from "../interface/IDomain.interface";

export interface IDomainDocument extends IDomain, Document {}

const DomainSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true, // ✅ adds createdAt & updatedAt
  },
);

export const DomainModel = mongoose.model<IDomainDocument>(
  "domains",
  DomainSchema,
);
