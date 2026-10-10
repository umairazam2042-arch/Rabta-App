const express = require("express");
const {
  createStatus,
  getStatuses,
  deleteStatus,
} = require("../controllers/status.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(verifyJWT);

router.get("/", getStatuses);
router.post("/", createStatus);
router.delete("/:id", deleteStatus);

module.exports = router;