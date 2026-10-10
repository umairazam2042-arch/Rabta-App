const multer = require("multer");
const ApiError = require("../utils/ApiError");

// File disk par nahi, RAM mein rahegi (phir seedha ImageKit ko jayegi)
const storage = multer.memoryStorage();

// Sirf image files allowed hain
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only image files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

module.exports = upload;