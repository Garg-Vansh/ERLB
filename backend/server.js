const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()
const chatRoutes = require("C:/Users/vansh/OneDrive/Desktop/erlb/code/website/backend/routes/chatbotRoutes.js")
const authRoutes = require("C:/Users/vansh/OneDrive/Desktop/erlb/code/website/backend/routes/authRoutes.js")

const app = express()

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/chat", chatRoutes)

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err))

app.get("/", (req, res) => {
    res.send("ERLB Backend Running")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
