"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, User, Building, Paperclip, Download } from "lucide-react";
import { format } from "date-fns";

interface EmailData {
  id: string;
  subject: string;
  body: string;
  htmlBody?: string | null;
  from: string;
  to: string[];
  sentAt: Date | string;
  attachments?: any;
  opened?: boolean;
  clicked?: boolean;
  customer?: {
    firstName: string;
    lastName: string;
    email: string | null;
    companyName?: string;
  };
}

interface EmailViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailData: EmailData | null;
}

export function EmailViewerDialog({
  open,
  onOpenChange,
  emailData,
}: EmailViewerDialogProps) {
  if (!emailData) return null;

  const sentDate =
    typeof emailData.sentAt === "string"
      ? new Date(emailData.sentAt)
      : emailData.sentAt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mail className="w-5 h-5 text-blue-600" />
            Email Details
          </DialogTitle>
          <DialogDescription>
            View the complete email content and details
          </DialogDescription>
        </DialogHeader>

        {/* Email Header Info */}
        <div className="space-y-4 border-b pb-4">
          {/* Subject */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {emailData.subject}
            </h3>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* From */}
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">From</p>
                <p className="text-gray-600">{emailData.from}</p>
              </div>
            </div>

            {/* To */}
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">To</p>
                <p className="text-gray-600">
                  {Array.isArray(emailData.to)
                    ? emailData.to.join(", ")
                    : emailData.to}
                </p>
              </div>
            </div>

            {/* Sent Date */}
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Sent</p>
                <p className="text-gray-600">
                  {format(sentDate, "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>

            {/* Customer */}
            {emailData.customer && (
              <div className="flex items-start gap-2">
                <Building className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Customer</p>
                  <p className="text-gray-600">
                    {emailData.customer.firstName} {emailData.customer.lastName}
                  </p>
                  {emailData.customer.companyName && (
                    <p className="text-xs text-gray-500">
                      {emailData.customer.companyName}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Sent
            </Badge>
            {emailData.opened && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Opened
              </Badge>
            )}
            {emailData.clicked && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Clicked
              </Badge>
            )}
          </div>
        </div>

        {/* Email Body */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Message</h4>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            {emailData.htmlBody ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: emailData.htmlBody }}
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{emailData.body}</p>
            )}
          </div>
        </div>

        {/* Attachments */}
        {emailData.attachments && Array.isArray(emailData.attachments) && emailData.attachments.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments ({emailData.attachments.length})
            </h4>
            <div className="space-y-2">
              {emailData.attachments.map((attachment: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {attachment.filename || `Attachment ${index + 1}`}
                      </p>
                      {attachment.size && (
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024).toFixed(2)} KB
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
