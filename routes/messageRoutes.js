import express from "express";
import { Message } from "../models/message.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { optionalAuthenticate } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";
import { User } from "../models/user.js";

const router = express.Router()

// Get all messages with optional filtering and sorting
router.get("/", async (req, res) => {
  // default: newest messages first
  const { hasHearts, sort = "createdAt", order = "desc" } = req.query

  const query = {}

  if (hasHearts === "true") {
    query.hearts = { $gt: 0 }
  } else if (hasHearts === "false") {
    query.hearts = 0
  }

  // Validate sort field and order
  const sortFields = ["createdAt", "hearts"]
  const sortField = sortFields.includes(sort) ? sort : "createdAt"
  const sortOrder = order === "asc" ? 1 : -1

  try {
    const messages = await Message.find(query).sort({ [sortField]: sortOrder })
    return res.status(200).json({
      success: true,
      response: messages,
      message: "Success"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: [],
      message: error.message,
    })
  }
})

// Get message id and return a single message
router.get("/:id", async (req, res) => {
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
      message: error.message,
    })
  }
})

// Post a new message
router.post("/", optionalAuthenticate, async (req, res) => {
  const body = req.body

  try {
    const newMessage = await new Message({
      message: body.message,
      hearts: 0,
      createdAt: new Date().toISOString(),
      userId: req.userId || null, // Set userId if authenticated, else null
    }).save()

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
      message: error.message,
    })
  }
})

// Like a message
router.patch("/:id/like", async (req, res) => {
  const id = req.params.id
  const authHeader = req.header("Authorization")
  const clientId = req.header("X-Client-Id")
  
  try {
    const message = await Message.findById(id)

    if(!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      })
    }

    message.likedByClients = message.likedByClients || []

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "")
      const user = await User.findOne({ accessToken: token })

      // Handle like from authenticated user
      if(!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token",
        })
      }

      message.hearts += 1
      await message.save()

      return res.status(200).json({
        success: true,
        response: message,
      })
    }

    // Handle like from unauthenticated client using clientId
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Client ID missing",
      })
    }

    if (message.likedByClients.includes(clientId)) {
      return res.status(400).json({
        success: false,
        message: "Already liked this message",
      })
    }

    message.hearts += 1
    message.likedByClients.push(clientId)
    await message.save()

    return res.status(200).json({
      success: true,
      response: message,
    })
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: error.message,
    })
  }
})

// Delete a message
router.delete("/:id", authenticateUser, async (req, res) => {
  const id = req.params.id
  try {
    const message = await Message.findById(id)

    if(!message) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Message not found",
      })
    }
    
    // Anonymous messages cannot be deleted
    if (!message.userId) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to delete this message",
      })
    }

    // Check if the user is the owner of the message
    if (message.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to delete this message",
      })
    }
    await Message.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      response: { deletedId: id },
      message: "Message deleted",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: error.message,
    })
  }
})

export default router
