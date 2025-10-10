"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";

export interface SignaturePadRef {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

interface SignaturePadProps {
  onSigned?: () => void;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onSigned }, ref) => {
    const sigCanvas = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigCanvas.current?.clear();
      },
      isEmpty: () => {
        return sigCanvas.current?.isEmpty() ?? true;
      },
      toDataURL: () => {
        return sigCanvas.current?.toDataURL() ?? "";
      },
    }));

    const handleClear = () => {
      sigCanvas.current?.clear();
    };

    return (
      <div className="space-y-3">
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: "w-full h-48 cursor-crosshair",
            }}
            backgroundColor="rgb(255, 255, 255)"
            penColor="rgb(0, 0, 0)"
            onEnd={onSigned}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none">
            Sign above
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear Signature
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Draw your signature using your mouse, trackpad, or touch screen
        </p>
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";
