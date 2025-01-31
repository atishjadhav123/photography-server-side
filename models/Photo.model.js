const mongoose = require('mongoose')

const PhotoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    tags: { type: String, required: true },
    category: { type: String, required: true },
    resolution: { type: String },
    // url: { type: String, required: true },
    hero: { type: [String] },
    price: { type: Number, required: true },
    photographerId: { type: mongoose.Schema.Types.ObjectId, ref: 'photographer' },
    downloads: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('photo', PhotoSchema)