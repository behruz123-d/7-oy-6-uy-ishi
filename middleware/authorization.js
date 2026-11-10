const jwt = require("jsonwebtoken")

const authorization = (req, res, next) => {
  try {
    const bearer = req.headers.authorization

    if (!bearer) {
      return res.status(401).json({
        message: "Bearer token not found"
      })
    }

    const token = bearer.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        message: "Token not found"
      })
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY)
    req.user = decode

    if (decode.role !== "admin") {
      return res.status(403).json({
        message: "You are not admin"
      })
    }

    next()
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

module.exports = authorization
