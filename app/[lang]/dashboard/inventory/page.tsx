"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { FireBadge } from "@/components/ui/fire-badge";

interface Trailer {
  id: string;
  vin: string;
  stockNumber: string;
  manufacturer: string;
  model: string;
  year: number;
  category: string;
  length: number;
  width: number;
  msrp: number;
  salePrice: number;
  status: string;
  location?: string;
  images: string[];
  createdAt: string;
  daysOld?: number; // Calculated on server
}

export default function InventoryPage() {
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchInventory();
  }, [statusFilter, categoryFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      const res = await fetch(`/api/inventory?${params.toString()}`);
      const data = await res.json();
      setTrailers(data.trailers || []);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrailers = trailers.filter((trailer) => {
    const search = searchTerm.toLowerCase();
    return (
      trailer.manufacturer.toLowerCase().includes(search) ||
      trailer.model.toLowerCase().includes(search) ||
      trailer.stockNumber.toLowerCase().includes(search) ||
      trailer.vin.toLowerCase().includes(search)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "sold":
        return "bg-gray-500";
      case "reserved":
        return "bg-yellow-500";
      case "pending":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const stats = {
    total: trailers.length,
    available: trailers.filter((t) => t.status === "available").length,
    sold: trailers.filter((t) => t.status === "sold").length,
    reserved: trailers.filter((t) => t.status === "reserved").length,
    totalValue: trailers
      .filter((t) => t.status === "available")
      .reduce((sum, t) => sum + t.salePrice, 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Inventory</h1>
          <p className="text-gray-400">Manage your trailer inventory</p>
        </div>
        <Button className="bg-[#f5a623] hover:bg-[#e09612] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Trailer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.available}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Reserved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.reserved}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-400">{stats.sold}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#f5a623]">
              ${stats.totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-[#1a1d29] border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by stock#, VIN, manufacturer, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0f1117] border-gray-700 text-white"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-[#0f1117] border-gray-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 bg-[#0f1117] border-gray-700 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Utility">Utility</SelectItem>
                <SelectItem value="Dump">Dump</SelectItem>
                <SelectItem value="Enclosed">Enclosed</SelectItem>
                <SelectItem value="Gooseneck">Gooseneck</SelectItem>
                <SelectItem value="Flatbed">Flatbed</SelectItem>
                <SelectItem value="Car Hauler">Car Hauler</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-[#1a1d29] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            {filteredTrailers.length} Trailers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading inventory...</div>
          ) : filteredTrailers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No trailers found. Add your first trailer to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Stock #</TableHead>
                    <TableHead className="text-gray-400">Image</TableHead>
                    <TableHead className="text-gray-400">Details</TableHead>
                    <TableHead className="text-gray-400">Specs</TableHead>
                    <TableHead className="text-gray-400">Pricing</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrailers.map((trailer) => (
                    <TableRow key={trailer.id} className="border-gray-700">
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          {trailer.stockNumber}
                          {trailer.daysOld !== undefined && trailer.daysOld <= 2 && (
                            <FireBadge daysOld={trailer.daysOld} size="sm" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {trailer.images && trailer.images.length > 0 ? (
                          <img
                            src={trailer.images[0]}
                            alt={trailer.model}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="font-semibold">
                          {trailer.year} {trailer.manufacturer}
                        </div>
                        <div className="text-sm text-gray-400">{trailer.model}</div>
                        <div className="text-xs text-gray-500">{trailer.category}</div>
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {trailer.length}' x {trailer.width}'
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="font-semibold">
                          ${trailer.salePrice.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400 line-through">
                          MSRP: ${trailer.msrp.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(trailer.status)} text-white`}>
                          {trailer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
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
