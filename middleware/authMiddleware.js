import { User } from "../models/user.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      accessToken: req.header("Authorization").replace("Bearer ", ""),
    })
    if (user) {
      req.user = user
      next()
    } else {
      res.status(401).json({
        success: false,
        message: "Authentication missing or invalid",
        logOut: true,
      })
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    })
  }
}

// Middleware to optionally authenticate user
export const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "")
    const user = await User.findOne({ accessToken: token })
    if (user) req.userId = user._id.toString()
  }

  next()
}