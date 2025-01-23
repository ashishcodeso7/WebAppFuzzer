import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/lib/models/User';

export async function PUT(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Authorization token missing or invalid' }, { status: 401 });
        }

        // Decode the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        console.log('Decoded token:', decoded); // Debug log

        const userId = (decoded as { id: string }).id; // Use the correct field name here

        if (!userId) {
            return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 });
        }

        const { newEmail } = await req.json();

        // Validate the new email
        if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Connect to the database
        await dbConnect();

        // Check if the email is already in use
        const existingEmail = await UserModel.findOne({ email: newEmail });
        if (existingEmail) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
        }

        // Attempt to find and update the user's email
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { email: newEmail },
            { new: true }
        );

        if (!updatedUser) {
            console.error(`User not found with ID: ${userId}`); // Debug log
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Email updated successfully', user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error('Error updating email:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
