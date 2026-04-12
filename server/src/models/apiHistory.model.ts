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

    request_info: {
      type: Schema.Types.Mixed, // JSON
      required: true,
    },

    response: {
      type: Schema.Types.Mixed, // JSON
      required: true,
    },

    execution_time: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Success", "Fail","Limit_exceed","Alias_key_inactive"],
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const ApiHistoryModel = mongoose.model<IApiHistory>(
  "api_call_history",
  ApiHistorySchema
);

export default ApiHistoryModel;