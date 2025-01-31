const { contactAdd } = require("../controllers/contact.controller")

const router = require("express").Router()

router
    .post("/sendmessage", contactAdd)

module.exports = router