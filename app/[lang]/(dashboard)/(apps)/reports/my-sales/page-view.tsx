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
import {
  DollarSign,
  TrendingUp,
  Package,
  Download,
  Filter,
  Loader2,
  Calendar,
  RefreshCw,
  Wallet,
  Target,
  User,
} from "lucide-react";

interface MySalesReportViewProps {
  session: Session;
}

interface Deal {
  id: string;
  dealNumber: string;
  customerName: string;
  customerId: string;
  deliveryDate: string;
  finalPrice: number;
  trailerCost: number;
  profit: number;
  profitMargin: number;
  commission: number;
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
  totalCommission: number;
  avgMargin: string;
  commissionRate: string;
}

interface RepInfo {
  name: string;
  repCode: string;
  email: string;
}

interface MonthlyData {
  month: number;
  sales: number;
  revenue: number;
  profit: number;
  commission: number;
}

interface Filters {
  manufacturers: string[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MySalesReportView({ session }: MySalesReportViewProps) {
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [repInfo, setRepInfo] = useState<RepInfo | null>(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthlyData[]>([]);
  const [filters, setFilters] = useState<Filters>({ manufacturers: [] });

  // Filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState("all");

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (selectedManufacturer !== "all") params.set("manufacturer", selectedManufacturer);

      const res = await fetch(`/api/reports/my-sales?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDeals(data.deals || []);
        setSummary(data.summary || null);
        setRepInfo(data.repInfo || null);
        setMonthlyBreakdown(data.monthlyBreakdown || []);
        setFilters(data.filters || { manufacturers: [] });
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
    setSelectedManufacturer("all");
    setTimeout(fetchReport, 0);
  };

  const handleExportCSV = () => {
    if (deals.length === 0) return;

    const headers = [
      "Deal #",
      "Customer",
      "Delivery Date",
      "Sale Price",
      "Cost",
      "Profit",
      "Commission (20%)",
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
      deal.deliveryDate ? new Date(deal.deliveryDate).toLocaleDateString() : "",
      deal.finalPrice?.toFixed(2) || "",
      deal.trailerCost?.toFixed(2) || "",
      deal.profit?.toFixed(2) || "",
      deal.commission?.toFixed(2) || "",
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
    link.setAttribute("download", `my-sales-report-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get current month for highlighting
  const currentMonth = new Date().getMonth();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Sales</h1>
          <p className="text-muted-foreground">
            Track your personal sales performance and commissions
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

      {/* Rep Info Card */}
      {repInfo && (
        <Card className="bg-gradient-to-r from-[#09213C] to-[#0d2d52] text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full">
                <User className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xl font-bold">{repInfo.name}</p>
                <p className="text-white/70">
                  {repInfo.repCode} • {repInfo.email}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-white/70">Commission Rate</p>
                <p className="text-2xl font-bold text-[#E96114]">
                  {summary?.commissionRate || 20}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <p className="text-sm text-muted-foreground">Units Sold</p>
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

            <Card className="bg-gradient-to-br from-[#E96114] to-[#c55010] text-white border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80">My Commission</p>
                    <p className="text-2xl font-bold">
                      ${(summary?.totalCommission || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Margin</p>
                    <p className="text-2xl font-bold">{summary?.avgMargin || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown & Deals Table Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Monthly Breakdown */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#E96114]" />
                  {new Date().getFullYear()} Monthly
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {monthlyBreakdown.map((data) => (
                    <div
                      key={data.month}
                      className={`p-3 rounded-lg transition-colors ${
                        data.month === currentMonth
                          ? "bg-[#E96114]/10 border border-[#E96114]/30"
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${
                          data.month === currentMonth ? "text-[#E96114]" : ""
                        }`}>
                          {MONTH_NAMES[data.month]}
                        </span>
                        <Badge color={data.sales > 0 ? "default" : "secondary"}>
                          {data.sales} {data.sales === 1 ? "unit" : "units"}
                        </Badge>
                      </div>
                      {data.sales > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Revenue:</span>
                            <span className="font-medium text-foreground">
                              ${data.revenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Profit:</span>
                            <span className="font-medium text-emerald-600">
                              ${data.profit.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Commission:</span>
                            <span className="font-medium text-[#E96114]">
                              ${data.commission.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deals Table */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  My Sales History ({deals.length})
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
                          <TableHead>Date</TableHead>
                          <TableHead>Trailer</TableHead>
                          <TableHead className="text-right">Sale Price</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                          <TableHead className="text-right">Commission</TableHead>
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
                            <TableCell className="text-right font-bold text-[#E96114]">
                              ${(deal.commission || 0).toLocaleString()}
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
                    <p className="text-sm text-muted-foreground mt-2">
                      Start selling to see your performance here!
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
