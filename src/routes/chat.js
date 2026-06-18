const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const { targetUserId } = req.params;
    let chat = await Chat.findOne({
      participants: {
        $all: [loggedInUserId, targetUserId],
      },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [loggedInUserId, targetUserId],
        messages: [],
      });
    }

    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(400).send("some error occured : " + error.message);
  }
});

module.exports = chatRouter;
