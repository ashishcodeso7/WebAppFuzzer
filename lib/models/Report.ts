// lib/models/Report.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
    sessionId: mongoose.Schema.Types.ObjectId; // Reference to FuzzingSession
    reportData: string; // Link or path to the generated report file
    createdAt: Date;
}

const ReportSchema: Schema<IReport> = new Schema({
    sessionId: { type: Schema.Types.ObjectId, required: true, ref: 'FuzzingSession' },
    reportData: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const ReportModel = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default ReportModel;
