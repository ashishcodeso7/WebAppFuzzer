"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ExternalLink, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { getCookie } from '@/app/(dashboard)/dashboard/main/page';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
interface Alert {
  pluginId: string;
  name: string;
  risk: string;
  description: string;
  solution: string;
}

interface ScanResult {
  _id: string;
  userId: string;
  url: string;
  scanResults: {
    alerts: Alert[];
  };
  timestamp: string;
}

type SortField = 'url' | 'alertCount' | 'timestamp';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const ReportsHistory: React.FC = () => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Filtering states
  const [urlFilter, setUrlFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  
  // Sorting states
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scanToDelete, setScanToDelete] = useState<ScanResult | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const userId = getCookie('userId');
        if (userId !== null) {
          setUserId(userId as unknown as string);
        }

        const response = await fetch(`/api/storeScan/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const scansArray = Array.isArray(data) ? data : [data];
        
        const validatedScans = scansArray.filter((scan: any) => {
          if (!scan._id || !scan.userId || !scan.scanResults?.alerts) return false;
          
          try {
            scan.url = typeof scan.url === 'string' ? JSON.parse(scan.url).url : scan.url;
          } catch (e) {
            console.warn('Failed to parse URL:', scan.url);
            return false;
          }
          
          return true;
        });

        setScans(validatedScans);
        setError(null);
      } catch (error) {
        console.error('Error fetching scans:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while fetching scan data');
        setScans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, []);

  const handleDelete = async (scan: ScanResult) => {
    setScanToDelete(scan);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!scanToDelete) return;
    
    setIsDeleting(true);
    console.log('Deleting scan:', scanToDelete._id);
    try {
      const response = await fetch(`/api/storeScan/${scanToDelete._id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete scan');
      }
  
      // Update the local state to remove the deleted scan
      setScans(prevScans => prevScans.filter(scan => scan._id !== scanToDelete._id));
      setIsDeleteDialogOpen(false);
      
      // If the deleted scan was selected in the details dialog, close it
      if (selectedScan?._id === scanToDelete._id) {
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting scan:', error);
      // You might want to show an error notification here
    } finally {
      setIsDeleting(false);
      setScanToDelete(null);
    }
  };

  const filterScans = (scans: ScanResult[]) => {
    return scans.filter(scan => {
      const urlMatch = scan.url.toLowerCase().includes(urlFilter.toLowerCase());
      const riskMatch = riskFilter === 'all' || 
        scan.scanResults.alerts.some(alert => alert.risk.toLowerCase() === riskFilter.toLowerCase());
      return urlMatch && riskMatch;
    });
  };

  const sortScans = (scans: ScanResult[]) => {
    return [...scans].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'url':
          comparison = a.url.localeCompare(b.url);
          break;
        case 'alertCount':
          comparison = a.scanResults.alerts.length - b.scanResults.alerts.length;
          break;
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const getPaginatedData = (scans: ScanResult[]) => {
    const filteredAndSortedScans = sortScans(filterScans(scans));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return {
      paginatedScans: filteredAndSortedScans.slice(startIndex, endIndex),
      totalPages: Math.ceil(filteredAndSortedScans.length / ITEMS_PER_PAGE)
    };
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getRiskBadgeColor = (risk: string): string => {
    switch (risk.toLowerCase()) {
      case 'high':
        return 'bg-red-500 hover:bg-red-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const handleRowClick = (scan: ScanResult) => {
    setSelectedScan(scan);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          Loading scan history...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-red-500">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  if (!scans.length) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          No scan history found.
        </CardContent>
      </Card>
    );
  }

  const { paginatedScans, totalPages } = getPaginatedData(scans);

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Security Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Filter by URL..."
                  value={urlFilter}
                  onChange={(e) => setUrlFilter(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select
                value={riskFilter}
                onValueChange={setRiskFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort('url')}
                    className="flex items-center gap-1"
                  >
                    URL
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort('alertCount')}
                    className="flex items-center gap-1"
                  >
                    Alerts
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Risk Summary</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort('timestamp')}
                    className="flex items-center gap-1"
                  >
                    Timestamp
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedScans.map((scan) => (
                <TableRow 
                  key={scan._id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(scan)}
                >
                  <TableCell className="flex items-center gap-2">
                    {scan.url}
                    <ExternalLink 
                      className="w-4 h-4 text-gray-500 hover:text-gray-700"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        window.open(scan.url, '_blank');
                      }}
                    />
                  </TableCell>
                  <TableCell>{scan.scanResults.alerts.length}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {Array.from(new Set(scan.scanResults.alerts.map(alert => alert.risk)))
                        .map((risk) => (
                          <Badge 
                            key={risk}
                            className={getRiskBadgeColor(risk)}
                          >
                            {risk}
                          </Badge>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(scan.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <div className="flex items-center justify-between">
        <DialogTitle className="flex items-center gap-2 text-xl">
          Scan Details for {selectedScan?.url}
          <ExternalLink 
            className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={() => window.open(selectedScan?.url, '_blank')}
          />
        </DialogTitle>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            if (selectedScan) {
              handleDelete(selectedScan);
            }
          }}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </DialogHeader>
    
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {selectedScan && Array.from(new Set(selectedScan.scanResults.alerts.map(alert => alert.risk)))
            .map((risk) => (
              <Badge 
                key={risk}
                className={getRiskBadgeColor(risk)}
              >
                {risk}
              </Badge>
            ))}
        </div>
        <span className="text-sm text-gray-500">
          Scanned on {selectedScan && new Date(selectedScan.timestamp).toLocaleString()}
        </span>
      </div>

      <div className="space-y-4">
        {selectedScan?.scanResults.alerts.map((alert, idx) => (
          <div key={idx} className="border-l-4 border-l-blue-500 pl-4 py-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              <h4 className="font-medium">{alert.name}</h4>
              <Badge className={getRiskBadgeColor(alert.risk)}>
                {alert.risk}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-2">{alert.description}</p>
            <p className="text-sm text-gray-800 mt-2">
              <span className="font-medium">Solution: </span>
              {alert.solution}
            </p>
          </div>
        ))}
      </div>
    </div>
  </DialogContent>
</Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure you want to delete this scan?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the scan results for {scanToDelete?.url}.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={confirmDelete}
        disabled={isDeleting}
        className="bg-red-500 hover:bg-red-600"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </>
  );
};

export default ReportsHistory;