import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema({
    userId: { type: String },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    college: { type: String },
    department: { type: String },
    year: { type: String },
    role: { type: String, default: 'Member' }, // 'Leader' | 'Member'
    password: { type: String },
    qrToken: { type: String },
    idCardUrl: { type: String }
});

const TeamRegistrationSchema = new mongoose.Schema({
    teamId: { type: String, index: true },
    teamName: { type: String, required: true },
    teamLeader: { type: TeamMemberSchema, required: true },
    members: [TeamMemberSchema], // Array of additional members
    event: {
        id: { type: String, required: true },
        title: { type: String, required: true },
        image: { type: String }
    },
    college: { type: String },
    department: { type: String },
    paymentStatus: { type: String, default: 'Free' },
    paymentScreenshot: { type: String },
    transactionId: { type: String },
    verificationStatus: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending',
        index: true
    },
    verifiedBy: { type: String },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const TeamRegistration = mongoose.model('TeamRegistration', TeamRegistrationSchema);

export default TeamRegistration;
