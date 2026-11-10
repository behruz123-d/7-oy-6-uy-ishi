const { Router } = require("express")
const { register, login, verify, getSignUp } = require("../controller/auth.controller")

const authRouter = Router()

authRouter.get("/signup", getSignUp)
authRouter.post("/register", register)
authRouter.post("/verify", verify)
authRouter.post("/login", login)

module.exports = authRouter
