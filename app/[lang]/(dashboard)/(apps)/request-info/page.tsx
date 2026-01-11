"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { toast } from "sonner";
import { Loader2, Send, Paperclip, X, Image as ImageIcon, Mail } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    repCode?: string;
    managerId?: string;
  };
}

const PURPOSE_OPTIONS = [
  { value: "quote", label: "Quote" },
  { value: "availability", label: "Availability" },
  { value: "pictures", label: "Pictures" },
  { value: "more-info", label: "More Info" },
  { value: "other", label: "Other" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_MESSAGE_LENGTH = 2000;

export default function RequestInfoPage() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        // API returns { user: {...}, profile: {...} }
        setUserProfile({
          id: data.user?.id || "",
          email: data.user?.email || session?.user?.email || "",
          name: data.user?.name,
          profile: data.profile,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch user profile:", err);
        setLoading(false);
      });
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file count
    if (attachments.length + files.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} attachments allowed.`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not allowed. Only PNG, JPEG, WEBP, and GIF images.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 5MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    setAttachments((prev) => [...prev, ...validFiles]);
    // Reset input
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!purpose) {
      toast.error("Please select a purpose for your request.");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter your request details.");
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message must be ${MAX_MESSAGE_LENGTH} characters or less.`);
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("purpose", purpose);
      formData.append("message", message);
      formData.append("repCode", userProfile?.profile?.repCode || "");
      formData.append("repFirstName", userProfile?.profile?.firstName || "");
      formData.append("repLastName", userProfile?.profile?.lastName || "");
      formData.append("repEmail", userProfile?.email || "");
      formData.append("repUserId", userProfile?.id || "");
      formData.append("managerId", userProfile?.profile?.managerId || "");

      // Add attachments
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch("/api/request-info", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Request Sent!", {
          description: "Your request has been sent to Diamond Cargo. You'll receive a notification when they reply.",
        });

        // Reset form
        setPurpose("");
        setMessage("");
        setAttachments([]);
      } else {
        throw new Error(result.error || "Failed to send request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const repName = userProfile?.profile
    ? `${userProfile.profile.firstName || ""} ${userProfile.profile.lastName || ""}`.trim()
    : userProfile?.name || "Unknown";
  const repCode = userProfile?.profile?.repCode || "N/A";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Request Info from Diamond Cargo</h1>
        <p className="text-muted-foreground mt-2">
          Send requests for quotes, pictures, availability, or more info directly to our Diamond Cargo contact.
        </p>
      </div>

      {/* Rep Info Banner */}
      <Card className="bg-gradient-to-r from-[#E96114]/20 to-[#09213C]/20 border-[#E96114]/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#E96114]/20 rounded-full">
              <Mail className="h-5 w-5 text-[#E96114]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sending as:</p>
              <p className="font-semibold">{repName} ({repCode})</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>New Request</CardTitle>
          <CardDescription>
            Fill out the form below. Lee at Diamond Cargo will receive your request via email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Purpose Select */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger id="purpose">
                  <SelectValue placeholder="Select purpose..." />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message Textarea */}
            <div className="space-y-2">
              <Label htmlFor="message">
                Request Details *
                <span className="text-muted-foreground font-normal ml-2">
                  ({message.length}/{MAX_MESSAGE_LENGTH})
                </span>
              </Label>
              <Textarea
                id="message"
                placeholder={
                  purpose === "other"
                    ? "Describe your request in detail..."
                    : "Include trailer type, size, color, options, stock number, or any other relevant details..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                rows={6}
                className="resize-none"
              />
              {message.length >= MAX_MESSAGE_LENGTH && (
                <p className="text-sm text-destructive">Character limit reached</p>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label>
                Attachments
                <span className="text-muted-foreground font-normal ml-2">
                  (Optional - PNG, JPEG, WEBP, GIF only. Max 5MB each, up to 5 files)
                </span>
              </Label>

              {/* File Input */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file-input")?.click()}
                  disabled={attachments.length >= MAX_FILES}
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-sm text-muted-foreground">
                  {attachments.length}/{MAX_FILES} files
                </span>
              </div>

              {/* Attachment Previews */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="relative group flex items-center gap-2 bg-muted rounded-lg p-2 pr-8"
                    >
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(1)}MB)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-destructive/20 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting || !purpose || !message.trim()}
                className="bg-[#E96114] hover:bg-[#E96114]/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-full">
              <Mail className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-sm">
              <p className="font-medium">How it works</p>
              <p className="text-muted-foreground mt-1">
                Your request will be emailed to Lee Portivent at Diamond Cargo. When they reply,
                you'll get a notification in your Messages inbox and on the Remotive App.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
