const mongoose = require('mongoose')

const SubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    plan: { type: String, enum: ['monthly', 'annual'], required: true },
    status: { type: String, enum: ['active', 'axpired'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
});

module.exports = mongoose.model('subscription', SubscriptionSchema)