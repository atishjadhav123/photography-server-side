const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, required: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    role: { type: String, enum: ['admin', 'photographer', 'user'] },
    role: { type: String, default: "admin" },
    profilePicture: { type: String },
    adminId: { type: mongoose.Types.ObjectId, ref: 'user' },
    premium: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
}, {})

module.exports = mongoose.model('user', UserSchema)