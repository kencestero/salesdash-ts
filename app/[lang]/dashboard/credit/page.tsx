"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FileText, CheckCircle, XCircle, Clock, Link2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nanoid } from "nanoid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreditApp {
  id: string;
  appNumber: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  requestedAmount?: number;
  requestedTerm?: number;
  status: string;
  createdAt: string;
  decidedAt?: string;
  approvedAmount?: number;
  approvedApr?: number;
  lender?: string;
}

export default function CreditApplicationsPage() {
  const [applications, setApplications] = useState<CreditApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/credit-applications?${params.toString()}`);
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const search = searchTerm.toLowerCase();
    const firstName = app.customer?.firstName || app.firstName || "";
    const lastName = app.customer?.lastName || app.lastName || "";
    const email = app.customer?.email || app.email || "";
    return (
      app.appNumber.toLowerCase().includes(search) ||
      firstName.toLowerCase().includes(search) ||
      lastName.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search)
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "declined":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
      case "submitted":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "declined":
        return "bg-red-500";
      case "submitted":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending" || a.status === "submitted")
      .length,
    approved: applications.filter((a) => a.status === "approved").length,
    declined: applications.filter((a) => a.status === "declined").length,
  };

  const generateShareLink = () => {
    const token = nanoid(16);
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/apply/${token}`;
    return { token, shareUrl };
  };

  const copyShareLink = async () => {
    const { token, shareUrl } = generateShareLink();

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 3000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Credit Applications</h1>
          <p className="text-gray-400">Share application links with customers</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={copyShareLink}
            className="bg-[#f5a623] hover:bg-[#e09612] text-white"
          >
            {copiedToken ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Link Copied!
              </>
            ) : (
              <>
                <Link2 className="mr-2 h-4 w-4" />
                Copy Application Link
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-[#1a1d29] border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-[#f5a623]" />
            <CardTitle className="text-white">Share Credit Application</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-300">
            Click "Copy Application Link" above to generate a unique link you can share with customers.
            They can fill out the credit application without needing to log in.
          </p>
          <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <FileText className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-300">
              <strong>How it works:</strong> Share the link via text, email, or in person.
              Customers complete the form with e-signature, and submissions appear below automatically.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Approved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Declined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats.declined}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1d29] border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by app#, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0f1117] border-gray-700 text-white"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-[#0f1117] border-gray-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="bg-[#1a1d29] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            {filteredApplications.length} Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading applications...</div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No credit applications found. Create your first application to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">App #</TableHead>
                    <TableHead className="text-gray-400">Customer</TableHead>
                    <TableHead className="text-gray-400">Requested</TableHead>
                    <TableHead className="text-gray-400">Approved</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => {
                    const firstName = app.customer?.firstName || app.firstName || "N/A";
                    const lastName = app.customer?.lastName || app.lastName || "";
                    const email = app.customer?.email || app.email || "N/A";

                    return (
                    <TableRow key={app.id} className="border-gray-700">
                      <TableCell className="font-medium text-white">
                        {app.appNumber}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="font-semibold">
                          {firstName} {lastName}
                        </div>
                        <div className="text-sm text-gray-400">{email}</div>
                      </TableCell>
                      <TableCell className="text-white">
                        {app.requestedAmount ? (
                          <>
                            <div>${app.requestedAmount.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">
                              {app.requestedTerm} months
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-white">
                        {app.approvedAmount ? (
                          <>
                            <div>${app.approvedAmount.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">
                              {app.approvedApr}% APR
                            </div>
                            {app.lender && (
                              <div className="text-xs text-gray-500">{app.lender}</div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(app.status)} text-white`}>
                          <span className="mr-1">{getStatusIcon(app.status)}</span>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
