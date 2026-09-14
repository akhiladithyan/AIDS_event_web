import mongoose from 'mongoose';

const SoloRegistrationSchema = new mongoose.Schema({
    userId: { type: String, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    college: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: String, required: true },
    password: { type: String },
    qrToken: { type: String },
    teamId: { type: String },
    event: {
        id: { type: String, required: true },
        title: { type: String, required: true },
        image: { type: String }
    },
    idCardUrl: { type: String },
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

const SoloRegistration = mongoose.model('SoloRegistration', SoloRegistrationSchema);

export default SoloRegistration;
