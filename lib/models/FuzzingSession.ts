// lib/models/FuzzingSession.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IFuzzingSession extends Document {
    userId: mongoose.Schema.Types.ObjectId; // Reference to User
    url: string;
    startTime: Date;
    endTime: Date;
    status: string; // e.g., "completed", "in progress", "failed"
    createdAt: Date;
    updatedAt: Date;
}

const FuzzingSessionSchema: Schema<IFuzzingSession> = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    url: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
FuzzingSessionSchema.pre<IFuzzingSession>('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const FuzzingSessionModel = mongoose.models.FuzzingSession || mongoose.model<IFuzzingSession>('FuzzingSession', FuzzingSessionSchema);

export default FuzzingSessionModel;
