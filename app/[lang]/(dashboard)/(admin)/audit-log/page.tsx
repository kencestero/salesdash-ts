"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface Filters {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
}

const ACTION_COLORS: Record<string, string> = {
  assignment_change: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  status_change: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  delete: "bg-red-500/10 text-red-500 border-red-500/20",
  settings_change: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  bulk_action: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  export: "bg-green-500/10 text-green-500 border-green-500/20",
  create: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const ACTION_ICONS: Record<string, string> = {
  assignment_change: "heroicons:arrow-path",
  status_change: "heroicons:arrow-trending-up",
  delete: "heroicons:trash",
  settings_change: "heroicons:cog-6-tooth",
  bulk_action: "heroicons:squares-2x2",
  export: "heroicons:arrow-down-tray",
  create: "heroicons:plus-circle",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [filterOptions, setFilterOptions] = useState<{
    actionTypes: string[];
    entityTypes: string[];
  }>({ actionTypes: [], entityTypes: [] });
  const [offset, setOffset] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const limit = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(offset));

      if (filters.userId) params.set("userId", filters.userId);
      if (filters.action) params.set("action", filters.action);
      if (filters.entityType) params.set("entityType", filters.entityType);
      if (filters.entityId) params.set("entityId", filters.entityId);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);

      const response = await fetch(`/api/admin/audit-log?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch audit log");
      }

      const data = await response.json();
      setLogs(data.logs);
      setTotal(data.total);
      setFilterOptions(data.filters);
    } catch (error) {
      console.error("Failed to fetch audit log:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load audit log",
        color: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [offset, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setOffset(0);
  };

  const clearFilters = () => {
    setFilters({});
    setOffset(0);
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/admin/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast({
        title: "Export complete",
        description: "Audit log has been downloaded",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export",
        color: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground">
            Track all CRM changes, assignments, and settings modifications
          </p>
        </div>
        <Button onClick={exportCSV} disabled={exporting} variant="outline">
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Icon icon="heroicons:arrow-down-tray" className="mr-2 h-4 w-4" />
              Export CSV
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Filters</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Action</Label>
              <Select
                value={filters.action || "all"}
                onValueChange={(v) => handleFilterChange("action", v === "all" ? "" : v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {filterOptions.actionTypes.map((action) => (
                    <SelectItem key={action} value={action}>
                      {formatActionName(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Entity Type</Label>
              <Select
                value={filters.entityType || "all"}
                onValueChange={(v) => handleFilterChange("entityType", v === "all" ? "" : v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {filterOptions.entityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Entity ID</Label>
              <Input
                placeholder="Search by ID..."
                value={filters.entityId || ""}
                onChange={(e) => handleFilterChange("entityId", e.target.value)}
                className="h-9"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Start Date</Label>
              <Input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="h-9"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">End Date</Label>
              <Input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="h-9"
              />
            </div>

            <div className="flex items-end">
              <Badge color="secondary" className="h-9 px-3">
                {total.toLocaleString()} results
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Icon icon="heroicons:document-magnifying-glass" className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No audit log entries found</p>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[200px]">User</TableHead>
                  <TableHead className="w-[150px]">Action</TableHead>
                  <TableHead className="w-[120px]">Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{log.userName || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{log.userEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={ACTION_COLORS[log.action] || ""}
                      >
                        <Icon
                          icon={ACTION_ICONS[log.action] || "heroicons:document"}
                          className="mr-1 h-3 w-3"
                        />
                        {formatActionName(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{log.entityType}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.entityId.substring(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <LogSummary log={log} />
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Icon icon="heroicons:eye" className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Audit Log Details</DialogTitle>
                            <DialogDescription>
                              {formatDate(log.createdAt)} by {log.userName || log.userEmail}
                            </DialogDescription>
                          </DialogHeader>
                          <LogDetails log={log} />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Pagination */}
        {logs.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Showing {offset + 1} - {Math.min(offset + logs.length, total)} of {total}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                <Icon icon="heroicons:chevron-left" className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + logs.length >= total}
              >
                Next
                <Icon icon="heroicons:chevron-right" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// Summary component for log row
function LogSummary({ log }: { log: AuditLogEntry }) {
  const { action, oldValue, newValue } = log;

  if (action === "assignment_change" && newValue) {
    const data = newValue as any;
    return (
      <span className="text-sm">
        {data.fromAssignedToName || "Unassigned"} → {data.toAssignedToName || "Unassigned"}
      </span>
    );
  }

  if (action === "settings_change" && newValue) {
    const data = newValue as any;
    return (
      <span className="text-sm">
        <code className="text-xs bg-muted px-1 rounded">{data.key}</code> updated
      </span>
    );
  }

  if (action === "status_change" && newValue) {
    const data = newValue as any;
    return (
      <span className="text-sm">
        {data.oldStatus} → {data.newStatus}
      </span>
    );
  }

  if (action === "delete") {
    return <span className="text-sm text-red-500">Deleted</span>;
  }

  if (action === "export" && newValue) {
    const data = newValue as any;
    return (
      <span className="text-sm">
        Exported {data.exportedCount} records
      </span>
    );
  }

  return <span className="text-sm text-muted-foreground">-</span>;
}

// Detailed view for dialog
function LogDetails({ log }: { log: AuditLogEntry }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Action</Label>
          <p className="font-medium">{formatActionName(log.action)}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Entity</Label>
          <p className="font-medium">{log.entityType}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Entity ID</Label>
          <p className="font-mono text-sm">{log.entityId}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">IP Address</Label>
          <p className="font-mono text-sm">{log.ipAddress || "Unknown"}</p>
        </div>
      </div>

      {log.oldValue && (
        <div>
          <Label className="text-xs text-muted-foreground">Previous Value</Label>
          <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
            {JSON.stringify(log.oldValue, null, 2)}
          </pre>
        </div>
      )}

      {log.newValue && (
        <div>
          <Label className="text-xs text-muted-foreground">New Value</Label>
          <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
            {JSON.stringify(log.newValue, null, 2)}
          </pre>
        </div>
      )}

      {log.userAgent && (
        <div>
          <Label className="text-xs text-muted-foreground">User Agent</Label>
          <p className="text-xs text-muted-foreground break-all">{log.userAgent}</p>
        </div>
      )}
    </div>
  );
}

function formatActionName(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
