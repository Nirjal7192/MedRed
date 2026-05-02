const User = require('../models/User');
const Reminder = require('../models/Reminder');

// --- User Operations ---

const getUser = async (email) => {
    // Replaces: SELECT * FROM USERS WHERE email = %s
    return await User.findOne({ email }); 
};

const createUser = async (fname, lname, email, password) => {
    try {
        const newUser = new User({ fname, lname, email, password });
        const savedUser = await newUser.save();
        return { msg: "User created successfully", userId: savedUser._id }; 
    } catch (err) {
        return { error: err.message, msg: "Failed to create user" };
    }
};

const getUserForDashboard = async (userId) => {
    try {
        const user = await User.findById(userId).select('-password'); // Exclude password
        const reminders = await Reminder.find({ userId }); 
        
        return { 
            user, 
            address: user.address, // In Mongo, this is part of the user document
            reminders 
        }; 
    } catch (err) {
        return { error: `error from database: ${err.message}` }; 
    }
};

const updateUser = async (userId, updateData) => {
    try {
        // We restructure the flat data into the nested MongoDB format
        const { streetAddress, city, state, pinCode, country, ...profileData } = updateData;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...profileData,
                address: { streetAddress, city, state, pinCode, country }
            },
            { new: true }
        );
        return { msg: "User updated successfully" }; 
    } catch (err) {
        return { error: err.message, msg: "Failed to update user" };
    }
};

// --- Reminder Operations ---

const createReminder = async (userId, medicineName, dosage, time) => {
    try {
        const newReminder = new Reminder({ userId, medicineName, dosage, time });
        const saved = await newReminder.save();
        return { msg: "Reminder created successfully", reminderId: saved._id, success: true }; 
    } catch (err) {
        return { error: err.message, msg: "Failed to create reminder", success: false };
    }
};

const getAllActiveReminders = async () => {
    try {
        // Replaces the JOIN USERS u ON r.userId = u.userId
        return await Reminder.find().populate('userId', 'mobileNumber'); 
    } catch (err) {
        console.error(`Error getting all reminders: ${err}`);
        return [];
    }
};

const deleteReminder = async (reminderId) => {
    await Reminder.findByIdAndDelete(reminderId);
    return { msg: "Reminder deleted successfully" }; 
};

module.exports = {
    getUser,
    createUser,
    getUserForDashboard,
    updateUser,
    createReminder,
    deleteReminder,
    getAllActiveReminders
};