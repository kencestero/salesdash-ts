"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { AddCustomerDialog } from "./add-customer-dialog";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  source?: string;
  companyName?: string;
  city?: string;
  state?: string;
  assignedTo?: string;
  createdAt: string;
  lastContactedAt?: string;
  _count: {
    deals: number;
    activities: number;
    quotes: number;
  };
  deals: any[];
  activities: any[];
}

// Status badge colors
const statusColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Applied: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Approved: "bg-green-100 text-green-800 hover:bg-green-100",
  "Dead Deal": "bg-red-100 text-red-800 hover:bg-red-100",
  contacted: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  qualified: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  negotiating: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  won: "bg-green-100 text-green-800 hover:bg-green-100",
  lost: "bg-red-100 text-red-800 hover:bg-red-100",
};

// Status icons
const statusIcons: Record<string, any> = {
  lead: AlertCircle,
  Applied: Clock,
  Approved: CheckCircle2,
  "Dead Deal": XCircle,
  contacted: Clock,
  qualified: CheckCircle2,
  negotiating: TrendingUp,
  won: CheckCircle2,
  lost: XCircle,
};

export default function CustomersPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Check if we should auto-open the add dialog
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setShowAddDialog(true);
    }
  }, [searchParams]);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/crm/customers?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();
      setCustomers(data.customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Calculate stats
  const stats = {
    total: customers.length,
    leads: customers.filter((c) => c.status === "lead").length,
    applied: customers.filter((c) => c.status === "Applied").length,
    approved: customers.filter((c) => c.status === "Approved").length,
    deadDeals: customers.filter((c) => c.status === "Dead Deal").length,
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-default-900">Customer Management</h1>
          <p className="text-default-600 mt-1">
            Manage your leads, customers, and sales opportunities
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Leads</p>
                <p className="text-2xl font-bold">{stats.leads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied</p>
                <p className="text-2xl font-bold">{stats.applied}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dead Deals</p>
                <p className="text-2xl font-bold">{stats.deadDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="lead">New Leads</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Dead Deal">Dead Deals</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === "all" ? "All Customers" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Customers`}
            {" "}({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-muted-foreground mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first customer to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-32rem)] overflow-y-auto pr-2">
              {customers.map((customer) => {
                const StatusIcon = statusIcons[customer.status] || AlertCircle;
                return (
                  <div
                    key={customer.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Customer Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Users className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link href={`/en/crm/customers/${customer.id}`} className="hover:underline">
                                <h3 className="text-lg font-semibold cursor-pointer text-orange-600 hover:text-orange-700">
                                  {customer.firstName} {customer.lastName}
                                </h3>
                              </Link>
                              <Badge className={statusColors[customer.status]}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {customer.status}
                              </Badge>
                              {customer.companyName && (
                                <Badge variant="outline">{customer.companyName}</Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <a
                                  href={`mailto:${customer.email}`}
                                  className="hover:text-orange-500 hover:underline"
                                >
                                  {customer.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <a
                                  href={`tel:${customer.phone}`}
                                  className="hover:text-orange-500 hover:underline"
                                >
                                  {customer.phone}
                                </a>
                              </div>
                              {(customer.city || customer.state) && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {customer.city && customer.state
                                    ? `${customer.city}, ${customer.state}`
                                    : customer.city || customer.state}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Last contact: {formatDate(customer.lastContactedAt)}
                              </div>
                            </div>

                            {/* Activity Summary */}
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span>{customer._count.deals} deals</span>
                              <span>{customer._count.activities} activities</span>
                              <span>{customer._count.quotes} quotes</span>
                              {customer.source && <span>Source: {customer.source}</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Link href={`/en/crm/customers/${customer.id}`}>
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchCustomers}
      />
    </div>
  );
}
