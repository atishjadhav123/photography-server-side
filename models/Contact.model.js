const mongoose = require("mongoose")

const contactSchema = new mongoose.Schema({
    name: { type: String, require: true },
    email: { type: String, require: true },
    message: { type: String, require: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
}, {})

module.exports = mongoose.model("contact", contactSchema)