const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    photoId: { type: mongoose.Schema.Types.ObjectId, ref: 'photo' },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('transaction', TransactionSchema);
