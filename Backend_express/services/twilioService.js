const twilio = require('twilio');
const settings = require('../config');

class TwilioService {
    constructor() {
        if (!settings.TWILIO_SID || !settings.TWILIO_AUTH_TOKEN || !settings.TWILIO_PHONE_NUMBER) {
            console.log("⚠️ Warning: Twilio credentials not found in environment variables");   
            this.client = null;
        } else {
            this.client = twilio(settings.TWILIO_SID, settings.TWILIO_AUTH_TOKEN);
            console.log("✅ Twilio client initialized");   
        }
        this.twilioPhone = settings.TWILIO_PHONE_NUMBER;
    }

    async sendSms(toPhone, message) {
        if (!this.client) return { success: false, error: "Twilio not configured" };   
        
        try {
            const formattedPhone = toPhone.startsWith('+') ? toPhone : `+91${toPhone}`;   
            const msgObj = await this.client.messages.create({
                body: message,
                from: this.twilioPhone,
                to: formattedPhone
            });   
            
            console.log(`✅ SMS sent! SID: ${msgObj.sid}`);   
            return { success: true, sid: msgObj.sid, status: msgObj.status };
        } catch (err) {
            console.error(`❌ Twilio Error: ${err.message}`);   
            return { success: false, error: err.message };
        }
    }

    async sendMedicineReminder(toPhone, medicineName, dosage, time) {
        const message = `🔔 MedRed Reminder\n\nMedicine: ${medicineName}\nDosage: ${dosage}\nTime: ${time}\n\nDon't forget to take your medicine!\n\n- MedRed Team`;   
        return await this.sendSms(toPhone, message);
    }

    async sendMedicineReminderCall(toPhone, medicineName, dosage, time) {
        if (!this.client) return { success: false, error: "Twilio not configured" };   
        
        try {
            const formattedPhone = toPhone.startsWith('+') ? toPhone : `+91${toPhone}`;   
            const call = await this.client.calls.create({
                twiml: `<Response><Say voice="alice">Hello! This is your medicine reminder. Please take ${medicineName}, dosage ${dosage}, at ${time}.</Say></Response>`,   
                to: formattedPhone,
                from: this.twilioPhone
            });   
            
            return { success: true, sid: call.sid, status: call.status };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
}

module.exports = new TwilioService();   