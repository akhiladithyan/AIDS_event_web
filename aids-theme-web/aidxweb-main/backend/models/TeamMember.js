
import mongoose from 'mongoose';
import MediaAssetSchema from './MediaAsset.js';

const TeamMemberSchema = new mongoose.Schema({
    name: String,
    role: String,
    category: {
        type: String,
        default: 'Volunteers / Core Committee'
    },
    image: MediaAssetSchema, // Re-added image field
    isActive: { type: Boolean, default: true },
    instagram: String,
    linkedin: String,
    order: { type: Number, default: 0 }
});

const TeamMember = mongoose.model('TeamMember', TeamMemberSchema);
export default TeamMember;
