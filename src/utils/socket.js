const socket = require("socket.io");
const { Chat } = require("../models/chat");
const crypto = require("crypto");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5174",
    },
  });

  const hashRoomId = (id) => {
    return crypto.createHash("sha256").update(id).digest("hex");
  };
  io.on("connection", (socket) => {
    //handle events
    socket.on("joinChat", ({ loggedInUserId, targetUserId, firstName }) => {
      const roomId = hashRoomId(
        [loggedInUserId, targetUserId].sort().join("_"),
      );
      console.log(firstName + " joining room : " + roomId);

      socket.join(roomId);
    });
    socket.on(
      "sendMessage",
      async ({ firstName, loggedInUserId, targetUserId, text, time }) => {
        try {
          const roomId = hashRoomId(
            [loggedInUserId, targetUserId].sort().join("_"),
          );
          console.log(firstName + " " + text);
          //save msgs into db...
          let chat = await Chat.findOne({
            participants: {
              $all: [loggedInUserId, targetUserId],
            },
          });

          if (!chat) {
            chat = new Chat({
              participants: [loggedInUserId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: loggedInUserId,
            text,
          });

          await chat.save();
          io.to(roomId).emit("messageReceived", {
            firstName,
            text,
            time,
          });
        } catch (error) {
          res.status(400).send(error.message);
        }
      },
    );
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
