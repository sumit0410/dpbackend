const express = require("express");
const { User } = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");

const authRouter = express.Router();

//Saving user into the database
authRouter.post("/signup", async (req, res) => {
  try {
    //data validation
    validateSignUpData(req);
    //encrypt password
    const {
      firstName,
      lastName,
      email,
      password,
      skills,
      gender,
      age,
      about,
      photoUrl,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userAlreadyExist = await User.findOne({ email: email });
    if (userAlreadyExist) {
      throw new Error("User aleady exist with this email");
    }
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      about,
      gender,
      age,
      skills,
      photoUrl,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();
    res.cookie("token", token);
    res.json({
      msg: `welcome ${user.firstName}! Please complete your profile`,
      data: savedUser,
      profileCompleted: user.profileCompleted,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//login

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    //validating email
    if (!validator.isEmail(email)) {
      throw new Error("Email is not valid");
    }
    //finding user with the email entered.
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Incorrect email or password");
    }
    //checking if the password is same in db
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Incorrect email or password");
    } else {
      const token = await user.getJWT();
      res.cookie("token", token);
      res.json({
        msg: `Welcome back ${user.firstName}!`,
        user: user,
        profileCompleted: user.profileCompleted,
      });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

authRouter.post("/auth/google", async (req, res) => {
  const { name, email } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      firstName: name,
      email,
    });
  }

  const token = await user.getJWT();
  res.cookie("token", token);
  res.json({
    msg: "Login successful",
    user,
    profileCompleted: user.profileCompleted,
  });
});
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  res.send("logout successfull");
});
module.exports = authRouter;
