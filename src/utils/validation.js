const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
};

const validateEditProfile = (req) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "gender",
    "headline",
    "location",
    "age",
    "about",
    "photoUrl",
    "skills",
    "linkedIn",
    "instagram",
    "twitter",
    "github",
  ];

  const isAllowedField = Object.keys(req.body).every((field) =>
    allowedFields.includes(field),
  );

  return isAllowedField;
};

module.exports = {
  validateEditProfile,
  validateSignUpData,
};
