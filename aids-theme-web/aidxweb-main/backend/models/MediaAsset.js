
import mongoose from 'mongoose';

const MediaAssetSchema = new mongoose.Schema({
  url: String,
  publicId: String,
  type: { type: String, default: 'image' } // 'image', 'video', 'pdf'
});

export default MediaAssetSchema;
