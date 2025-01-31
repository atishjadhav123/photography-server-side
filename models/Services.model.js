const mongoose = require("mongoose")

const servicesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    title: { type: String, required: true },
    desc: { type: String, },
    price: { type: Number, required: true },
    photographerId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // Ensure it's required
    category: {
        type: String,
        enum: ['wedding', 'portrait', 'event', 'fashion', 'sports', 'landscape'], required: true,
    },
    rating: { type: Number, min: 1, max: 5 },
    image: { type: [String], required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model("photoservices", servicesSchema)