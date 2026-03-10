const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("C:/Users/vansh/OneDrive/Desktop/erlb/code/website/backend/controllers/authController.js");

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

module.exports = router;
