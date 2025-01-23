import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

    // Delete the token cookie by setting its expiration to a past date
        response.cookies.set('token', '', {
        path: '/',
        expires: new Date(0),  // Set the cookie expiration to a past date to delete it
        httpOnly: true,         // Secure cookie handling
        secure: process.env.NODE_ENV === 'production', // Only in production
    });

    return response;
}
