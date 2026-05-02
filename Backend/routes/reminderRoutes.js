const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const scheduler = require('../services/scheduler'); // You will need to create this
const twilioService = require('../services/twilioService'); // You will need to create this

// Get all reminders for logged-in user
router.get('/user', protect, async (req, res) => {
    try {
        const reminders = await Reminder.find({ userId: req.user.sub });   
        res.json({ reminders, success: true });   
    } catch (err) {
        res.status(500).json({ detail: err.message });   
    }
});

// Add a reminder   
router.post('/add', protect, async (req, res) => {
    const { medicineName, dosage, time } = req.body;   
    const userId = req.user.sub;

    try {
        const user = await User.findById(userId);   
        if (!user) return res.status(404).json({ detail: "User not found" });   

        const newReminder = new Reminder({ userId, medicineName, dosage, time });   
        const saved = await newReminder.save();   

        let smsScheduled = false;
        if (user.mobileNumber) {   
            try {
                // Logic to schedule Twilio/SMS jobs
                await scheduler.scheduleMultipleTimes(saved._id, user.mobileNumber, medicineName, dosage, [time]);   
                await twilioService.sendSms(user.mobileNumber, `✅ Reminder created for ${medicineName}`);   
                smsScheduled = true;
            } catch (smsErr) {
                console.error("SMS scheduling failed", smsErr);   
            }
        }

        res.json({ success: true, reminder_id: saved._id, sms_scheduled: smsScheduled });   
    } catch (err) {
        res.status(500).json({ detail: err.message });   
    }
});

// Delete reminder   
router.delete('/delete/:reminderId', protect, async (req, res) => {
    const { reminderId } = req.params;   

    try {
        // Cancel scheduled jobs (simulating the 0-9 loop from Python)   
        for (let i = 0; i < 10; i++) {
            await scheduler.removeReminder(`reminder_${reminderId}_${i}`);   
        }

        await Reminder.findByIdAndDelete(reminderId);   
        res.json({ success: true, message: "Reminder deleted successfully" });   
    } catch (err) {
        res.status(500).json({ detail: err.message });   
    }
});

module.exports = router;