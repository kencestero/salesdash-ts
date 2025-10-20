"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, DollarSign, Ruler, Package, Calendar, Tag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FireBadge } from "@/components/ui/fire-badge";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
  features?: string[];
  description?: string;
  createdAt: string;
  daysOld?: number;
}

// Calculate desired selling price with $1,500 MINIMUM PROFIT rule
function calculateDesiredPrice(cost: number): number {
  const standardPrice = cost * 1.25;
  const profit = standardPrice - cost;

  if (profit < 1500) {
    return cost + 1500;
  } else {
    return standardPrice;
  }
}

// Auto-classify trailer based on features/description
function classifyTrailer(trailer: Trailer): string {
  const description = trailer.description?.toLowerCase() || '';
  const model = trailer.model.toLowerCase();
  const features = trailer.features?.join(' ').toLowerCase() || '';
  const allText = `${description} ${model} ${features}`;

  if (allText.includes('concession')) return 'Concession';
  if (allText.includes('racing package') || allText.includes('racing')) return 'Racing Package';
  if (allText.includes('dump')) return 'Dump Trailer';

  return 'Enclosed';
}

export default function TrailerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const canEdit = userRole === 'owner' || userRole === 'director';

  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchTrailer();
    }
  }, [params.id]);

  const fetchTrailer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inventory/${params.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch trailer");
      }

      const data = await response.json();
      setTrailer(data.trailer);
    } catch (error) {
      console.error("Error fetching trailer:", error);
      toast({
        title: "Error",
        description: "Failed to load trailer details",
        variant: "destructive",
      });
      router.push("/dashboard/inventory");
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1117]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (!trailer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1117]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Trailer not found</h2>
          <Button onClick={() => router.push("/dashboard/inventory")} className="mt-4">
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  const trailerCategory = classifyTrailer(trailer);
  const profit = trailer.salePrice - trailer.cost;
  const profitMargin = ((profit / trailer.cost) * 100).toFixed(1);

  // Format currency helper
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <div className="min-h-screen bg-[#0f1117] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/inventory")}
            className="border-gray-700 text-white hover:bg-[#1a1d29]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">
                {trailer.manufacturer} {trailer.model}
              </h1>
              <Badge className={`${getStatusColor(trailer.status)} text-white`}>
                {trailer.status}
              </Badge>
              {trailer.daysOld !== undefined && trailer.daysOld <= 2 && (
                <FireBadge daysOld={trailer.daysOld} size="md" />
              )}
            </div>
            <p className="text-gray-400 mt-1">
              Stock #{trailer.stockNumber} • VIN: <span className="text-[#f5a623] font-bold">{trailer.vin}</span>
            </p>
          </div>
        </div>
        {canEdit && (
          <Link href={`/dashboard/inventory/${trailer.id}/edit`}>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <Edit className="w-4 h-4 mr-2" />
              Edit Trailer
            </Button>
          </Link>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image */}
          <Card className="bg-[#1a1d29] border-gray-700">
            <CardContent className="p-0">
              {trailer.images && trailer.images.length > 0 ? (
                <div className="space-y-4">
                  <img
                    src={trailer.images[selectedImage]}
                    alt={trailer.model}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  {/* Thumbnail Gallery */}
                  {trailer.images.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto">
                      {trailer.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${trailer.model} view ${idx + 1}`}
                          className={`w-20 h-20 object-cover rounded cursor-pointer border-2 transition-all ${
                            selectedImage === idx ? 'border-blue-500 scale-110' : 'border-gray-600 opacity-60 hover:opacity-100'
                          }`}
                          onClick={() => setSelectedImage(idx)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center bg-gray-800 rounded-t-lg">
                  <div className="text-center text-gray-400">
                    <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No images available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description & Features */}
          {(trailer.description || trailer.features) && (
            <Card className="bg-[#1a1d29] border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Details & Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trailer.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Description</h3>
                    <p className="text-white whitespace-pre-wrap">{trailer.description}</p>
                  </div>
                )}
                {trailer.features && trailer.features.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Features</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {trailer.features.map((feature, idx) => (
                        <li key={idx} className="text-white flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Specifications & Pricing */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <Card className="bg-[#1a1d29] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trailer.makeOffer ? (
                <div className="text-center py-4">
                  <div className="text-3xl font-black text-red-600 animate-pulse mb-2">
                    MAKE OFFER
                  </div>
                  <div className="text-sm text-gray-400">
                    Contact us for pricing
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Selling Price</p>
                    <p className="text-4xl font-bold text-green-400">
                      {formatCurrency(trailer.salePrice)}
                    </p>
                  </div>
                  <div className="border-t border-gray-700 pt-3 space-y-2">
                    {trailer.msrp > trailer.salePrice && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">MSRP</span>
                        <span className="text-gray-500 line-through">{formatCurrency(trailer.msrp)}</span>
                      </div>
                    )}
                    {trailer.msrp > trailer.salePrice && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Savings</span>
                        <span className="text-green-400 font-bold">{formatCurrency(trailer.msrp - trailer.salePrice)}</span>
                      </div>
                    )}
                  </div>
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
                  {trailer.length}' × {trailer.width}'
                </span>
              </div>
              {trailer.height && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Height</span>
                  <span className="text-xl font-bold text-white">{trailer.height}'</span>
                </div>
              )}
              <div className="border-t border-gray-700 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Manufacturer</span>
                  <span className={`font-semibold ${
                    trailer.manufacturer.toLowerCase().includes('diamond')
                      ? 'text-blue-400'
                      : trailer.manufacturer.toLowerCase().includes('quality')
                      ? 'text-red-400'
                      : 'text-white'
                  }`}>
                    {trailer.manufacturer}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Model</span>
                  <span className="text-white font-medium">{trailer.model}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Year</span>
                  <span className="text-white font-medium">{trailer.year}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Category</span>
                  <Badge variant="outline" className="text-purple-400 border-purple-400">
                    {trailerCategory}
                  </Badge>
                </div>
                {trailer.location && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Location</span>
                    <span className="text-white font-medium">{trailer.location}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className="bg-[#1a1d29] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Added to Inventory</span>
                <span className="text-white font-medium">
                  {new Date(trailer.createdAt).toLocaleDateString()}
                </span>
              </div>
              {trailer.daysOld !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Days in Stock</span>
                  <span className={`font-bold ${
                    trailer.daysOld <= 2 ? 'text-green-400' :
                    trailer.daysOld <= 7 ? 'text-yellow-400' :
                    'text-orange-400'
                  }`}>
                    {trailer.daysOld} day{trailer.daysOld !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
