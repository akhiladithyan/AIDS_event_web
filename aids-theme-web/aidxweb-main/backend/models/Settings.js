import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    registrationOpen: {
        type: Boolean,
        default: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const SettingsModel = mongoose.model('Settings', SettingsSchema);

export default SettingsModel;
