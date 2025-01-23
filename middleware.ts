import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: Request) {
    // Access cookies using the Edge runtime API
    const cookies = request.headers.get('cookie') || '';
    const token = cookies
        .split('; ')
        .find((cookie) => cookie.startsWith('token='))?.split('=')[1];

    // If there is no token, the user is not authenticated
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        // Use jose to verify the JWT token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET); // Encode the secret as a Uint8Array
        await jwtVerify(token, secret);

        // If token is valid, proceed with the request
        return NextResponse.next();
    } catch (error) {
        console.error('JWT Verification failed:', error);
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

// Apply the middleware to the dashboard routes
export const config = {
    matcher: ['/dashboard/:path*'],
};
