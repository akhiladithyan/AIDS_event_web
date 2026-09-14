
import mongoose from 'mongoose';

const RegistrationSchema = new mongoose.Schema({
    // Common fields
    email: String,
    eventId: String,
    eventName: String,
    participationType: String, // 'Solo' or 'Team'

    // Solo event fields
    name: String,
    phone: String,
    college: String,
    department: String,
    degree: String,
    course: String,
    year: String,
    idCardUrl: String,

    // Team event fields
    teamName: String,
    teamMembers: [{
        name: String,
        phone: String
    }],
    teamLeaderIdCardUrl: String,

    // Payment
    paymentScreenshotUrl: String,
    paymentStatus: { type: String, default: "Pending" },

    // Admin
    isActive: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Registration = mongoose.model('Registration', RegistrationSchema);
export default Registration;
