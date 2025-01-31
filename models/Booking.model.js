const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'photoservices', required: true },
    photographerId: { type: mongoose.Schema.Types.ObjectId, ref: 'photoservices' },
    rating: { type: Number, min: 1, max: 5, default: null },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
}, { timestamps: true })

module.exports = mongoose.model("booking", bookingSchema);
