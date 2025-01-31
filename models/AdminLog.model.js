const mongoose = require('mongoose')

const AdminLogSchema = new mongoose.Schema({
    logId: { type: String, unique: true, required: true },
    adminId: { type: String, required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('adminLog', AdminLogSchema)