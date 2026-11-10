const express = require("express")
require("dotenv").config()
const cors = require("cors")
const productRouter = require("./router/product.routes")
const authRouter = require("./router/auth.routes")
const bodyparser = require("body-parser")

const app = express()
const PORT = process.env.PORT || 3000
app.use(cors())
// app.use(express.json())
app.use(bodyparser.urlencoded({extended: true}))
app.set("view engine", "ejs")
app.use(express.static("public"))


// router
app.use(productRouter)
app.use(authRouter)

app.listen(PORT, () => {
  console.log("Server is running at: " + PORT);
})
