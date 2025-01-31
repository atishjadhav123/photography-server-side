const { registerUser, loginUser, logoutnuser, logoutUser } = require("../controllers/auth.controller")

const router = require("express").Router()

router


    .post("/register-user", registerUser)
    .post("/login-user", loginUser)
    .post("/logout-user", logoutUser)

module.exports = router