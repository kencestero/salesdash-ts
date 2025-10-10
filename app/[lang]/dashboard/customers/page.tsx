"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Tag,
  TrendingUp,
  Users,
  Activity as ActivityIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  companyName?: string;
  status: string;
  source?: string;
  assignedTo?: string;
  tags: string[];
  createdAt: string;
  lastContactedAt?: string;
  _count?: {
    deals: number;
    activities: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();
    return (
      customer.firstName.toLowerCase().includes(search) ||
      customer.lastName.toLowerCase().includes(search) ||
      customer.email.toLowerCase().includes(search) ||
      customer.phone.toLowerCase().includes(search) ||
      (customer.companyName && customer.companyName.toLowerCase().includes(search))
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "lead":
        return "bg-gray-500";
      case "contacted":
        return "bg-blue-500";
      case "qualified":
        return "bg-purple-500";
      case "negotiating":
        return "bg-yellow-500";
      case "won":
        return "bg-green-500";
      case "lost":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const stats = {
    total: customers.length,
    leads: customers.filter((c) => c.status === "lead").length,
    active: customers.filter((c) =>
      ["contacted", "qualified", "negotiating"].includes(c.status)
    ).length,
    won: customers.filter((c) => c.status === "won").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">CRM - Customers</h1>
          <p className="text-gray-400">Manage customer relationships and leads</p>
        </div>
        <Button className="bg-[#f5a623] hover:bg-[#e09612] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              <CardDescription className="text-gray-400">Total Customers</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <CardDescription className="text-gray-400">New Leads</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-400">{stats.leads}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ActivityIcon className="h-4 w-4 text-yellow-400" />
              <CardDescription className="text-gray-400">Active Pipeline</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <CardDescription className="text-gray-400">Closed Won</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.won}</div>
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
                placeholder="Search by name, email, phone, or company..."
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
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-[#1a1d29] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">{filteredCustomers.length} Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No customers found. Add your first customer to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-gray-400">Contact</TableHead>
                    <TableHead className="text-gray-400">Location</TableHead>
                    <TableHead className="text-gray-400">Source</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Activity</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="border-gray-700">
                      <TableCell className="text-white">
                        <div className="font-semibold">
                          {customer.firstName} {customer.lastName}
                        </div>
                        {customer.companyName && (
                          <div className="text-sm text-gray-400">{customer.companyName}</div>
                        )}
                        {customer.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {customer.tags.slice(0, 2).map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs border-gray-600 text-gray-400"
                              >
                                <Tag className="h-2 w-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {customer.city && customer.state ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.city}, {customer.state}
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {customer.source || <span className="text-gray-500">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(customer.status)} text-white`}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {customer._count && (
                          <>
                            <div>{customer._count.deals} deals</div>
                            <div className="text-xs text-gray-500">
                              {customer._count.activities} activities
                            </div>
                          </>
                        )}
                        {customer.lastContactedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Last: {new Date(customer.lastContactedAt).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#f5a623] hover:text-[#e09612]"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
