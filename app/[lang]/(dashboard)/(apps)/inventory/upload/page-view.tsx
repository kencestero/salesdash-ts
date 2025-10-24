"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface UploadPageViewProps {
  session: any;
}

export default function UploadPageView({ session }: UploadPageViewProps) {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = async (manufacturer: string, file: File) => {
    setUploading(manufacturer);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("manufacturer", manufacturer);

      const response = await fetch("/api/inventory/upload-excel", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "✅ Upload Successful!",
          description: `Imported ${result.summary?.total || 0} trailers from ${manufacturer} (${result.summary?.new || 0} new, ${result.summary?.updated || 0} updated)`,
        });
      } else {
        toast({
          title: "❌ Upload Failed",
          description: result.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Upload Failed",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const handleDrop = (manufacturer: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(manufacturer, file);
    }
  };

  const handleFileSelect = (manufacturer: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(manufacturer, file);
    }
  };

  const manufacturers = [
    {
      name: "Diamond Cargo",
      color: "bg-blue-600",
      textColor: "text-white",
      hoverColor: "hover:bg-blue-700",
      logo: "/images/dctranslogo.png",
    },
    {
      name: "Quality Cargo",
      color: "bg-red-600",
      textColor: "text-white",
      hoverColor: "hover:bg-red-700",
      logo: "/images/qualitycargologo.webp",
    },
    {
      name: "Panther Cargo",
      color: "bg-purple-600",
      textColor: "text-white",
      hoverColor: "hover:bg-purple-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Upload Inventory
          </h1>
          <p className="text-slate-300 text-lg">
            Import your daily inventory files from suppliers
          </p>
        </div>

        {/* Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {manufacturers.map((manufacturer) => (
            <div key={manufacturer.name}>
              <input
                type="file"
                id={`file-${manufacturer.name}`}
                accept=".xlsx,.xls"
                onChange={handleFileSelect(manufacturer.name)}
                className="hidden"
              />

              <label
                htmlFor={`file-${manufacturer.name}`}
                onDrop={handleDrop(manufacturer.name)}
                onDragOver={(e) => e.preventDefault()}
                className={`
                  ${manufacturer.color}
                  ${manufacturer.textColor}
                  ${manufacturer.hoverColor}
                  border-2 border-white/20
                  rounded-xl
                  p-8
                  cursor-pointer
                  transition-all
                  duration-300
                  transform
                  hover:scale-105
                  hover:shadow-2xl
                  flex
                  flex-col
                  items-center
                  justify-center
                  min-h-[280px]
                  ${uploading === manufacturer.name ? "opacity-50 cursor-wait" : ""}
                `}
              >
                {/* Upload Icon */}
                <Upload className="w-12 h-12 mb-4" strokeWidth={2} />

                {/* Manufacturer Name */}
                <h2 className="text-2xl font-bold mb-2 text-center">
                  {manufacturer.name}
                </h2>

                {/* Instructions */}
                <div className="text-center space-y-2">
                  {uploading === manufacturer.name ? (
                    <p className="text-lg font-semibold animate-pulse">
                      Uploading...
                    </p>
                  ) : (
                    <>
                      <p className="font-semibold">
                        Drop file here
                      </p>
                      <p className="text-sm opacity-90">
                        or click to browse
                      </p>
                      <p className="text-xs opacity-75 mt-3">
                        Excel format only (.xlsx)
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">Auto-Detection</h3>
                <p className="text-slate-300 text-sm">Automatically detects file format and supplier</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">Smart Matching</h3>
                <p className="text-slate-300 text-sm">Matches VINs to images and updates pricing</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">Instant Updates</h3>
                <p className="text-slate-300 text-sm">Live inventory updates within seconds</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-12 bg-slate-800/50 border-slate-700 p-6">
          <h3 className="text-xl font-bold text-white mb-4">📋 How It Works</h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">1.</span>
              <span>Download the latest inventory file from your supplier (Diamond Cargo, Quality Cargo, or Panther Cargo)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">2.</span>
              <span>Click the corresponding box or drag & drop the file</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">3.</span>
              <span>System automatically parses Excel and extracts VINs, pricing, and specifications</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">4.</span>
              <span>New trailers are added, existing ones are updated with latest prices</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">5.</span>
              <span>Images are automatically matched to trailers by VIN from the database</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
