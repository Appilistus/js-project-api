import express from "express"
import cors from "cors"
import "dotenv/config"
import mongoose from "mongoose"
import listEndpoints from "express-list-endpoints"

import userRoutes from "./routes/userRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"

const mongoUrl = process.env.MONGO_URL
mongoose.connect(mongoUrl)

const port = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)

  res.json({
    message: "Welcome to Happy Thoughts API!",
    endpoints: endpoints,
  })
})

app.use("/users", userRoutes)
app.use("/messages", messageRoutes)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
