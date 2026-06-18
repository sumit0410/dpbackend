const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const { User } = require("../models/user");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      //finding the toUser
      const toUser = await User.findById(toUserId);

      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ msg: "invalid request type" });
      }

      if (!toUser) {
        return res.status(404).json({ msg: "User not found" });
      }

      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingRequest) {
        return res
          .status(400)
          .json({ msg: "Connection request already exist" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const requestData = await connectionRequest.save();

      console.log(
        `${req.user.firstName} has shown interest in ${toUser.firstName}`,
      );
      res.json({
        msg: req.user.firstName + " " + status + " " + toUser.firstName,
        requestData,
      });
    } catch (error) {
      res.status(400).send("some error occured : " + error.message);
    }
  },
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ msg: "Status is not allowed" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.status(404).json({ msg: "connection request not found" });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      res.json({ msg: "connection request " + status, data: data });
    } catch (error) {
      res.status(400).send("some error occured : " + error.message);
    }
  },
);

module.exports = requestRouter;
