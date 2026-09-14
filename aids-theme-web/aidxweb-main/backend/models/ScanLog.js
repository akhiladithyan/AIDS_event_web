import mongoose from 'mongoose';

const scanLogSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true
  },
  studentName: {
    type: String,
    default: 'Unknown Participant'
  },
  teamId: {
    type: String,
    index: true
  },
  teamName: {
    type: String
  },
  eventTitle: {
    type: String
  },
  mode: {
    type: String,
    enum: ['attendance', 'lunch', 'snacks'],
    required: true,
    index: true
  },
  scannedBy: {
    type: String,
    default: 'Manager'
  },
  scannedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  stationId: {
    type: String,
    default: 'Main Desk'
  },
  result: {
    type: String,
    enum: ['success', 'duplicate', 'rejected', 'invalid', 'unverified'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

const ScanLog = mongoose.model('ScanLog', scanLogSchema);
export default ScanLog;
