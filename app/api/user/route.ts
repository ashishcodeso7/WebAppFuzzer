// app/api/users/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import UserModel, { IUser } from '../../../lib/models/User'; // Import UserModel

const uri = process.env.MONGODB_URI; // Your MongoDB URI

async function connectToDatabase() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri as string);
    }
}

export async function POST(request: Request) {
    const body: IUser = await request.json(); // Type the incoming body
    const { name, email, password } = body;

    try {
        await connectToDatabase();

        // Check if username or email already exists
        const existingUser = await UserModel.findOne({
            $or: [{ name }, { email }]
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username or email already exists.' },
                { status: 400 }
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user using UserModel
        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        return NextResponse.json({ message: 'User registered successfully.' }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
