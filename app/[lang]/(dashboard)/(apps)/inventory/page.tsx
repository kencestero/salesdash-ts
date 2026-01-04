"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Eye, FileText, Upload, X, ArrowUp, Info, History, DollarSign, Ruler, Package, Calendar } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useDraggableColumns } from '@/hooks/use-draggable-columns';
import { ColumnManager } from '@/components/inventory/column-manager';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { FireBadge } from "@/components/ui/fire-badge";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  height?: number;
  msrp: number;
  salePrice: number;
  cost: number;
  makeOffer: boolean;
  status: string;
  location?: string;
  images: string[];
  createdAt: string;
  daysOld?: number;
  features?: string[];
  description?: string;
}

// Auto-classify trailer based on features/description
function classifyTrailer(trailer: Trailer): string {
  const description = trailer.description?.toLowerCase() || '';
  const model = trailer.model.toLowerCase();
  const features = trailer.features?.join(' ').toLowerCase() || '';
  const allText = `${description} ${model} ${features}`;

  // Priority order for classification
  if (allText.includes('concession')) return 'Concession';
  if (allText.includes('racing package') || allText.includes('racing')) return 'Racing Package';
  if (allText.includes('dump')) return 'Dump Trailer';

  // Default to Enclosed if none of the above
  return 'Enclosed';
}

// Calculate desired selling price with $1,500 MINIMUM PROFIT rule
// Logic: Always multiply cost × 1.25, but if profit < $1,500, enforce cost + $1,500
function calculateDesiredPrice(cost: number): number {
  const standardPrice = cost * 1.25;
  const profit = standardPrice - cost; // This is 25% of cost (0.25 × cost)

  // If profit from 1.25× is less than $1,500, enforce minimum profit cap
  if (profit < 1500) {
    return cost + 1500; // Minimum $1,500 profit
  } else {
    return standardPrice; // Profit is good, use 1.25× multiplier
  }
}

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;
  const canUploadPDF = userRole === 'owner' || userRole === 'director';

  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues by waiting for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Draggable columns hook
  const {
    columns,
    allColumns,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    toggleColumnVisibility,
    moveColumn,
    resetColumns
  } = useDraggableColumns();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [manufacturerFilter, setManufacturerFilter] = useState("all");
  const [selectedTrailers, setSelectedTrailers] = useState<string[]>([]);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sortBy, setSortBy] = useState<"age" | "price" | "size" | "stock">("age");

  // Drawer/Sheet state for trailer details
  const [selectedTrailerForView, setSelectedTrailerForView] = useState<Trailer | null>(null);
  const [loadingTrailerDetail, setLoadingTrailerDetail] = useState(false);

  // Scroll to top handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const filteredTrailers = trailers
    .filter((trailer) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = (
        trailer.manufacturer.toLowerCase().includes(search) ||
        trailer.model.toLowerCase().includes(search) ||
        trailer.stockNumber.toLowerCase().includes(search) ||
        trailer.vin.toLowerCase().includes(search)
      );

      const matchesManufacturer = manufacturerFilter === "all" ||
        (manufacturerFilter === "diamond" && trailer.manufacturer.toLowerCase().includes('diamond')) ||
        (manufacturerFilter === "quality" && trailer.manufacturer.toLowerCase().includes('quality'));

      return matchesSearch && matchesManufacturer;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "age":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "price":
          return a.salePrice - b.salePrice;
        case "size":
          return a.length - b.length;
        case "stock":
          return a.stockNumber.localeCompare(b.stockNumber);
        default:
          return 0;
      }
    });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTrailers(filteredTrailers.map(t => t.id));
    } else {
      setSelectedTrailers([]);
    }
  };

  const handleSelectTrailer = (trailerId: string, checked: boolean) => {
    if (checked) {
      setSelectedTrailers(prev => [...prev, trailerId]);
    } else {
      setSelectedTrailers(prev => prev.filter(id => id !== trailerId));
    }
  };

  const handleGeneratePDF = async () => {
    if (selectedTrailers.length === 0) {
      toast({
        title: "No trailers selected",
        description: "Please select at least one trailer to generate a quote.",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingPDF(true);
      const selected = trailers.filter(t => selectedTrailers.includes(t.id));

      const response = await fetch("/api/quotes/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trailers: selected }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MJ-Cargo-Quote-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF Generated",
        description: `Quote generated for ${selectedTrailers.length} trailer(s)`,
      });

      setSelectedTrailers([]);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleUploadPDF = async (file: File) => {
    try {
      setUploadingPDF(true);
      setUploadResults(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/inventory/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Upload failed');

      setUploadResults(data);

      toast({
        title: "Upload Successful",
        description: `${data.summary.successful} trailer(s) imported successfully`,
      });

      fetchInventory();
    } catch (error: any) {
      console.error("PDF upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPDF(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];
      const fileName = file.name.toLowerCase();
      const isValid = validTypes.includes(file.type) ||
                     fileName.endsWith('.pdf') ||
                     fileName.endsWith('.xlsx') ||
                     fileName.endsWith('.xls') ||
                     fileName.endsWith('.csv');

      if (!isValid) {
        toast({
          title: "Invalid File",
          description: "Please select a PDF, Excel (.xlsx), or CSV file.",
          variant: "destructive",
        });
        return;
      }
      handleUploadPDF(file);
    }
  };

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
    diamondCargo: trailers.filter((t) => t.manufacturer.toLowerCase().includes('diamond')).length,
    qualityCargo: trailers.filter((t) => t.manufacturer.toLowerCase().includes('quality')).length,
  };

  const allSelected = filteredTrailers.length > 0 && selectedTrailers.length === filteredTrailers.length;

  const handleViewTrailer = async (trailerId: string) => {
    try {
      setLoadingTrailerDetail(true);
      const response = await fetch(`/api/inventory/${trailerId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch trailer");
      }

      const data = await response.json();
      setSelectedTrailerForView(data.trailer);
    } catch (error) {
      console.error("Error fetching trailer:", error);
      toast({
        title: "Error",
        description: "Failed to load trailer details",
        variant: "destructive",
      });
    } finally {
      setLoadingTrailerDetail(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Live Inventory</h1>
          <p className="text-lg text-gray-400 mt-1">Manage your trailer inventory</p>
        </div>
        <div className="flex gap-3">
          <ColumnManager
            columns={allColumns}
            onToggleVisibility={toggleColumnVisibility}
            onMoveColumn={moveColumn}
            onReset={resetColumns}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
          {mounted && canUploadPDF && (
            <Link href="/en/inventory/history">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-[#1a1d29] hover:text-white text-base px-6"
              >
                <History className="mr-2 h-5 w-5" />
                Upload History
              </Button>
            </Link>
          )}
          {selectedTrailers.length > 0 && (
            <Button
              onClick={handleGeneratePDF}
              disabled={generatingPDF}
              className="bg-green-500 hover:bg-green-600 text-white text-base px-6"
            >
              <FileText className="mr-2 h-5 w-5" />
              {generatingPDF ? "Generating..." : `Generate PDF (${selectedTrailers.length})`}
            </Button>
          )}
          {mounted && canUploadPDF && (
            <Link href="/inventory/upload">
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white text-base px-6"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload File
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards - Manufacturer Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a1d29] border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400 text-base">Total Units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-blue-500 border-2">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-400 text-base font-semibold">Diamond Cargo Units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-400">{stats.diamondCargo}</div>
            <div className="text-xs text-blue-300 mt-1">DC Total in Stock</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-red-500 border-2">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-400 text-base font-semibold">Quality Cargo Units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-400">{stats.qualityCargo}</div>
            <div className="text-xs text-red-300 mt-1">QC Total in Stock</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-[#1a1d29] border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by stock#, VIN, manufacturer, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0f1117] border-gray-700 text-white text-base h-12"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-[#0f1117] border-gray-700 text-white text-base h-12">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
              <SelectTrigger className="w-full md:w-48 bg-[#0f1117] border-gray-700 text-white text-base h-12">
                <SelectValue placeholder="Manufacturer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Manufacturers</SelectItem>
                <SelectItem value="diamond">Diamond Cargo</SelectItem>
                <SelectItem value="quality">Quality Cargo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 bg-[#0f1117] border-gray-700 text-white text-base h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Enclosed">Enclosed</SelectItem>
                <SelectItem value="Concession">Concession</SelectItem>
                <SelectItem value="Racing Package">Racing Package</SelectItem>
                <SelectItem value="Dump Trailer">Dump Trailer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-full md:w-48 bg-[#0f1117] border-gray-700 text-white text-base h-12">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="age">Newest First</SelectItem>
                <SelectItem value="price">Lowest Price</SelectItem>
                <SelectItem value="size">Smallest Size</SelectItem>
                <SelectItem value="stock">Stock Number</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-[#1a1d29] border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white text-2xl">
              {filteredTrailers.length} Trailers
            </CardTitle>
            {selectedTrailers.length > 0 && (
              <p className="text-base text-gray-400">
                {selectedTrailers.length} selected
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-lg">Loading inventory...</div>
          ) : filteredTrailers.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-lg">
              No trailers found. Upload a PDF to import inventory.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    {columns.map((column) => (
                      <TableHead
                        key={column.id}
                        draggable
                        onDragStart={() => handleDragStart(column.id)}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, column.id)}
                        className={`text-gray-400 text-base font-bold cursor-move ${column.width || ''}`}
                      >
                        {column.id === 'select' ? (
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                          />
                        ) : (
                          column.label
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrailers.map((trailer) => {
                    const trailerCategory = classifyTrailer(trailer);

                    return (
                      <TableRow key={trailer.id} className="border-gray-700 hover:bg-[#0f1117]">
                        {columns.map((column) => {
                          switch(column.id) {
                            case 'select':
                              return (
                                <TableCell key={column.id}>
                                  <Checkbox
                                    checked={selectedTrailers.includes(trailer.id)}
                                    onCheckedChange={(checked) =>
                                      handleSelectTrailer(trailer.id, checked as boolean)
                                    }
                                    aria-label={`Select ${trailer.stockNumber}`}
                                  />
                                </TableCell>
                              );

                            case 'stockVin':
                              return (
                                <TableCell key={column.id}>
                                  <div className="space-y-1">
                                    <div className="font-bold text-white text-base flex items-center gap-2">
                                      {trailer.stockNumber}
                                      {trailer.daysOld !== undefined && trailer.daysOld <= 2 && (
                                        <FireBadge daysOld={trailer.daysOld} size="sm" />
                                      )}
                                    </div>
                                    <div className="font-mono text-[#f5a623] text-sm">
                                      {trailer.vin}
                                    </div>
                                  </div>
                                </TableCell>
                              );

                            case 'manufacturer':
                              return (
                                <TableCell key={column.id}>
                                  <div className="flex items-center gap-3">
                                    {trailer.manufacturer.toLowerCase().includes('diamond') ? (
                                      <img
                                        src="/images/logo/dctranslogo.png"
                                        alt="Diamond Cargo"
                                        className="w-12 h-12 object-contain"
                                      />
                                    ) : trailer.manufacturer.toLowerCase().includes('quality') ? (
                                      <img
                                        src="/images/logo/qualitycargologo.webp"
                                        alt="Quality Cargo"
                                        className="w-12 h-12 object-contain"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-400">
                                        MJ
                                      </div>
                                    )}
                                    <div className={`text-base font-bold ${
                                      trailer.manufacturer.toLowerCase().includes('diamond')
                                        ? 'text-blue-400'
                                        : trailer.manufacturer.toLowerCase().includes('quality')
                                        ? 'text-red-400'
                                        : 'text-white'
                                    }`}>
                                      {trailer.manufacturer}
                                    </div>
                                  </div>
                                </TableCell>
                              );

                            case 'image':
                              return (
                                <TableCell key={column.id}>
                                  {trailer.images && trailer.images.length > 0 ? (
                                    <img
                                      src={trailer.images[0]}
                                      alt={trailer.model}
                                      className="w-20 h-20 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center text-gray-400 text-sm">
                                      No Image
                                    </div>
                                  )}
                                </TableCell>
                              );

                            case 'size':
                              return (
                                <TableCell key={column.id} className="text-white font-bold text-lg">
                                  {trailer.width}'x{trailer.length}'
                                  {trailer.height && <div className="text-xs text-gray-400 font-normal">H: {trailer.height}'</div>}
                                </TableCell>
                              );

                            case 'details':
                              return (
                                <TableCell key={column.id} className="text-white">
                                  <div className={`text-lg font-semibold ${
                                    trailer.manufacturer.toLowerCase().includes('diamond')
                                      ? 'text-blue-400'
                                      : trailer.manufacturer.toLowerCase().includes('quality')
                                      ? 'text-red-400'
                                      : 'text-white'
                                  }`}>
                                    {trailer.manufacturer}
                                  </div>
                                  <div className="text-base text-gray-300">{trailer.model}</div>
                                  <div className="text-sm text-gray-400">{trailerCategory}</div>
                                </TableCell>
                              );

                            case 'price':
                              return (
                                <TableCell key={column.id} className="text-white">
                                  {trailer.makeOffer ? (
                                    <div>
                                      <div className="text-xl font-black text-red-600 animate-pulse">
                                        MAKE OFFER
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Cost: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trailer.cost)}
                                      </div>
                                    </div>
                                  ) : !trailer.salePrice || trailer.salePrice === 0 ? (
                                    <div className="text-xl font-bold text-yellow-400">
                                      Ask for Pricing
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="text-xl font-bold text-green-400">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trailer.salePrice)}
                                      </div>
                                      {trailer.msrp > trailer.salePrice && (
                                        <div className="text-xs text-gray-500 line-through">
                                          MSRP: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trailer.msrp)}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                              );

                            case 'status':
                              return (
                                <TableCell key={column.id}>
                                  <Badge className={`${getStatusColor(trailer.status)} text-white text-sm px-3 py-1`}>
                                    {trailer.status}
                                  </Badge>
                                </TableCell>
                              );

                            case 'notes':
                              return (
                                <TableCell key={column.id}>
                                  {trailer.description && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-400 hover:text-blue-300"
                                          >
                                            <Info className="h-5 w-5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-md bg-[#1a1d29] border-gray-700 text-white">
                                          <p className="text-sm whitespace-pre-wrap">{trailer.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </TableCell>
                              );

                            case 'actions':
                              return (
                                <TableCell key={column.id}>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-400 hover:text-blue-300"
                                      onClick={() => handleViewTrailer(trailer.id)}
                                    >
                                      <Eye className="h-5 w-5" />
                                    </Button>
                                    {mounted && canUploadPDF && (
                                      <Link href={`/inventory/${trailer.id}/edit`}>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-green-400 hover:text-green-300"
                                        >
                                          Edit
                                        </Button>
                                      </Link>
                                    )}
                                  </div>
                                </TableCell>
                              );

                            default:
                              return <TableCell key={column.id}>-</TableCell>;
                          }
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trailer Detail Drawer */}
      <Sheet open={!!selectedTrailerForView} onOpenChange={(open) => !open && setSelectedTrailerForView(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl bg-[#0f1117] border-gray-700 overflow-y-auto">
          {loadingTrailerDetail ? (
            <div className="flex items-center justify-center h-full">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            </div>
          ) : selectedTrailerForView && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <SheetTitle className="text-2xl font-bold text-white">
                    {selectedTrailerForView.manufacturer} {selectedTrailerForView.model}
                  </SheetTitle>
                  <Badge className={`${getStatusColor(selectedTrailerForView.status)} text-white`}>
                    {selectedTrailerForView.status}
                  </Badge>
                  {selectedTrailerForView.daysOld !== undefined && selectedTrailerForView.daysOld <= 2 && (
                    <FireBadge daysOld={selectedTrailerForView.daysOld} size="md" />
                  )}
                </div>
                <p className="text-gray-400 text-left">
                  Stock #{selectedTrailerForView.stockNumber} • VIN: <span className="text-[#f5a623] font-bold">{selectedTrailerForView.vin}</span>
                </p>
              </SheetHeader>

              {/* Image Gallery */}
              {selectedTrailerForView.images && selectedTrailerForView.images.length > 0 && (
                <div className="space-y-2">
                  <img
                    src={selectedTrailerForView.images[0]}
                    alt={selectedTrailerForView.model}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Pricing Card */}
              <Card className="bg-[#1a1d29] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTrailerForView.makeOffer ? (
                    <div className="text-center py-4">
                      <div className="text-3xl font-black text-red-600 animate-pulse mb-2">
                        MAKE OFFER
                      </div>
                      <div className="text-sm text-gray-400">Contact us for pricing</div>
                    </div>
                  ) : !selectedTrailerForView.salePrice || selectedTrailerForView.salePrice === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">Ask for Pricing</div>
                      <div className="text-sm text-gray-400">Contact us for current pricing</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Selling Price</p>
                        <p className="text-4xl font-bold text-green-400">
                          {formatCurrency(selectedTrailerForView.salePrice)}
                        </p>
                      </div>
                      {selectedTrailerForView.msrp > selectedTrailerForView.salePrice && (
                        <div className="border-t border-gray-700 pt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">MSRP</span>
                            <span className="text-gray-500 line-through">{formatCurrency(selectedTrailerForView.msrp)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Savings</span>
                            <span className="text-green-400 font-bold">{formatCurrency(selectedTrailerForView.msrp - selectedTrailerForView.salePrice)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Specifications Card */}
              <Card className="bg-[#1a1d29] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-blue-400" />
                    Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Dimensions (L × W)</span>
                    <span className="text-2xl font-bold text-white">
                      {selectedTrailerForView.length}' × {selectedTrailerForView.width}'
                    </span>
                  </div>
                  {selectedTrailerForView.height && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Height</span>
                      <span className="text-xl font-bold text-white">{selectedTrailerForView.height}'</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Category</span>
                      <Badge variant="outline" className="text-purple-400 border-purple-400">
                        {classifyTrailer(selectedTrailerForView)}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Year</span>
                      <span className="text-white font-medium">{selectedTrailerForView.year}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              {selectedTrailerForView.features && selectedTrailerForView.features.length > 0 && (
                <Card className="bg-[#1a1d29] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-1 gap-2">
                      {selectedTrailerForView.features.map((feature, idx) => (
                        <li key={idx} className="text-white flex items-start gap-2 text-sm">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Edit Button for Owners/Directors */}
              {canUploadPDF && (
                <Link href={`/inventory/${selectedTrailerForView.id}/edit`}>
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                    Edit Trailer
                  </Button>
                </Link>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 shadow-lg z-50 hover:scale-110 transition-transform cursor-pointer"
        >
          <img
            src="/images/goup.webp"
            alt="Go to top"
            className="w-16 h-16 object-contain"
          />
        </button>
      )}

      {/* PDF Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-[#1a1d29] border-gray-700 w-full max-w-lg mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white flex items-center gap-2 text-xl">
                  <Upload className="h-6 w-6" />
                  Upload Inventory File
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadResults(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription className="text-gray-400 text-base">
                Upload a PDF, Excel (.xlsx), or CSV file containing your trailer inventory list. AI will automatically extract and import the data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => !uploadingPDF && fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors
                  ${uploadingPDF
                    ? 'border-gray-600 bg-gray-800 cursor-not-allowed'
                    : 'border-gray-600 hover:border-blue-500 bg-[#0f1117] hover:bg-[#1a1d29]'
                  }
                `}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                {uploadingPDF ? (
                  <div className="space-y-2">
                    <div className="text-white font-medium text-base">Processing PDF...</div>
                    <div className="text-sm text-gray-400">AI is extracting trailer data</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-white font-medium text-base">Click to upload PDF</div>
                    <div className="text-sm text-gray-400">or drag and drop</div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.xlsx,.xls,.csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploadingPDF}
              />

              {uploadResults && (
                <div className="space-y-3">
                  <div className="bg-[#0f1117] rounded-lg p-4 space-y-3">
                    <div className="text-white font-medium text-base">Upload Summary</div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {uploadResults.summary.total}
                        </div>
                        <div className="text-gray-400">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">
                          {uploadResults.summary.successful}
                        </div>
                        <div className="text-gray-400">Success</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">
                          {uploadResults.summary.failed}
                        </div>
                        <div className="text-gray-400">Failed</div>
                      </div>
                    </div>

                    {uploadResults.report && (
                      <div className="border-t border-gray-700 pt-3 space-y-2">
                        <div className="text-white font-medium text-sm">Change Report</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-400">
                              {uploadResults.report.newTrailers}
                            </div>
                            <div className="text-gray-400">New</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-400">
                              {uploadResults.report.updatedTrailers}
                            </div>
                            <div className="text-gray-400">Updated</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-400">
                              {uploadResults.report.removedTrailers}
                            </div>
                            <div className="text-gray-400">Removed</div>
                          </div>
                        </div>
                        {uploadResults.report.removedTrailers > 0 && (
                          <div className="bg-yellow-900/20 border border-yellow-800 rounded p-2 text-xs text-yellow-400">
                            ⚠️ {uploadResults.report.removedTrailers} trailer(s) not in this upload - potentially sold
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {uploadResults.errors.length > 0 && (
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                      <div className="text-red-400 font-medium text-sm mb-2">
                        Errors ({uploadResults.errors.length})
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {uploadResults.errors.map((err: any, idx: number) => (
                          <div key={idx} className="text-xs text-gray-400">
                            {err.trailer?.model || 'Unknown'}: {err.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href="/en/inventory/history" className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-gray-600 text-gray-300 hover:bg-[#0f1117]"
                      >
                        <History className="mr-2 h-4 w-4" />
                        View Full Report
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        setShowUploadModal(false);
                        setUploadResults(null);
                      }}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 space-y-1">
                <div>• Supported formats: PDF, Excel (.xlsx, .xls), CSV</div>
                <div>• AI will extract: Stock#, VIN, Model, dimensions, pricing, notes/options</div>
                <div>• Existing trailers will be updated with new data from upload</div>
                <div>• Upload report shows new, updated, and removed (potentially sold) trailers</div>
                <div>• Detects Diamond Cargo (DC-) and Quality Cargo (QC-) automatically</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
