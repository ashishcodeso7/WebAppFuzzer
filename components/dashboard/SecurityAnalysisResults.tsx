import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, Info, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const SecurityAnalysisResults = ({ results }: { results: any }) => {
  const getRiskInfo = (risk: string) => {
    switch (risk) {
      case 'High':
        return { 
          risk: 'High', 
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          badgeColor: 'bg-red-100 text-red-700',
          icon: AlertCircle 
        };
      case 'Medium':
        return { 
          risk: 'Medium', 
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          badgeColor: 'bg-yellow-100 text-yellow-700',
          icon: Info 
        };
      case 'Low':
        return { 
          risk: 'Low', 
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          badgeColor: 'bg-green-100 text-green-700',
          icon: CheckCircle 
        };
      default:
        return { 
          risk: 'Unknown', 
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          badgeColor: 'bg-gray-100 text-gray-700',
          icon: Info 
        };
    }
  };

  const uniqueAlerts = results.alerts.filter((alert: any, index: number, self: any[]) =>
    index === self.findIndex((a: any) => (
      a.pluginId === alert.pluginId && a.method === alert.method && a.description === alert.description
    ))
  );

  const sortedAlerts = uniqueAlerts.sort((a: any, b: any) => {
    const riskLevels = ['High', 'Medium', 'Low'];
    return riskLevels.indexOf(a.risk) - riskLevels.indexOf(b.risk);
  });

  const totalIssues = sortedAlerts.length;
  const highRiskCount = sortedAlerts.filter((alert: { risk: string; }) => alert.risk === 'High').length;

  return (
    <Card>
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle>Security Analysis Results</CardTitle>
          </div>
          <Badge variant="secondary" className="text-sm">
            {totalIssues} {totalIssues === 1 ? 'Issue' : 'Issues'} Found
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {highRiskCount > 0 ? (
            <span className="text-red-600 font-medium">
              Critical attention required: {highRiskCount} high-risk {highRiskCount === 1 ? 'vulnerability' : 'vulnerabilities'} detected
            </span>
          ) : (
            "Analysis complete. Review detected vulnerabilities below."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[120px] font-semibold">Risk Level</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="w-[150px] font-semibold">Method</TableHead>
                <TableHead className="font-semibold">Recommended Solution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(sortedAlerts) && sortedAlerts.length > 0 ? (
                sortedAlerts.map((alert: any, index: number) => {
                  const { risk, color, bgColor, badgeColor, icon: RiskIcon } = getRiskInfo(alert.risk);
                  return (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="py-4">
                        <div className={`flex items-center gap-2 ${color}`}>
                          <Badge className={`${badgeColor} border-0`}>
                            <RiskIcon size={14} className="mr-1" />
                            {risk}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {alert.description || "No description available"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {alert.method || "Unknown"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {alert.solution || "No solution provided"}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <span>No vulnerabilities detected in the scan.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityAnalysisResults;