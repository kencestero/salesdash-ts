"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, TrendingUp, TrendingDown, RefreshCw, ChevronDown, ChevronUp, Undo2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface UploadReport {
  id: string;
  fileName: string;
  manufacturer: string;
  uploadedBy: string;
  totalInUpload: number;
  newTrailers: number;
  updatedTrailers: number;
  removedTrailers: number;
  newVins: string[];
  updatedVins: string[];
  removedVins: string[];
  processingTime: number | null;
  createdAt: string;
}

export default function InventoryHistoryPage() {
  const [reports, setReports] = useState<UploadReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [rollingBack, setRollingBack] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/inventory/upload-reports");
      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (reportId: string) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
  };

  const handleRollback = async (reportId: string) => {
    if (!confirm("Are you sure you want to rollback this upload? This will delete newly added trailers. This action cannot be undone.")) {
      return;
    }

    setRollingBack(reportId);
    try {
      const response = await fetch("/api/inventory/rollback-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to rollback upload");
      }

      const data = await response.json();
      toast.success("Upload rolled back successfully", {
        description: `Deleted ${data.details.deletedNew} new trailers`,
      });

      // Refresh reports
      await fetchReports();
    } catch (error: any) {
      console.error("Error rolling back upload:", error);
      toast.error("Failed to rollback upload", {
        description: error.message,
      });
    } finally {
      setRollingBack(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload History</h1>
          <p className="text-muted-foreground mt-1">
            Track inventory changes and identify potentially sold trailers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/dashboard/inventory">
            <Button variant="default" size="sm">
              Back to Inventory
            </Button>
          </Link>
        </div>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Upload Reports</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Upload your first inventory file to start tracking changes
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const isExpanded = expandedReport === report.id;
            const hasRemovedTrailers = report.removedTrailers > 0;

            return (
              <Card key={report.id} className={hasRemovedTrailers ? "border-l-4 border-l-yellow-500" : ""}>
                <CardHeader className="cursor-pointer" onClick={() => toggleExpand(report.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {report.fileName}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-primary">{report.manufacturer}</span>
                        <span>•</span>
                        <span>{new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString()}</span>
                        {report.processingTime && (
                          <>
                            <span>•</span>
                            <span>{(report.processingTime / 1000).toFixed(2)}s</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRollback(report.id);
                        }}
                        disabled={rollingBack === report.id}
                      >
                        {rollingBack === report.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Undo2 className="h-4 w-4 mr-2" />
                            Rollback
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{report.totalInUpload}</div>
                      <div className="text-xs text-muted-foreground">Total in Upload</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {report.newTrailers}
                      </div>
                      <div className="text-xs text-muted-foreground">New Trailers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{report.updatedTrailers}</div>
                      <div className="text-xs text-muted-foreground">Updated</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                        report.removedTrailers > 0 ? "text-yellow-600" : "text-gray-400"
                      }`}>
                        <TrendingDown className="h-4 w-4" />
                        {report.removedTrailers}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {report.removedTrailers > 0 ? "Potentially Sold" : "Removed"}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Details */}
                {isExpanded && (
                  <CardContent className="border-t pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* New Trailers */}
                      {report.newVins.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            New Trailers ({report.newVins.length})
                          </h4>
                          <div className="space-y-1 max-h-64 overflow-y-auto">
                            {report.newVins.map((vin) => (
                              <Badge key={vin} variant="outline" className="text-xs font-mono block w-full justify-start">
                                {vin}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Updated Trailers */}
                      {report.updatedVins.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
                            <RefreshCw className="h-4 w-4" />
                            Updated Trailers ({report.updatedVins.length})
                          </h4>
                          <div className="space-y-1 max-h-64 overflow-y-auto">
                            {report.updatedVins.map((vin) => (
                              <Badge key={vin} variant="outline" className="text-xs font-mono block w-full justify-start">
                                {vin}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Removed Trailers (Potentially Sold) */}
                      {report.removedVins.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-600">
                            <TrendingDown className="h-4 w-4" />
                            Potentially Sold ({report.removedVins.length})
                          </h4>
                          <div className="space-y-1 max-h-64 overflow-y-auto">
                            {report.removedVins.map((vin) => (
                              <Badge key={vin} variant="destructive" className="text-xs font-mono block w-full justify-start">
                                {vin}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-3">
                            These trailers were in the database but not in this upload. They may have been sold.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
