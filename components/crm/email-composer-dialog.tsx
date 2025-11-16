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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Send,
  Paperclip,
  Image as ImageIcon,
  Link as LinkIcon,
  Bold,
  Italic,
  List,
  AlertCircle,
  FileText,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { EmailSendingLoadingDialog } from "@/components/crm/email-sending-loading-dialog";

interface EmailComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    companyName?: string;
    phone?: string | null;
  };
}

// Email Templates
const EMAIL_TEMPLATES = {
  follow_up: {
    name: "Follow Up",
    subject: "Following Up - {{firstName}} {{lastName}}",
    body: `Hi {{firstName}},

I wanted to follow up regarding your interest in our trailers. Do you have any questions I can help answer?

Looking forward to hearing from you!

Best regards,
MJ Cargo Sales Team`,
  },
  quote: {
    name: "Quote Request",
    subject: "Your Trailer Quote",
    body: `Hello {{firstName}},

Thank you for your interest! I'm putting together a quote for you based on your requirements.

I'll have this ready for you shortly. In the meantime, please let me know if you have any specific questions.

Best regards,
MJ Cargo Sales Team`,
  },
  welcome: {
    name: "Welcome Email",
    subject: "Welcome to MJ Cargo - {{firstName}}!",
    body: `Hello {{firstName}},

Welcome! We're excited to help you find the perfect trailer.

Our team is here to answer any questions and guide you through the process.

Feel free to reach out anytime at {{phone}} or reply to this email.

Best regards,
MJ Cargo Sales Team`,
  },
  financing: {
    name: "Financing Information",
    subject: "Financing Options Available",
    body: `Hi {{firstName}},

I wanted to share our financing options with you. We offer:

• Traditional Financing
• Rent-to-Own Programs
• Cash Discounts

Would you like to discuss which option works best for your situation?

Best regards,
MJ Cargo Sales Team`,
  },
  custom: {
    name: "Custom Email",
    subject: "",
    body: "",
  },
};

export function EmailComposerDialog({
  open,
  onOpenChange,
  customer,
}: EmailComposerDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof EMAIL_TEMPLATES>("custom");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);

  // Apply template
  const applyTemplate = (templateKey: keyof typeof EMAIL_TEMPLATES) => {
    const template = EMAIL_TEMPLATES[templateKey];
    setSelectedTemplate(templateKey);

    // Replace placeholders
    const replacePlaceholders = (text: string) => {
      return text
        .replace(/\{\{firstName\}\}/g, customer.firstName || "")
        .replace(/\{\{lastName\}\}/g, customer.lastName || "")
        .replace(/\{\{companyName\}\}/g, customer.companyName || "")
        .replace(/\{\{phone\}\}/g, customer.phone || "");
    };

    setSubject(replacePlaceholders(template.subject));
    setBody(replacePlaceholders(template.body));
  };

  // Insert placeholder at cursor
  const insertPlaceholder = (placeholder: string) => {
    setBody((prev) => prev + placeholder);
  };

  // Handle file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Format text (simple implementation)
  const formatText = (format: "bold" | "italic" | "list") => {
    const textarea = document.getElementById("email-body") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);

    let formattedText = "";
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "list":
        formattedText = `• ${selectedText}`;
        break;
    }

    const newBody = body.substring(0, start) + formattedText + body.substring(end);
    setBody(newBody);
  };

  // Send email
  const handleSend = async () => {
    if (!customer.email) {
      toast({
        title: "Error",
        description: "Customer has no email address",
        variant: "destructive",
      });
      return;
    }

    if (!subject.trim() || !body.trim()) {
      toast({
        title: "Error",
        description: "Please fill in subject and message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    // Step 1: Close the composer dialog immediately
    onOpenChange(false);

    // Step 2: Show loading animation
    setShowLoadingAnimation(true);

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append("customerId", customer.id);
      formData.append("to", customer.email);
      formData.append("subject", subject);
      formData.append("body", body);

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch("/api/crm/emails/send", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      // Email sent successfully - animation will auto-close via onComplete
      toast({
        title: "Email Sent!",
        description: `Email sent to ${customer.email}`,
      });

      // Reset form
      setSubject("");
      setBody("");
      setAttachments([]);
      setSelectedTemplate("custom");
    } catch (error) {
      console.error("Error sending email:", error);

      // On error, close animation immediately
      setShowLoadingAnimation(false);

      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Send Email to {customer.firstName} {customer.lastName}
          </DialogTitle>
          <DialogDescription>
            {customer.email ? (
              <span className="font-semibold text-foreground">{customer.email}</span>
            ) : (
              <span className="text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                No email address on file
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="templates">
              <Sparkles className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Compose Tab */}
          <TabsContent value="compose" className="space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText("bold")}
                title="Bold (select text first)"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText("italic")}
                title="Italic (select text first)"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText("list")}
                title="Bullet point (select text first)"
              >
                <List className="w-4 h-4" />
              </Button>

              <div className="h-4 w-px bg-border mx-2" />

              {/* Placeholders */}
              <Select onValueChange={(value) => insertPlaceholder(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Insert placeholder" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="{{firstName}}">First Name</SelectItem>
                  <SelectItem value="{{lastName}}">Last Name</SelectItem>
                  <SelectItem value="{{companyName}}">Company</SelectItem>
                  <SelectItem value="{{phone}}">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                placeholder="Type your message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Select text and use formatting buttons above, or insert placeholders
              </p>
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Add File
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {attachments.length > 0 && (
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                <Button
                  key={key}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => applyTemplate(key as keyof typeof EMAIL_TEMPLATES)}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">{template.name}</span>
                  </div>
                  {template.subject && (
                    <p className="text-xs text-muted-foreground text-left">
                      {template.subject.substring(0, 50)}...
                    </p>
                  )}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Select a template to use as a starting point. Placeholders like {"{"}
              {"{"}firstName{"}"} will be automatically filled.
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={sending || !customer.email}
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Email Sending Loading Animation */}
    <EmailSendingLoadingDialog
      open={showLoadingAnimation}
      onComplete={() => {
        setShowLoadingAnimation(false);
        // Trigger customer refresh if there's an onUpdate callback
        // This will make the new email appear in the activity timeline
      }}
    />
  </>
  );
}
