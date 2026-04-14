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
      enum: ["LIMIT_EXCEED", "SUCCESS", "INTERNAL_SEREVER", "KEY_NOT_ACTIVE"],
      default: "SUCCESS",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

const ApiHistoryModel = mongoose.model<IApiHistory>(
  "api_call_history",
  ApiHistorySchema,
);

export default ApiHistoryModel;
