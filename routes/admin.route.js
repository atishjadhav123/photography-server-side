const { adminregistrphotografer } = require("../controllers/admin.controller")
const { adminProtected } = require("../middlware/Protected")

const router = require("express").Router()

router
    .post("/add-photografher", adminProtected, adminregistrphotografer)


module.exports = router

//merge short bubble shot 

