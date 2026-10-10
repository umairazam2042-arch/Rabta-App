const express = require("express");
const { getAllUsers, getUserById, getStats, deleteUser } = require("../controllers/admin.controller");
const { verifyJWT, authorizeRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

// Is file ke sab routes ke liye: pehle login check, phir admin role check
router.use(verifyJWT, authorizeRoles("admin"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.delete("/users/:id", deleteUser);

module.exports = router;