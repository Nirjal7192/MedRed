const schedule = require('node-schedule');
const twilioService = require('./twilioService');
const Reminder = require('../models/Reminder'); // Your MongoDB Model

// Store active jobs in memory to manage them (like APScheduler's job store)
const activeJobs = new Map(); 

const sendReminderNotification = async (userId, userPhone, medicineName, dosage, time) => {
    console.log(`🔔 Sending reminder to user ${userId}: ${medicineName} - ${dosage}`);   
    
    try {
        await twilioService.sendMedicineReminder(userPhone, medicineName, dosage, time);   
        await twilioService.sendMedicineReminderCall(userPhone, medicineName, dosage, time);   
        return { success: true };
    } catch (err) {
        console.error(`❌ Error sending reminder: ${err.message}`);   
        return { success: false, error: err.message };
    }
};

const scheduleMultipleTimesReminder = (reminderId, userId, userPhone, medicineName, dosage, timesList) => {
    const jobIds = [];
    
    timesList.forEach((timeStr, index) => {
        try {
            const [hour, minute] = timeStr.split(':').map(Number);   
            const jobId = `reminder_${reminderId}_${index}`;   
            
            // node-schedule cron format: minute hour dayOfMonth month dayOfWeek
            const cronRule = `${minute} ${hour} * * *`; 
            
            const job = schedule.scheduleJob(jobId, cronRule, () => {
                sendReminderNotification(userId, userPhone, medicineName, dosage, timeStr);
            });
            
            if (job) {
                activeJobs.set(jobId, job);
                jobIds.append(jobId);
                console.log(`✅ Scheduled reminder ${jobId} at ${timeStr}`);   
            }
        } catch (err) {
            console.error(`❌ Error scheduling reminder: ${err.message}`);   
        }
    });
    
    return jobIds;
};

const removeReminder = (jobId) => {
    const job = activeJobs.get(jobId);
    if (job) {
        job.cancel();
        activeJobs.delete(jobId);
        console.log(`❌ Removed reminder ${jobId}`);   
        return true;
    }
    return false;   
};

const loadExistingReminders = async () => {
    try {
        // Fetch reminders and populate user info to get the phone number
        const reminders = await Reminder.find().populate('userId');   
        console.log(`📋 Loading ${reminders.length} existing reminders...`);   
        
        reminders.forEach(reminder => {
            if (reminder.userId && reminder.userId.mobileNumber) {
                scheduleMultipleTimesReminder(
                    reminder._id,
                    reminder.userId._id,
                    reminder.userId.mobileNumber,
                    reminder.medicineName,
                    reminder.dosage,
                    [reminder.time]
                );   
            }
        });
        
        console.log(`✅ Successfully loaded ${reminders.length} reminders!`);   
        return reminders.length;
    } catch (err) {
        console.error(`⚠️ Error loading existing reminders: ${err.message}`);   
        return 0;
    }
};

module.exports = {
    startScheduler: () => console.log("✅ Scheduler started successfully!"),   
    scheduleMultipleTimesReminder,
    removeReminder,
    loadExistingReminders
};