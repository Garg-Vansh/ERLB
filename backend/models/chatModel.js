const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    sessionId: {
        type: String,
        default: null
    },

    userMessage: {
        type: String,
        required: true
    },

    botResponse: {
        type: String,
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("Chat", chatSchema)
