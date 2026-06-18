const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const { User } = require("../models/user");

const userRouter = express.Router();

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "age",
      "gender",
      "photoUrl",
      "about",
      "headline",
    ]);

    res.json({
      msg: "requests fetched",
      data: connectionRequests,
    });
  } catch (error) {
    res.status(400).send("some error occured : " + error.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "about",
        "age",
        "gender",
        "photoUrl",
        "headline",
        "location",
        "skills",
        "linkedIn",
        "instagram",
        "twitter",
        "github",
      ])
      .populate("toUserId", [
        "firstName",
        "lastName",
        "about",
        "age",
        "gender",
        "headline",
        "location",
        "photoUrl",
        "skills",
        "linkedIn",
        "instagram",
        "twitter",
        "github",
      ]);

    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({
      msg: "connection fetched",
      data: data,
    });
  } catch (error) {
    res.status(400).send("some error occured : " + error.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit;

    const connectionsRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionsRequests.forEach((cr) => {
      hideUsersFromFeed.add(cr.fromUserId.toString());
      hideUsersFromFeed.add(cr.toUserId.toString());
    });
    // console.log(hideUsersFromFeed);

    const feedUsers = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select("firstName lastName age photoUrl about skills gender")
      .skip(skip)
      .limit(limit);

    res.json({
      msg: "feed fetched",
      feed: feedUsers,
    });
  } catch (error) {
    res.status(400).send("some error occured : " + error.message);
  }
});

//fetching user based on id

userRouter.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      msg: "user fetched",
      data: user,
    });
  } catch (error) {
    res.status(400).send("some error occured : " + error.message);
  }
});
module.exports = userRouter;
