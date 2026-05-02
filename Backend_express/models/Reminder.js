const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    time: { type: String, required: true } // Stored as string to match your FastAPI logic
});

module.exports = mongoose.model('Reminder', ReminderSchema);