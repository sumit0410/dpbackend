const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  location: {
    type: String,
  },
  headline: {
    type: String,
    maxlength: [80, "Headline cannot exceed 80 characters"],
  },
  about: {
    type: String,
    maxlength: [400, "Headline cannot exceed 80 characters"],
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
  },
  skills: {
    type: [String],
  },
  photoUrl: {
    type: String,
  },
  github: {
    type: String,
  },
  linkedIn: {
    type: String,
  },
  instagram: {
    type: String,
  },
  twitter: {
    type: String,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
});

userSchema.methods.getJWT = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, "SUMIT@@DevTinder", {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = function (passwordByUserInput) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = bcrypt.compare(passwordByUserInput, passwordHash);
  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
