import mongoose, { Schema, Document } from 'mongoose';

export interface IScan extends Document {
    userId: mongoose.Types.ObjectId; // Reference to the User
    url: string;
    scanResults: object; // Store the scan results
    timestamp: Date;
}

const ScanSchema: Schema<IScan> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Foreign key reference
        url: { type: String, required: true },
        scanResults: { type: Object, required: true }, // Store results as JSON
        timestamp: { type: Date, default: Date.now }, // Automatically set the timestamp
    },
    { versionKey: false }
);

const ScanModel = mongoose.models.Scan || mongoose.model<IScan>('Scan', ScanSchema);

export default ScanModel;
