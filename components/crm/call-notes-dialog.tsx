"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Phone } from "lucide-react";

interface CallNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  customerPhone?: string;
  onSubmit: (notes: string, callOutcome: string) => void;
}

export function CallNotesDialog({
  open,
  onOpenChange,
  customerName,
  customerPhone,
  onSubmit,
}: CallNotesDialogProps) {
  const [notes, setNotes] = useState("");
  const [callOutcome, setCallOutcome] = useState("");
  const [showError, setShowError] = useState(false);

  const handleSubmit = () => {
    if (!notes.trim() || !callOutcome) {
      setShowError(true);
      return;
    }

    onSubmit(notes, callOutcome);
    // Reset form
    setNotes("");
    setCallOutcome("");
    setShowError(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setNotes("");
    setCallOutcome("");
    setShowError(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            Call {customerName}
          </DialogTitle>
          <DialogDescription>
            {customerPhone && (
              <span className="font-semibold text-foreground">{customerPhone}</span>
            )}
            <br />
            Please log your call details before proceeding. This information is required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Call Outcome Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="call-outcome" className="flex items-center gap-2">
              Call Outcome
              <span className="text-destructive">*</span>
            </Label>
            <Select value={callOutcome} onValueChange={setCallOutcome}>
              <SelectTrigger id="call-outcome" className={showError && !callOutcome ? "border-destructive" : ""}>
                <SelectValue placeholder="Select call outcome..." />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="spoke">Spoke to customer</SelectItem>
                <SelectItem value="voicemail">Left voicemail</SelectItem>
                <SelectItem value="no-answer">Unable to leave message</SelectItem>
              </SelectContent>
            </Select>
            {showError && !callOutcome && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Please select a call outcome
              </p>
            )}
          </div>

          {/* Notes Textarea */}
          <div className="space-y-2">
            <Label htmlFor="call-notes" className="flex items-center gap-2">
              Call Notes
              <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground font-normal">
                (Required - What happened during the call?)
              </span>
            </Label>
            <Textarea
              id="call-notes"
              placeholder="Enter detailed notes about the call...

Examples:
• Discussed 8.5x20 enclosed trailer for business use
• Customer wants to see inventory next week
• Follow up on Tuesday with pricing options
• Customer mentioned budget constraints, suggested financing"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (showError && e.target.value.trim()) {
                  setShowError(false);
                }
              }}
              rows={6}
              className={showError && !notes.trim() ? "border-destructive" : ""}
            />
            {showError && !notes.trim() && (
              <div className="bg-destructive/10 border border-destructive rounded-md p-3">
                <p className="text-sm text-destructive flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  Call notes are required
                </p>
                <p className="text-xs text-destructive/80 mt-1">
                  Please provide details about what happened during the call attempt. This helps the team track customer interactions.
                </p>
              </div>
            )}
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> This information will be automatically saved to the customer's activity log with the current date and time.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            <Phone className="w-4 h-4 mr-2" />
            Save & Call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
