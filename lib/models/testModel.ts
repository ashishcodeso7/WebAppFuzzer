import mongoose, { Document, Schema } from 'mongoose';

export interface ITest extends Document {
    name: string;
    age: number;
}

const TestSchema: Schema = new Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true }
});

const TestModel = mongoose.models.Test || mongoose.model<ITest>('Test', TestSchema);

export default TestModel;
