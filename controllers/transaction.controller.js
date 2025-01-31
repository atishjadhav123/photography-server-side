const asyncHandler = require("express-async-handler")
const TransactionModel = require("../models/Transaction.model")
const Razorpay = require("razorpay")
const crypto = require("crypto")
const { default: mongoose } = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const rz = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SCERET_KEY,
})

exports.initiatePayment = asyncHandler(async (req, res) => {
    try {
        const { amount } = req.body
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" })
        }
        const order = await rz.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: Date.now().toString(),
        })
        res.json({ message: "Payment initiated successfully", result: order })
    } catch (error) {
        console.error("Error in initiating payment:", error)
        res.status(500).json({ message: "Unable to initiate payment" })
    }
})

exports.createTransaction = asyncHandler(async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, amount } = req.body
        // console.log("Request Body:", req.body)

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !amount) {
            return res.status(400).json({ message: "Missing required fields" })
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId format" })
        }
        if (!process.env.RAZORPAY_SCERET_KEY) {
            return res.status(500).json({ message: "Secret key is missing" })
        }
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SCERET_KEY)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex")
        // console.log("RAZORPAY_SECRET_KEY:", process.env.RAZORPAY_SCERET_KEY)
        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid signature, please contact your bank" })
        }
        await TransactionModel.create({
            userId,
            photoId: req.body.photoId,
            amount,
            paymentMethod: "Razorpay",
            timestamp: new Date(),
        })
        res.json({ message: "Transaction recorded successfully" })
    } catch (error) {
        console.error("Error in creating transaction:", error)
        res.status(500).json({ message: "Unable to record transaction" })
    }
})

exports.getallTransaction = asyncHandler(async (req, res) => {
    try {
        const transactions = await TransactionModel.find()

        if (!transactions.length) {
            return res.status(404).json({ message: "No transactions found" })
        }

        res.json({ message: "Transactions fetched successfully", result: transactions })
    } catch (error) {
        console.error("Error fetching transactions:", error)
        res.status(500).json({ message: "Unable to fetch transactions" })
    }
})


