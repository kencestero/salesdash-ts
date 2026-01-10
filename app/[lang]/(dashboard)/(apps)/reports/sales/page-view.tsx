"use client";

import { useState, useEffect } from "react";
import { Session } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Download,
  Filter,
  Loader2,
  Trophy,
  Calendar,
  RefreshCw,
} from "lucide-react";

interface SalesReportViewProps {
  session: Session;
}

interface Deal {
  id: string;
  dealNumber: string;
  customerName: string;
  customerId: string;
  soldByName: string;
  soldByRepCode: string;
  deliveryDate: string;
  finalPrice: number;
  trailerCost: number;
  profit: number;
  profitMargin: number;
  trailerManufacturer: string;
  trailerCategory: string;
  trailerSize: string;
  trailerVin: string;
  trailerStockNumber: string;
  dealType: string;
  notes: string;
}

interface Summary {
  totalSales: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  avgMargin: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  repCode: string;
  count: number;
  revenue: number;
  profit: number;
}

interface Filters {
  manufacturers: string[];
  salespeople: { id: string; name: string; repCode: string }[];
}

export default function SalesReportView({ session }: SalesReportViewProps) {
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filters, setFilters] = useState<Filters>({ manufacturers: [], salespeople: [] });

  // Filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSalesperson, setSelectedSalesperson] = useState("all");
  const [selectedManufacturer, setSelectedManufacturer] = useState("all");

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (selectedSalesperson !== "all") params.set("salespersonId", selectedSalesperson);
      if (selectedManufacturer !== "all") params.set("manufacturer", selectedManufacturer);

      const res = await fetch(`/api/reports/sales?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDeals(data.deals || []);
        setSummary(data.summary || null);
        setLeaderboard(data.leaderboard || []);
        setFilters(data.filters || { manufacturers: [], salespeople: [] });
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedSalesperson("all");
    setSelectedManufacturer("all");
    // Fetch will be triggered after state updates
    setTimeout(fetchReport, 0);
  };

  const handleExportCSV = () => {
    if (deals.length === 0) return;

    const headers = [
      "Deal #",
      "Customer",
      "Sold By",
      "Rep Code",
      "Delivery Date",
      "Sale Price",
      "Cost",
      "Profit",
      "Margin %",
      "Manufacturer",
      "Category",
      "Size",
      "VIN",
      "Stock #",
      "Deal Type",
    ];

    const rows = deals.map((deal) => [
      deal.dealNumber,
      deal.customerName,
      deal.soldByName,
      deal.soldByRepCode,
      deal.deliveryDate ? new Date(deal.deliveryDate).toLocaleDateString() : "",
      deal.finalPrice?.toFixed(2) || "",
      deal.trailerCost?.toFixed(2) || "",
      deal.profit?.toFixed(2) || "",
      deal.profitMargin?.toFixed(1) || "",
      deal.trailerManufacturer || "",
      deal.trailerCategory || "",
      deal.trailerSize || "",
      deal.trailerVin || "",
      deal.trailerStockNumber || "",
      deal.dealType || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sales-report-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sales Report</h1>
          <p className="text-muted-foreground">
            Track and analyze your team's sales performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetFilters}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleExportCSV} disabled={deals.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Salesperson</Label>
              <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
                <SelectTrigger>
                  <SelectValue placeholder="All Salespeople" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salespeople</SelectItem>
                  {filters.salespeople.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.name} {sp.repCode && `(${sp.repCode})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Manufacturer</Label>
              <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                <SelectTrigger>
                  <SelectValue placeholder="All Manufacturers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Manufacturers</SelectItem>
                  {filters.manufacturers.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleApplyFilters} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">{summary?.totalSales || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      ${(summary?.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                    <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-2xl font-bold">
                      ${(summary?.totalCost || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                    <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Profit</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      ${(summary?.totalProfit || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Margin</p>
                    <p className="text-2xl font-bold">{summary?.avgMargin || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard & Table Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Leaderboard */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Sales Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-4">
                    {leaderboard.slice(0, 5).map((entry, index) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-400"
                              : index === 2
                              ? "bg-amber-600"
                              : "bg-slate-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.repCode} • {entry.count} sales
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            ${entry.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No sales data yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Deals Table */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Sales History ({deals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Deal #</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Sold By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Trailer</TableHead>
                          <TableHead className="text-right">Sale Price</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                          <TableHead className="text-right">Margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deals.map((deal) => (
                          <TableRow key={deal.id}>
                            <TableCell>
                              <Badge variant="outline">{deal.dealNumber}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {deal.customerName}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{deal.soldByName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {deal.soldByRepCode}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {deal.deliveryDate
                                ? new Date(deal.deliveryDate).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {deal.trailerManufacturer || "N/A"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {deal.trailerSize || ""} {deal.trailerCategory || ""}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${(deal.finalPrice || 0).toLocaleString()}
                            </TableCell>
                            <TableCell
                              className={`text-right font-medium ${
                                (deal.profit || 0) >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              ${(deal.profit || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={
                                  (deal.profitMargin || 0) >= 0
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {(deal.profitMargin || 0).toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No sales found for the selected filters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
