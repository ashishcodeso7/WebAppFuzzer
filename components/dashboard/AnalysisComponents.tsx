"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecurityAnalysisResults } from "./SecurityAnalysisResults";
import { getCookie } from "@/app/(dashboard)/dashboard/main/page";
import SaveButtonComponent from "@/components/dashboard/SaveButtonComponent";

export const NewAnalysis = () => {
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const userId = getCookie("userId");
    if (userId) {
      setUserId(userId as unknown as string);
    }
  }, []);

  const handleAnalysis = async () => {
    setIsLoading(true);
    setResults(null);
    setSaveStatus(null);
    setProgress(0); // Reset progress

    let simulatedProgress = 0; // Start simulated progress
    const simulationInterval = setInterval(() => {
        if (simulatedProgress < 90) {
            simulatedProgress += 5; // Increment simulated progress
            setProgress(simulatedProgress);
        }
    }, 1000); // Update every second

    try {
        const response = await fetch("/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });

        if (response.ok) {
            const data = await response.json();
            setResults(data);

            // Poll for real progress updates
            const interval = setInterval(async () => {
                try {
                    const progressResponse = await fetch(`/api/progress/${data.scanId}`);
                    if (progressResponse.ok) {
                        const progressData = await progressResponse.json();
                        const realProgress = parseInt(progressData.progress, 10);

                        // Update progress based on real progress
                        setProgress((prev) => Math.max(prev, realProgress));

                        // Stop polling when real progress reaches 100%
                        if (realProgress === 100) {
                            clearInterval(interval);
                            clearInterval(simulationInterval); // Stop simulation
                        }
                    }
                } catch (error) {
                    console.error("Error fetching progress:", error);
                    clearInterval(interval); // Stop polling on error
                }
            }, 1000); // Poll every second
        } else {
            console.error("Failed to fetch analysis results");
        }
    } catch (error) {
        console.error("Error analyzing URL:", error);
        clearInterval(simulationInterval); // Stop simulation on error
    } finally {
        setIsLoading(false);
    }
};


  const handleSaveScan = async () => {
    setIsSaving(true);
    if (!results) {
      setSaveStatus("No results to save.");
      return;
    }

    setSaveStatus(null);
    try {
      const response = await fetch("/api/storeScan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          url,
          scanResults: results,
        }),
      });

      if (response.status === 201) {
        setSaveStatus("Scan saved successfully");
        setIsSaved(true);
      } else {
        setSaveStatus("Failed to save scan.");
      }
    } catch (error) {
      console.error("Error saving scan:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Security Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter target URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAnalysis} disabled={!url || isLoading}>
              {isLoading ? "Analyzing..." : "Start Fuzzing"}
            </Button>
          </div>

          <div className="mt-4">
            <label>Scan Progress</label>
            <div className="relative w-full h-2 bg-gray-200 rounded">
              <div
                className="absolute h-2 bg-blue-500 rounded"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm mt-2">{progress}% completed</p>
          </div>

          {results && (
            <div className="mt-6">
              <SecurityAnalysisResults results={results} />
              <SaveButtonComponent
                handleClicked={handleSaveScan}
                isSaved={isSaved}
                isSaving={isSaving}
              />
              {saveStatus && (
                <div className="mt-2 text-sm">
                  <span>{saveStatus}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const ResultsDisplay = ({ results }: { results: any }) => {
  return <SecurityAnalysisResults results={results} />;
};
