import mongoose, { Schema } from "mongoose";
import { IApiHistory } from "../interface/IApiHistory";

const ApiHistorySchema = new Schema<IApiHistory>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user_alias_key_id: {
      type: Schema.Types.ObjectId,
      ref: "alias_keys",
      required: true,
    },
    method: {
      type: String,
      required: true,
    },

    execution_time: {
      type: String,
      required: true,
    },
    response_status: {
      type: String,
      required: true,
    },
    response_msg: {
      type: String,
      required: true,
    },
    response_code: {
      type: Number,
      required: true,
    },
    response_code_str: {
      type: String,
      enum: [
        "LIMIT_EXCEED",
        "SUCCESS",
        "INTERNAL_SERVER",
        "KEY_NOT_ACTIVE",
        "EXTERNAL_ERROR",
        "INVALID_PROXY",
        "PARAM_MISSING",
      ],
      default: "SUCCESS",
    },
    request_params: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

ApiHistorySchema.index({ user_id: 1, createdAt: -1 });
ApiHistorySchema.index({ user_alias_key_id: 1 });
ApiHistorySchema.index({ response_code: 1 });
ApiHistorySchema.index({ response_status: 1 });
ApiHistorySchema.index({ execution_time: 1 });
ApiHistorySchema.index({ method: 1 });
ApiHistorySchema.index({ user_id: 1, user_alias_key_id: 1, createdAt: -1 });

const ApiHistoryModel = mongoose.model<IApiHistory>(
  "api_history",
  ApiHistorySchema,
);

export default ApiHistoryModel;
