const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toUserId: {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is invalid status type`,
      },
    },
  },
  {
    timestamps: true,
  },
);

connectionRequestSchema.index({ firstName: 1, lastName: 1 });

connectionRequestSchema.pre("save", function () {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("You can't send the connection request to yourself");
  }
});

const ConnectionRequestModel = new mongoose.model(
  "connectionRequest",
  connectionRequestSchema,
);
module.exports = ConnectionRequestModel;
