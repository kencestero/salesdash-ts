"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ImageCropDialogProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  aspect: number; // 1 for avatar (1:1), 16/9 for banner
  circularCrop?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  onCropComplete: (blob: Blob) => void;
  title?: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropDialog({
  open,
  onClose,
  imageSrc,
  aspect,
  circularCrop = false,
  maxWidth = 1920,
  maxHeight = 1920,
  onCropComplete,
  title = "Crop Image",
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    },
    [aspect]
  );

  const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Calculate the actual crop dimensions
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // Calculate output dimensions (scale down if needed)
    let outputWidth = cropWidth;
    let outputHeight = cropHeight;

    if (outputWidth > maxWidth) {
      const ratio = maxWidth / outputWidth;
      outputWidth = maxWidth;
      outputHeight = outputHeight * ratio;
    }

    if (outputHeight > maxHeight) {
      const ratio = maxHeight / outputHeight;
      outputHeight = maxHeight;
      outputWidth = outputWidth * ratio;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Apply circular crop mask if needed
    if (circularCrop) {
      ctx.beginPath();
      ctx.arc(
        outputWidth / 2,
        outputHeight / 2,
        Math.min(outputWidth, outputHeight) / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
    }

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputWidth,
      outputHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  }, [completedCrop, maxWidth, maxHeight, circularCrop]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const blob = await getCroppedImg();
      if (blob) {
        onCropComplete(blob);
      }
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-4">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              circularCrop={circularCrop}
              className="max-h-[400px]"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxHeight: "400px", maxWidth: "100%" }}
              />
            </ReactCrop>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !completedCrop}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
