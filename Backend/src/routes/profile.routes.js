const express = require("express");
const { getProfile, updateAvatar } = require("../controllers/profile.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

router.use(verifyJWT);

// "avatar" wo naam hai jo form-data mein file ki key hogi
router.patch("/avatar", upload.single("avatar"), updateAvatar);
router.get("/:username", getProfile);

module.exports = router;