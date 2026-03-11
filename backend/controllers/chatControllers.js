const chatbotFlow = require("../data/chatbotFlow.json")
const Chat = require("../models/chatModel")

exports.getChatResponse = async (req, res) => {

    try {

        const { node, userMessage, userId, sessionId } = req.body

        // Ensure identity exists
        if (!userId && !sessionId) {
            return res.status(400).json({
                message: "Either userId or sessionId is required"
            })
        }

        const currentNode = node || "start"

        const response = chatbotFlow[currentNode]

        if (!response) {
            return res.status(404).json({
                message: "Chat node not found"
            })
        }

        // Save chat in MongoDB
        await Chat.create({
            userId: userId || null,
            sessionId: sessionId || null,
            userMessage: userMessage || "User clicked option",
            botResponse: response.message
        })

        res.json(response)

    } catch (error) {

        console.error(error)

        res.status(500).json({
            message: "Server error"
        })

    }

}
