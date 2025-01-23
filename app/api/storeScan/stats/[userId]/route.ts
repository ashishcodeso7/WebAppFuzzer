import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ScanModel from "@/lib/models/Scans";

interface DatabaseError extends Error {
  code?: string;
  name: string;
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

async function connectToDatabase(retries = 3): Promise<void> {
  while (retries > 0) {
    try {
      if (mongoose.connection.readyState === 1) {
        return;
      }
      if (mongoose.connection.readyState === 2) {
        await new Promise((resolve) => {
          mongoose.connection.once("connected", resolve);
        });
        return;
      }
      await mongoose.connect(MONGODB_URI as string);
      console.log("Connected to MongoDB");
      return;
    } catch (error) {
      retries -= 1;
      if (retries === 0) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (3 - retries)));
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId || typeof userId !== "string" || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    await connectToDatabase();

    const scans = await ScanModel.find({ userId }).lean();

    if (!scans || scans.length === 0) {
      return NextResponse.json({ message: "No scan history found for this user" }, { status: 404 });
    }

    // Calculate high and moderate risks based on `scanResults.alerts`
    const highRiskIssuesCount = scans.reduce((count, scan) => {
      const highIssues = scan.scanResults?.alerts?.filter((alert: any) => alert.risk === "High");
      return count + (highIssues?.length || 0);
    }, 0);

    const moderateIssuesCount = scans.reduce((count, scan) => {
      const moderateIssues = scan.scanResults?.alerts?.filter((alert: any) => alert.risk === "Medium");
      return count + (moderateIssues?.length || 0);
    }, 0);

    return NextResponse.json(
      {
        scans,
        stats: {
          totalScans: scans.length,
          highRiskIssues: highRiskIssuesCount,
          moderateIssues: moderateIssuesCount,
          activeSessions: 0, // Replace with your logic for active sessions
          completedReports: scans.length, // Assuming all scans are completed
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching scan stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
