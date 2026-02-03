import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.js";

const router = express.Router()

// Create a new user
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body
    
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An error occurred when creating user",
      })
    }

    const salt = bcrypt.genSaltSync()
    const hashedPassword = bcrypt.hashSync(password, salt)
    const user = new User({ name, email, password: hashedPassword })

    await user.save()

    res.status(200).json({
      success: true,
      message: "User created successfully",
      response: {
        email: user.email,
        userId: user._id,
        accessToken: user.accessToken,
      }
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create user",
      response: error,
    })
  }
})

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email: email.toLowerCase() })

    if(user && bcrypt.compareSync(password, user.password)) {
      res.json({
        success: true,
        message: "Login successful",
        response: {
          email: user.email,
          id: user._id,
          accessToken: user.accessToken,
        }
      })
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
        response: null,
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      response: error,
    })
  }
})

export default router