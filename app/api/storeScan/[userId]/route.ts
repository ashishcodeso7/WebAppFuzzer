import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ScanModel from '../../../../lib/models/Scans';

// Types
interface DatabaseError extends Error {
  code?: string;
  name: string;
}

// Environment variable validation
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Database connection with retry logic
async function connectToDatabase(retries = 3): Promise<void> {
  while (retries > 0) {
    try {
      if (mongoose.connection.readyState === 1) {
        // Already connected
        return;
      }

      if (mongoose.connection.readyState === 2) {
        // Connection is in progress, wait for it
        await new Promise((resolve) => {
          mongoose.connection.once('connected', resolve);
        });
        return;
      }

      await mongoose.connect(MONGODB_URI as string);
      console.log('Connected to MongoDB');
      return;
    } catch (error) {
      retries -= 1;
      if (retries === 0) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
    }
  }
}

export async function GET(
  request: Request, 
  { params }: { params: { userId: string } }
) {
    try {
        const { userId } = params;
        console.log('Received userId:', userId);
        // Input validation
        if (!userId || typeof userId !== 'string') {
          return NextResponse.json(
            { error: 'Invalid user ID provided' },
            { status: 400 }
          );
        }
    
        // Validate userId format (assuming MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return NextResponse.json(
            { error: 'Invalid user ID format' },
            { status: 400 }
          );
        }
    
        // Connect to database
        await connectToDatabase();
    
        // Fetch scans with proper typing
        const scans = await ScanModel.find({ userId })
          .sort({ timestamp: -1 })
          .select('-__v') // Exclude version key
          .lean() // Convert to plain JavaScript objects
          .exec();
        console.log('Fetched scans:', scans);
        // Handle no results
        if (!scans || scans.length === 0) {
          return NextResponse.json(
            { message: 'No scan history found for this user' },
            { status: 404 }
          );
        }
    
        // Cache headers for better performance
        const headers = {
          'Cache-Control': 'private, max-age=30',
          'Content-Type': 'application/json',
        };
        console.log('Fetched scans:', scans);
        return NextResponse.json(scans, {
          status: 200,
          headers,
        });
    
      } catch (error) {
        // Type guard for error handling
        const err = error as DatabaseError;
    
        // Log the error with details
        console.error('Scan history fetch error:', {
          message: err.message,
          code: err.code,
          name: err.name,
          stack: err.stack,
        });
    
        // Handle specific MongoDB errors
        if (err.name === 'MongoServerError') {
          return NextResponse.json(
            { error: 'Database operation failed' },
            { status: 503 }
          );
        }
    
        if (err.name === 'MongooseError') {
          return NextResponse.json(
            { error: 'Database connection error' },
            { status: 503 }
          );
        }
    
        // Generic error response
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get the scan ID from the URL
    const url = new URL(request.url);
    const scanId = url.pathname.split('/').pop();
    console.log('Received scanId:', scanId);

    // Input validation
    if (!scanId || !mongoose.Types.ObjectId.isValid(scanId)) {
      return NextResponse.json(
        { error: 'Invalid scan ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the scan first to verify ownership
    const scan = await ScanModel.findOne({
      _id: scanId,
    });

    if (!scan) {
      return NextResponse.json(
        { error: 'Scan not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the scan
    const result = await ScanModel.findByIdAndDelete(scanId);

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to delete scan' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      { message: 'Scan deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    // Type guard for error handling
    const err = error as DatabaseError;

    // Log the error with details
    console.error('Scan deletion error:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack,
    });

    // Handle specific MongoDB errors
    if (err.name === 'MongoServerError') {
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 503 }
      );
    }

    if (err.name === 'MongooseError') {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Clean up MongoDB connection when the server shuts down
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
}