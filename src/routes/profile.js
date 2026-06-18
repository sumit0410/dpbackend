const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfile } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const profileRouter = express.Router();
const upload = require("../middlewares/upload");
const cloudinary = require("../utils/cloudinary");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    return res.send(user);
  } catch (error) {
    res.status(400).send("some error occured : " + error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfile(req)) {
      throw new Error("invalid edit request");
    }
    const loggedInUser = req.user;
    console.log(loggedInUser);
    const isProfileComplete = Boolean(
      loggedInUser.headline &&
      loggedInUser.firstName &&
      loggedInUser.about &&
      loggedInUser.age &&
      loggedInUser.gender &&
      loggedInUser.skills &&
      loggedInUser.skills.length > 0,
    );

    loggedInUser.profileCompleted = isProfileComplete;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    console.log(loggedInUser);
    await loggedInUser.save();
    res.json({
      msg: "Profile Updated",
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).json({
      msg: error.message,
    });
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    if (!req.body["password"]) {
      throw new Error("only password reset allowed");
    }
    const user = req.user;
    const { password } = req.body;
    if (!validator.isStrongPassword(password)) {
      throw new Error("please enter a strong password");
    }
    const isSamePassword = await user.validatePassword(password);
    if (isSamePassword) {
      throw new Error("password can't be same as previous");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    res.send({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(400).send("some error occured : " + error.message);
  }
});

console.log(cloudinary.config());
//profile picture upload
profileRouter.post(
  "/profile/upload-photo",
  upload.single("photo"),
  async (req, res) => {
    try {
      console.log(req.file);

      const result = await cloudinary.uploader.upload(req.file.path);

      res.json({
        photoUrl: result.secure_url,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: error.message,
      });
    }
  },
);

module.exports = profileRouter;
