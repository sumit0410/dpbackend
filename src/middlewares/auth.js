const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      res.status(401).send("Please Login!");
    }

    const decodeMsg = await jwt.verify(token, process.env.JWT_SECRET);

    const { _id } = decodeMsg;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        msg: "Session expired please login again",
      });
    }
    res.send("Error : " + error.message);
  }
};

module.exports = {
  userAuth,
};
