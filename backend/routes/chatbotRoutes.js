const express = require("express")
const router = express.Router()

const { getChatResponse } = require("C:/Users/vansh/OneDrive/Desktop/erlb/code/website/backend/controllers/chatControllers.js")

router.post("/", getChatResponse)

module.exports = router
