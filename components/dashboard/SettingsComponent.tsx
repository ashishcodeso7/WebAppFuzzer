"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState({ name: "", email: "", id: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          setUser({ name: data.name, email: data.email, id: data.id });
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password do not match.");
      return;
    }

    try {
      const response = await fetch("/api/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Password updated successfully!");
        setError("");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "An error occurred.");
        setSuccess("");
      }
    } catch {
      setError("Failed to update password. Please try again.");
      setSuccess("");
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/update-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: email }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Email updated successfully!");
        setError("");
      } else {
        setError(data.error || "An error occurred.");
        setSuccess("");
      }
    } catch {
      setError("Failed to update email. Please try again.");
      setSuccess("");
    }
  };

  const handleFeedbackSubmit = () => {
    alert("Thank you for your feedback!");
    setFeedback("");
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center">Settings</h2>

      <div className="flex gap-4 justify-center mb-6">
        <Button
          variant={activeTab === "profile" ? "default" : "outline"}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </Button>
        <Button
          variant={activeTab === "support" ? "default" : "outline"}
          onClick={() => setActiveTab("support")}
        >
          Support
        </Button>
        <Button
          variant={activeTab === "feedback" ? "default" : "outline"}
          onClick={() => setActiveTab("feedback")}
        >
          Feedback
        </Button>
      </div>

      {success && (
        <Alert className="bg-green-50 text-green-600 border-green-200 rounded-lg shadow-md">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="rounded-lg shadow-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {activeTab === "profile" && (
        <Card className="rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Username: <span className="font-medium text-gray-800">{user.name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Email: <span className="font-medium text-gray-800">{user.email}</span>
              </p>
              <p className="text-sm text-gray-600">
                User ID: <span className="font-medium text-gray-800">{user.id}</span>
              </p>
            </div>
            <Button variant="outline" className="mt-4" onClick={() => setActiveTab("password")}>
              Change Your Password
            </Button>
            <Button variant="outline" className="mt-4" onClick={() => setActiveTab("email")}>
              Change Your Email
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "password" && (
        <Card className="rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "email" && (
        <Card className="rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Change Email</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <Input
                type="email"
                placeholder="New Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                Update Email
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

{activeTab === "support" && (
  <Card className="rounded-lg shadow-lg">
    <CardHeader>
      <CardTitle className="text-lg font-medium text-gray-700">Support</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10l9-9m0 0l9 9m-9-9v18"
          />
        </svg>
        <p className="text-gray-700">Call us at:</p>
        <a href="tel:+91 62811 81439" className="text-blue-600 hover:underline">
        +91 62811 81439
        </a>
      </div>
      <Button
        variant="outline"
        onClick={() => window.open("mailto:dummy@dummy.com")}
      >
        Contact via Email
      </Button>
    </CardContent>
  </Card>
)}


      {activeTab === "feedback" && (
        <Card className="rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="border p-2 w-full rounded"
              placeholder="Write your feedback here..."
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
            <Button className="mt-4 w-full" onClick={handleFeedbackSubmit}>
              Submit Feedback
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
