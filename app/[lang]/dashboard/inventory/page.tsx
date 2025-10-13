"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, Upload, X } from "lucide-react";
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
  daysOld?: number;
  features?: string[];
}

export default function InventoryPage() {
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTrailers, setSelectedTrailers] = useState<string[]>([]);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sortBy, setSortBy] = useState<"age" | "price" | "size" | "stock">("age");

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
      return (
        trailer.manufacturer.toLowerCase().includes(search) ||
        trailer.model.toLowerCase().includes(search) ||
        trailer.stockNumber.toLowerCase().includes(search) ||
        trailer.vin.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "age":
          // Newest first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "price":
          // Lowest price first
          return a.salePrice - b.salePrice;
        case "size":
          // Smallest to largest (by length)
          return a.length - b.length;
        case "stock":
          // Alphabetical by stock number
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

      // Get selected trailer data
      const selected = trailers.filter(t => selectedTrailers.includes(t.id));

      // Call PDF generation API
      const response = await fetch("/api/quotes/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trailers: selected }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // Download the PDF
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

      // Clear selection after successful generation
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

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadResults(data);

      toast({
        title: "Upload Successful",
        description: `${data.summary.successful} trailer(s) imported successfully`,
      });

      // Refresh inventory
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
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid File",
          description: "Please select a PDF file.",
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
    available: trailers.filter((t) => t.status === "available").length,
    sold: trailers.filter((t) => t.status === "sold").length,
    reserved: trailers.filter((t) => t.status === "reserved").length,
    totalValue: trailers
      .filter((t) => t.status === "available")
      .reduce((sum, t) => sum + t.salePrice, 0),
  };

  const allSelected = filteredTrailers.length > 0 && selectedTrailers.length === filteredTrailers.length;
  const someSelected = selectedTrailers.length > 0 && selectedTrailers.length < filteredTrailers.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Inventory</h1>
          <p className="text-gray-400">Manage your trailer inventory</p>
        </div>
        <div className="flex gap-3">
          {selectedTrailers.length > 0 && (
            <Button
              onClick={handleGeneratePDF}
              disabled={generatingPDF}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <FileText className="mr-2 h-4 w-4" />
              {generatingPDF ? "Generating..." : `Generate PDF (${selectedTrailers.length})`}
            </Button>
          )}
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload PDF
          </Button>
          <Button className="bg-[#f5a623] hover:bg-[#e09612] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Trailer
          </Button>
        </div>
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
                <SelectItem value="Concession">Concession</SelectItem>
                <SelectItem value="Motorcycle">Motorcycle</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-full md:w-48 bg-[#0f1117] border-gray-700 text-white">
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
            <CardTitle className="text-white">
              {filteredTrailers.length} Trailers
            </CardTitle>
            {selectedTrailers.length > 0 && (
              <p className="text-sm text-gray-400">
                {selectedTrailers.length} selected
              </p>
            )}
          </div>
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
                    <TableHead className="text-gray-400 w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="text-gray-400">Stock #</TableHead>
                    <TableHead className="text-gray-400">Image</TableHead>
                    <TableHead className="text-gray-400">VIN</TableHead>
                    <TableHead className="text-gray-400">Size</TableHead>
                    <TableHead className="text-gray-400">Details</TableHead>
                    <TableHead className="text-gray-400">Pricing</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrailers.map((trailer) => (
                    <TableRow key={trailer.id} className="border-gray-700">
                      <TableCell>
                        <Checkbox
                          checked={selectedTrailers.includes(trailer.id)}
                          onCheckedChange={(checked) =>
                            handleSelectTrailer(trailer.id, checked as boolean)
                          }
                          aria-label={`Select ${trailer.stockNumber}`}
                        />
                      </TableCell>
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
                      <TableCell className="text-gray-300 text-xs font-mono">
                        {trailer.vin}
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        {trailer.length}' × {trailer.width}'
                        {trailer.height && <div className="text-xs text-gray-400">H: {trailer.height}'</div>}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="font-semibold">
                          {trailer.year} {trailer.manufacturer}
                        </div>
                        <div className="text-sm text-gray-400">{trailer.model}</div>
                        <div className="text-xs text-gray-500">{trailer.category}</div>
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

      {/* PDF Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-[#1a1d29] border-gray-700 w-full max-w-lg mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Inventory PDF
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
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="text-gray-400">
                Upload a PDF containing your trailer inventory list. AI will automatically extract and import the data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
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
                    <div className="text-white font-medium">Processing PDF...</div>
                    <div className="text-sm text-gray-400">AI is extracting trailer data</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-white font-medium">Click to upload PDF</div>
                    <div className="text-sm text-gray-400">or drag and drop</div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploadingPDF}
              />

              {/* Results Display */}
              {uploadResults && (
                <div className="space-y-3">
                  <div className="bg-[#0f1117] rounded-lg p-4 space-y-2">
                    <div className="text-white font-medium">Upload Summary</div>
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

                  <Button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadResults(null);
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Done
                  </Button>
                </div>
              )}

              {/* Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Supported format: PDF</div>
                <div>• AI will extract: Model, dimensions, pricing, features</div>
                <div>• Duplicate VINs/stock numbers will be skipped</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
