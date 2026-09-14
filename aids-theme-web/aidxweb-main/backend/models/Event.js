
import mongoose from 'mongoose';
import MediaAssetSchema from './MediaAsset.js';

const EventSchema = new mongoose.Schema({
    id: String,
    title: String,
    date: String,
    time: String,
    description: String,
    category: String,
    registeredCount: Number,
    maxSlots: Number,
    image: MediaAssetSchema, // Updated to MediaAsset
    participationType: String,
    ticketTiers: [String],
    rules: [String],
    teamSize: String,
    coordinatorPhone: String, // Event coordinator contact number
    isFree: { type: Boolean, default: false }, // New Free Event Toggle
    isPassEvent: { type: Boolean, default: false }, // Pass-based pricing vs manual fee
    entryFee: { type: Number, default: 0 }, // Manual entry fee
    isRegistrationClosed: { type: Boolean, default: false }, // Per-Event Registration Toggle
    importantNote: String, // Mandatory requirements or important info
    winners: [{
        place: Number,
        name: String,
        teamName: String
    }] // Podium results set by admin
});

const Event = mongoose.model('Event', EventSchema);
export default Event;
