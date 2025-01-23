"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Search, History, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalScans: 0,
    highRiskIssues: 0,
    moderateIssues: 0,
    completedReports: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch userId from cookies
  useEffect(() => {
    const userId = getCookie("userId");
    if (userId !== null) {
      setUserId(userId);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!userId) return;

        const response = await fetch(`/api/storeScan/stats/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch dashboard stats");

        const data = await response.json();
        setStats(data.stats);
        setRecentActivity(data.scans.slice(0, 3)); // Show the last 3 scans
        setError(null);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to fetch stats.");
      }
    };

    fetchStats();
  }, [userId]);

  // Define stat cards
  const statItems = [
    {
      title: "Total Scans",
      value: stats.totalScans,
      icon: <Search className="w-6 h-6 text-blue-500" />,
      description: "Last 30 days",
      action: () => router.push("/dashboard/reports"),
    },
    {
      title: "High Risk Issues",
      value: stats.highRiskIssues,
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      description: "Requires immediate attention",
      action: () => router.push("/dashboard/reports"),
    },
    {
      title: "Moderate Issues",
      value: stats.moderateIssues,
      icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
      description: "Medium-risk vulnerabilities",
      action: () => router.push("/dashboard/reports"),
    },
    {
      title: "Completed Reports",
      value: stats.completedReports,
      icon: <History className="w-6 h-6 text-green-500" />,
      description: "Ready to view",
      action: () => router.push("/dashboard/reports"),
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => (
          <Card
            key={stat.title}
            onClick={stat.action}
            className="cursor-pointer hover:shadow-xl transition-shadow border border-gray-200"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-gray-800">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-4">
          {error}
        </div>
      )}

      {/* Recent Activity Section */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <ul className="space-y-3">
              {recentActivity.map((activity, index) => (
                <li
                  key={index}
                  className="flex justify-between text-sm text-gray-600 hover:text-blue-500 transition"
                >
                  <span className="truncate">{activity.url}</span>
                  <span className="text-gray-400">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No recent activity to display.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Section */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-600 transition"
            onClick={() => router.push("/dashboard/analysis")}
          >
            Start a New Scan
          </button>
          <div className="h-2" /> {/* Gap between buttons */}
          <button
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-gray-300 transition"
            onClick={() => router.push("/dashboard/reports")}
          >
            View Recent Reports
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

// Utility to fetch cookies
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};
