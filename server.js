import express from "express"
import cors from "cors"
import "dotenv/config"
import mongoose from "mongoose"
import listEndpoints from "express-list-endpoints"

import userRoutes from "./routes/userRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"

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

// Add seeding of DB
if (process.env.RESET_DB === "true") {
  const seedDatabase = async () => {
    await Message.deleteMany()
    await Message.insertMany(happyThoughts)
    console.log("DB seeded!");
  }
  seedDatabase()
}

// Start defining your routes here
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)

  res.json({
    message: "Welcome to Happy Thoughts API!",
    endpoints: endpoints,
  })
})

// Import routes
app.use("/users", userRoutes)
app.use("/messages", messageRoutes)

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
