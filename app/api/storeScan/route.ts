import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ScanModel from '../../../lib/models/Scans';
import UserModel from '../../../lib/models/User'; // Ensure users exist

const uri = process.env.MONGODB_URI; // Your MongoDB URI

async function connectToDatabase() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri as string);
    }
}

export async function POST(request: Request) {
    const { userId, url, scanResults } = await request.json();

    if (!userId ) {
        return NextResponse.json({ error: 'userid missing' }, { status: 400 });
    }if (!url ) {
        return NextResponse.json({ error: 'url missing' }, { status: 400 });
    }if (!scanResults) {
        return NextResponse.json({ error: 'results missing' }, { status: 400 });
    }

    try {
        await connectToDatabase();

        // Validate the user
        const userExists = await UserModel.findById(userId);
        if (!userExists) {
            return NextResponse.json({ error: 'Invalid user.' }, { status: 400 });
        }

        // Create a new scan record
        const newScan = new ScanModel({
            userId,
            url,
            scanResults,
        });

        await newScan.save();
        console.log('Scan results saved successfully.');
        return NextResponse.json({ message: 'Scan results saved successfully.' }, { status: 201 });
    } catch (error) {
        console.error('Error saving scan results:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
