import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
    teamId: { type: String, required: true, index: true },
    present: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    snacks: { type: Boolean, default: false },
    studentScans: {
        type: Map,
        of: new mongoose.Schema({
            userId: String,
            memberName: String,
            present: { type: Boolean, default: false },
            presentTime: String,
            lunch: { type: Boolean, default: false },
            lunchTime: String,
            snacks: { type: Boolean, default: false },
            snacksTime: String,
        }, { _id: false }),
        default: {}
    },
    markedAt: { type: Date, default: Date.now },
    markedBy: { type: String, default: 'Manager' }
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
