"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Eye, FileText, Upload, X, ArrowUp, Info, History } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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

// Calculate sale price with $1,400 markup formula
function calculateSalePrice(cost: number): number {
  const markup = cost * 1.25;
  const minMarkup = cost + 1400;
  return Math.max(markup, minMarkup);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Live Inventory</h1>
          <p className="text-lg text-gray-400 mt-1">Manage your trailer inventory</p>
        </div>
        <div className="flex gap-3">
          {mounted && canUploadPDF && (
            <Link href="/dashboard/inventory/history">
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
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-base px-6"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload File
            </Button>
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
                    <TableHead className="text-gray-400 w-12 text-base">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="text-gray-400 text-base font-bold">VIN</TableHead>
                    <TableHead className="text-gray-400 text-base font-bold">Stock #</TableHead>
                    <TableHead className="text-gray-400 text-base font-bold">Image</TableHead>
                    <TableHead className="text-gray-400 text-base font-bold">Size</TableHead>
                    <TableHead className="text-gray-400 text-base font-bold">Details</TableHead>
                    <TableHead className="text-gray-400 text-base font-bold">Price</TableHead>
                    <TableHead className="text-gray-400 text-base font-bold">Status</TableHead>
                    <TableHead className="text-gray-400 text-base font-bold">Notes</TableHead>
                    <TableHead className="text-gray-400 text-base font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrailers.map((trailer) => {
                    const calculatedPrice = calculateSalePrice(trailer.cost);
                    const trailerCategory = classifyTrailer(trailer);

                    return (
                      <TableRow key={trailer.id} className="border-gray-700 hover:bg-[#0f1117]">
                        <TableCell>
                          <Checkbox
                            checked={selectedTrailers.includes(trailer.id)}
                            onCheckedChange={(checked) =>
                              handleSelectTrailer(trailer.id, checked as boolean)
                            }
                            aria-label={`Select ${trailer.stockNumber}`}
                          />
                        </TableCell>

                        {/* VIN - BRIGHT ORANGE AND BOLD */}
                        <TableCell className="font-black text-[#f5a623] text-lg">
                          {trailer.vin}
                        </TableCell>

                        {/* Stock Number */}
                        <TableCell className="font-medium text-white text-base">
                          <div className="flex items-center gap-2">
                            {trailer.stockNumber}
                            {trailer.daysOld !== undefined && trailer.daysOld <= 2 && (
                              <FireBadge daysOld={trailer.daysOld} size="sm" />
                            )}
                          </div>
                        </TableCell>

                        {/* Image */}
                        <TableCell>
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

                        {/* Size - 2.5x LARGER */}
                        <TableCell className="text-white font-bold text-3xl">
                          {trailer.length}' × {trailer.width}'
                          {trailer.height && <div className="text-sm text-gray-400 font-normal">H: {trailer.height}'</div>}
                        </TableCell>

                        {/* Details - REMOVED YEAR, COLOR CODED MANUFACTURER */}
                        <TableCell className="text-white">
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

                        {/* Price - SHOW MAKE OFFER OR CALCULATED PRICE */}
                        <TableCell className="text-white">
                          {trailer.makeOffer ? (
                            <div>
                              <div className="text-xl font-black text-red-600 animate-pulse">
                                MAKE OFFER
                              </div>
                              <div className="text-xs text-gray-500">
                                Cost: ${trailer.cost.toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-xl font-bold text-green-400">
                                ${calculatedPrice.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                Cost: ${trailer.cost.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge className={`${getStatusColor(trailer.status)} text-white text-sm px-3 py-1`}>
                            {trailer.status}
                          </Badge>
                        </TableCell>

                        {/* Notes/Options with Tooltip */}
                        <TableCell>
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

                        {/* Actions */}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300"
                            onClick={() => window.open(`/dashboard/inventory/${trailer.id}`, '_blank')}
                          >
                            <Eye className="h-5 w-5" />
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
                    <Link href="/dashboard/inventory/history" className="flex-1">
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
