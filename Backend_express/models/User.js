const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Basic Info from createUser
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Profile Info from updateUser/Info model
    mobileNumber: { type: String }, 
    emergencyContactNumber: { type: String },
    birthDate: { type: String },
    gender: { type: String, enum: ["male", "female"] },
    bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    medicalConditions: { type: String, default: "" },
    allergies: { type: String, default: "" },

    // Embedded Address (replaces the separate ADDRESS table)
    address: {
        streetAddress: { type: String },
        city: { type: String },
        state: { type: String },
        pinCode: { type: String },
        country: { type: String }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);