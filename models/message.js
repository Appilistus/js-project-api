import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  hearts: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Allow messages without logged-in users
  },
  likedByUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  likedByClients: [{
    type: String,
  }]
})

export const Message = mongoose.model("Message", messageSchema)
