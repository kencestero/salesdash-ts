"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Save, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/ui/role-badge";
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
  height: number | null;
  msrp: number;
  salePrice: number;
  cost: number;
  makeOffer: boolean;
  status: string;
  location: string | null;
  description: string | null;
}

// Calculate desired selling price with $1,500 MINIMUM PROFIT rule
function calculateDesiredPrice(cost: number): number {
  const standardPrice = cost * 1.25;
  const profit = standardPrice - cost;

  if (profit < 1500) {
    return cost + 1500; // Minimum $1,500 profit
  } else {
    return standardPrice; // Profit is good, use 1.25× multiplier
  }
}

export default function EditTrailerPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;

  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [salePrice, setSalePrice] = useState(0);
  const [makeOffer, setMakeOffer] = useState(false);
  const [status_field, setStatus] = useState("available");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [useAutoPrice, setUseAutoPrice] = useState(true);

  // Access control
  const canEdit = userRole === 'owner' || userRole === 'director';

  useEffect(() => {
    if (status === "authenticated" && !canEdit) {
      toast({
        title: "Access Denied",
        description: "Only Directors and Owners can edit inventory",
        variant: "destructive",
      });
      router.push("/dashboard/inventory");
    }
  }, [status, canEdit, router]);

  useEffect(() => {
    fetchTrailer();
  }, [params.id]);

  const fetchTrailer = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/inventory/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch trailer");

      const data = await res.json();
      setTrailer(data);

      // Pre-fill form
      const autoPrice = calculateDesiredPrice(data.cost);
      const isAutoPrice = Math.abs(data.salePrice - autoPrice) < 1; // Check if using auto-calculated price

      setSalePrice(data.salePrice);
      setMakeOffer(data.makeOffer);
      setStatus(data.status);
      setLocation(data.location || "");
      setDescription(data.description || "");
      setUseAutoPrice(isAutoPrice);
    } catch (error) {
      console.error("Failed to fetch trailer:", error);
      toast({
        title: "Error",
        description: "Failed to load trailer details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!trailer) return;

    try {
      setSaving(true);

      const updateData = {
        salePrice: useAutoPrice ? calculateDesiredPrice(trailer.cost) : salePrice,
        makeOffer,
        status: status_field,
        location: location.trim() || null,
        description: description.trim() || null,
      };

      const res = await fetch(`/api/inventory/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error("Failed to update trailer");

      toast({
        title: "Trailer Updated",
        description: `${trailer.stockNumber} has been updated successfully`,
      });

      router.push("/dashboard/inventory");
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: "Failed to update trailer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!canEdit) {
    return null; // Redirect happens in useEffect
  }

  if (!trailer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">Trailer not found</div>
      </div>
    );
  }

  const autoCalculatedPrice = calculateDesiredPrice(trailer.cost);
  const currentProfit = (useAutoPrice ? autoCalculatedPrice : salePrice) - trailer.cost;
  const profitPercent = ((currentProfit / trailer.cost) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inventory">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Trailer</h1>
            <p className="text-gray-400 mt-1">
              {trailer.manufacturer} {trailer.model} - {trailer.stockNumber}
            </p>
          </div>
        </div>
        {/* Beautiful Role Badge */}
        <RoleBadge role={userRole || "salesperson"} size="md" showTooltip={true} />
      </div>

      {/* Trailer Info Card */}
      <Card className="bg-[#1a1d29] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Trailer Information</CardTitle>
          <CardDescription className="text-gray-400">
            Read-only information from inventory database
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400">VIN</div>
            <div className="text-white font-mono font-bold">{trailer.vin}</div>
          </div>
          <div>
            <div className="text-gray-400">Stock #</div>
            <div className="text-white font-semibold">{trailer.stockNumber}</div>
          </div>
          <div>
            <div className="text-gray-400">Size</div>
            <div className="text-white">{trailer.length}' × {trailer.width}'</div>
          </div>
          <div>
            <div className="text-gray-400">Wholesale Cost</div>
            <div className="text-white font-bold">${trailer.cost.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-400">Category</div>
            <div className="text-white">{trailer.category}</div>
          </div>
          <div>
            <div className="text-gray-400">Year</div>
            <div className="text-white">{trailer.year}</div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Card */}
      <Card className="bg-[#1a1d29] border-[#E96114] border-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#E96114]" />
            Pricing Settings
          </CardTitle>
          <CardDescription className="text-gray-400">
            Set custom price or use auto-calculated price with $1,500 minimum profit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-Calculate Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#0f1117] rounded-lg">
            <div>
              <div className="text-white font-semibold">Auto-Calculate Price</div>
              <div className="text-sm text-gray-400">
                Uses cost × 1.25 with $1,500 minimum profit rule
              </div>
            </div>
            <Button
              variant={useAutoPrice ? "default" : "outline"}
              onClick={() => {
                setUseAutoPrice(!useAutoPrice);
                if (!useAutoPrice) {
                  setSalePrice(autoCalculatedPrice);
                }
              }}
              className={useAutoPrice ? "bg-[#E96114] hover:bg-[#E96114]/90" : ""}
            >
              {useAutoPrice ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {/* Auto-Calculated Price Display */}
          {useAutoPrice && (
            <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Auto-Calculated Price</div>
                  <div className="text-3xl font-bold text-green-400">
                    ${autoCalculatedPrice.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Formula: {trailer.cost * 1.25 - trailer.cost < 1500
                      ? `$${trailer.cost.toLocaleString()} + $1,500 (min profit)`
                      : `$${trailer.cost.toLocaleString()} × 1.25`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Profit</div>
                  <div className="text-2xl font-bold text-green-400">
                    ${currentProfit.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {profitPercent}% markup
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manual Price Input */}
          {!useAutoPrice && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salePrice" className="text-white font-semibold">
                  Custom Sale Price
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white font-bold text-lg">
                    $
                  </span>
                  <Input
                    id="salePrice"
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                    className="pl-8 h-12 text-lg bg-[#0f1117] border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Profit Indicator */}
              <div className={`p-4 rounded-lg border ${
                currentProfit >= 1500
                  ? "bg-green-900/20 border-green-700"
                  : currentProfit > 0
                  ? "bg-yellow-900/20 border-yellow-700"
                  : "bg-red-900/20 border-red-700"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-400">Profit Margin</div>
                    <div className={`text-2xl font-bold ${
                      currentProfit >= 1500 ? "text-green-400" : currentProfit > 0 ? "text-yellow-400" : "text-red-400"
                    }`}>
                      ${currentProfit.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Markup %</div>
                    <div className={`text-2xl font-bold ${
                      currentProfit >= 1500 ? "text-green-400" : currentProfit > 0 ? "text-yellow-400" : "text-red-400"
                    }`}>
                      {profitPercent}%
                    </div>
                  </div>
                </div>
                {currentProfit < 1500 && currentProfit > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Warning: Profit is below $1,500 minimum threshold</span>
                  </div>
                )}
                {currentProfit <= 0 && (
                  <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Error: Price is at or below cost! This will result in a loss.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Make Offer Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#0f1117] rounded-lg">
            <div>
              <div className="text-white font-semibold">Make Offer Flag</div>
              <div className="text-sm text-gray-400">
                Display "MAKE OFFER" instead of price on listings
              </div>
            </div>
            <Button
              variant={makeOffer ? "default" : "outline"}
              onClick={() => setMakeOffer(!makeOffer)}
              className={makeOffer ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {makeOffer ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status & Details Card */}
      <Card className="bg-[#1a1d29] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Status & Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-white font-semibold">
              Status
            </Label>
            <Select value={status_field} onValueChange={setStatus}>
              <SelectTrigger className="bg-[#0f1117] border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-white font-semibold">
              Location (Optional)
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="Main Lot, Back Lot, etc."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-[#0f1117] border-gray-700 text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white font-semibold">
              Description / Notes (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Additional notes, features, or options..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-[#0f1117] border-gray-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link href="/dashboard/inventory" className="flex-1">
          <Button
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-[#1a1d29]"
          >
            Cancel
          </Button>
        </Link>
        <Button
          onClick={handleSave}
          disabled={saving || (currentProfit <= 0 && !makeOffer)}
          className="flex-1 bg-[#E96114] hover:bg-[#E96114]/90 text-white"
        >
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
