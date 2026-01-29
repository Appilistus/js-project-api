import express from "express"
import cors from "cors"
import "dotenv/config"
import mongoose from "mongoose"
import listEndpoints from "express-list-endpoints"

import dataJson from "./data.json"

let happyThoughts = dataJson
const mongoUrl = process.env.MONGO_URL
mongoose.connect(mongoUrl)

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Mongoose schema
const messageSchema = new mongoose.Schema({
  _id: String,
  message: {
    type: String,
    required: true,
  },
  hearts: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  }
})

const Message = mongoose.model("Message", messageSchema)

// Add seeding of DB
if (process.env.RESET_DB === "true") {
  const seedDatabase = async () => {
    await Message.deleteMany()

    happyThoughts.forEach((message) => {
      new Message(message).save()
    })
  }
  seedDatabase()
}

// Start defining your routes here
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)

  res.json({
    endpoints: endpoints,
  })
})

// Filter: has hearts or not
app.get("/messages", async (req, res) => {
  const { hasHearts } = req.query

  const query = {}

  if (hasHearts === "true") {
    query.hearts = { $gt: 0 }
  }

  try {
    const filteredMessages = await Message.find(query)

    if (filteredMessages.length === 0) {
      return res.status(404).json({
        success: false,
        response: [],
        message: "No messages found",
      })
    }

    return res.status(200).json({
      success: true,
      response: filteredMessages,
      message: "Success",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: [],
      message: error,
    })
  }
  // let filteredMessages = happyThoughts

  // if(hasHearts === "true") {
  //   filteredMessages = filteredMessages.filter((m) => m.hearts > 0)
  // }

  // if(hasHearts ==="false") {
  //   filteredMessages = filteredMessages.filter((m) => m.hearts === 0 )
  // }

  //   res.json(filteredMessages)
})


// Get message id and return a single message
app.get("/messages/:id", async (req, res) => {
  const id = req.params.id

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        response: null,
        message: "Invalid ID format",
      })
    }

    const message = await Message.findById(id)

    if (!message) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Message not found",
      })
    }

    return res.status(200).json({
      success: true,
      response: message,
      message: "Success"
    })
  } catch {
    return res.status(500).json({
      success: false,
      response: null,
      message: error,
    })
  }
  // const message = happyThoughts.find((m) => m._id === id)

  // if(!message) {
  //   return res
  //     .status(404)
  //     .json({ error: `Message with id ${id} not found`})
  // }

  // res.json(message)
})


// Post new messages and save
app.post("/messages", async (req, res) => {
  const body = req.body

  try {
    const newMessage = {
      message: body.message,
      hearts: 0,
      createdAt: new Date().toISOString(),
    }

    const createdMessage = await new Message(newMessage).save()

    return res.status(201).json({
      success: true,
      response: createdMessage,
      message: "Success"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: error,
    })
  }
  // const newMessage = {
  //   "_id": crypto.randomUUID(),
  //   "message": body.message,
  //   "hearts": 0,
  //   "createdAt": new Date().toISOString(),
  // }

  // happyThoughts.push(newMessage)
  // res
  //   .status(201)
  //   .json(newMessage)
})

// Delete a message
app.delete("/messages/:id", (req, res) => {
  const id = req.params.id
  const message = happyThoughts.find((m) => m._id === id)

  if(!message) {
    return res
      .status(404)
      .json({ error: `Message with id ${id} not found`})
  }

  const newMessages = happyThoughts.filter((m) => m._id !== id)
  
  happyThoughts = newMessages

  res.json(message)
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
