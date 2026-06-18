const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dtw3sm0px",
  api_key: "218692567196779",
  api_secret: "PVQtzlyW_6deRBS76V-2hmV6WWE",
});

module.exports = cloudinary;
