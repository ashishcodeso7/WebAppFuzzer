import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/lib/models/User';

export async function GET(req: Request) {
  try {
    // Extract cookies using the `Request` API
    const cookieHeader = req.headers.get('cookie');
    const cookies = cookieHeader
      ?.split(';')
      .map((cookie) => cookie.trim())
      .reduce((acc, cookie) => {
        const [key, value] = cookie.split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

    const token = cookies?.token;

    if (!token) {
      return NextResponse.json({ error: 'Authorization token missing or invalid' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = (decoded as { id: string }).id;

    await dbConnect();

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '/default-avatar.png', // Add the avatar field
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
