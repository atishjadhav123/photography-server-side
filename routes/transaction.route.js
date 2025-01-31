const { createTransaction, initiatePayment, getallTransaction } = require("../controllers/transaction.controller")
const { UserProtected } = require("../middlware/Protected")

const router = require("express").Router()

router


    .post("/create-transaction", UserProtected, createTransaction)
    .post("/initiate-payment", UserProtected, initiatePayment)
    .get("/getalltransaction", getallTransaction)

module.exports = router