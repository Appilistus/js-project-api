// import cors from "cors"
// import express from "express"
// import data from "./data.json"
// import crypto from "crypto"

// let messages = [...data]


// // Defines the port the app will run on. Defaults to 8080, but can be overridden
// // when starting the server. Example command to overwrite PORT env variable value:
// // PORT=9000 npm start
// const port = process.env.PORT || 8080
// const app = express()

// // Add middlewares to enable cors and json body parsing
// app.use(cors())
// app.use(express.json())

// // Start defining your routes here
// app.get("/", (req, res) => {
//   res.send("Hello Technigo!")
// })

// // Get message id and return a single message
// app.get("/messages/:id", (req, res) => {
//   const { id } = req.params
//   const message = messages.find((message) => message._id === id)

//   if(!message) {
//     return res
//       .status(404)
//       .json({ error: "Message not found"})
//   }

//   res.json(message)
// })

// // Post new messages
// app.post("/messages", (req, res) => {
//   const { message } = req.body

//   if(!message || typeof message !== "string") {
//     return res
//       .status(400)
//       .json({ error: "Message is required"})
//   }

//   const trimmed = message.trim()
//   if(trimmed.length < 5 || trimmed.length > 140) {
//     return res
//       .status(400)
//       .json({ error: "Message must be between 5 and 140 characters"})
//   }

//   const newMessage = {
//     _id: crypto.randomUUID(),
//     message: trimmed,
//     hearts: 0,
//     createdAt: new Date().toISOString(),
//   }

//   messages.unshift(newMessage)
//   res.status(201).json(newMessage)
// })

// // Like a message
// app.post("/messages/:id/like", (req, res) => {
//   const { id } = req.params
//   const message = messages.find((message) => message._id === id)

//   if (!message) {
//     return res
//       .status(404)
//       .json({ error: "Message not found" })
//   }
//   message.hearts += 1
//   res.json(message)
// })

// app.get("/messages", (req, res) => {
//   const limit = Number(req.query.limit) || 20
//   const sorted = [...messages].sort(
//     (a,b) => new Date(b.createdAt) - new Date(a.createdAt)
//   )
//   res.json(sorted.slice(0, limit))
// })

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`)
// })


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
