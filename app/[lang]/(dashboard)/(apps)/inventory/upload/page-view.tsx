"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
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

      const response = await fetch("/api/inventory/bulk-import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Upload Successful!",
          description: `Imported ${result.imported || 0} trailers from ${manufacturer}`,
        });
      } else {
        toast({
          title: "Upload Failed",
          description: result.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
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
      color: "bg-[#F62A00]", // Candy Apple Red
      textColor: "text-white",
      hoverColor: "hover:bg-[#D02400]",
    },
    {
      name: "Quality Cargo",
      color: "bg-[#F1F3CE]", // Ivory
      textColor: "text-gray-900",
      hoverColor: "hover:bg-[#E8EBBE]",
    },
    {
      name: "Cargo Craft",
      color: "bg-[#2D7A3E]", // Forest Green
      textColor: "text-white",
      hoverColor: "hover:bg-[#256831]",
    },
    {
      name: "Panther Trailers",
      color: "bg-[#1E656D]", // Peacock Blue
      textColor: "text-white",
      hoverColor: "hover:bg-[#16545B]",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Upload Cargo
          </h1>
          <p className="text-slate-300 text-lg">
            Drop or upload your inventory files
          </p>
        </div>

        {/* Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {manufacturers.map((manufacturer) => (
            <div key={manufacturer.name}>
              <input
                type="file"
                id={`file-${manufacturer.name}`}
                accept=".xlsx,.xls,.csv,.pdf"
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
                  border-4 border-white/20
                  rounded-2xl
                  p-12
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
                  min-h-[300px]
                  ${uploading === manufacturer.name ? "opacity-50 cursor-wait" : ""}
                `}
              >
                {/* Upload Icon */}
                <Upload className="w-16 h-16 mb-6" strokeWidth={2.5} />

                {/* Manufacturer Name */}
                <h2 className="text-3xl font-bold mb-4 text-center">
                  {manufacturer.name}
                </h2>

                {/* Instructions */}
                <div className="text-center space-y-2">
                  {uploading === manufacturer.name ? (
                    <p className="text-xl font-semibold animate-pulse">
                      Uploading...
                    </p>
                  ) : (
                    <>
                      <p className="text-xl font-semibold">
                        Drop file here
                      </p>
                      <p className="text-sm opacity-90">
                        or click to browse
                      </p>
                      <p className="text-xs opacity-75 mt-4">
                        Accepts: Excel, CSV, PDF
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>

        {/* Quick Instructions */}
        <Card className="mt-12 bg-slate-800/50 border-slate-700 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Instructions</h3>
          <ul className="space-y-2 text-slate-300">
            <li>✅ Click any box to select a file from your computer</li>
            <li>✅ Or drag and drop your file directly onto the box</li>
            <li>✅ Accepted formats: Excel (.xlsx, .xls), CSV (.csv), PDF (.pdf)</li>
            <li>✅ Files will be automatically processed and added to your inventory</li>
            <li>✅ Duplicate VINs will be updated with new pricing</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
