
import mongoose from 'mongoose';
import MediaAssetSchema from './MediaAsset.js';

const ContentSchema = new mongoose.Schema({
    heroTitle: String,
    heroSubtitle: String,
    heroBackgroundMedia: MediaAssetSchema, // Updated
    marqueeText: String,
    eventDate: String,
    ticketPrices: {
        diamond: Number,
        gold: Number,
        silver: Number
    },
    upiId: String,
    qrCodeUrl: String,
    galleryImages: [MediaAssetSchema], // Updated to array of MediaAssets
    faqs: [{ question: String, answer: String }],
    isTicketPassEnabled: { type: Boolean, default: true },
    isPaymentEnabled: { type: Boolean, default: true } // New Global Payment Toggle
});

const Content = mongoose.model('Content', ContentSchema);
export default Content;
