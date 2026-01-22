import express from "express"
import cors from "cors"
import crypto from "crypto"
import listEndpoints from "express-list-endpoints"

import dataJson from "./data.json"

let happyThoughts = dataJson


// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Start defining your routes here
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)

  res.json({
    endpoints: endpoints,
  })
})

// Get message id and return a single message
app.get("/messages/:id", (req, res) => {
  const id = req.params.id
  const message = happyThoughts.find((m) => m._id === id)

  if(!message) {
    return res
      .status(404)
      .json({ error: `Message with id ${id} not found`})
  }

  res.json(message)
})

// Filter: has hearts or not
app.get("/messages", (req, res) => {
  const { hasHearts } = req.query

    let filteredMessages = happyThoughts

    if(hasHearts === "true") {
      filteredMessages = filteredMessages.filter((m) => m.hearts > 0)
    }

    if(hasHearts ==="false") {
      filteredMessages = filteredMessages.filter((m) => m.hearts === 0 )
    }

    res.json(filteredMessages)
})

// Post new messages
app.post("/messages", (req, res) => {
  const body = req.body
  const newMessage = {
    "_id": crypto.randomUUID(),
    "message": body.message,
    "hearts": 0,
    "createdAt": new Date().toISOString(),
  }

  happyThoughts.push(newMessage)
  res.json(newMessage)
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
