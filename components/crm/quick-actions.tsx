"use client";

/**
 * Quick Actions Component
 * One-click call, SMS, and email buttons for leads
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuickActionsProps {
  customerId: string;
  customerName: string;
  phone?: string | null;
  email?: string | null;
  className?: string;
}

export function QuickActions({
  customerId,
  customerName,
  phone,
  email,
  className = "",
}: QuickActionsProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);

  // Email templates
  const emailTemplates = [
    {
      id: "intro",
      name: "Introduction",
      subject: "Welcome to MJ Cargo - Let's Find Your Perfect Trailer",
      body: `Hi ${customerName},\n\nThank you for your interest in MJ Cargo! I'm excited to help you find the perfect trailer for your needs.\n\nCould you tell me a bit more about:\n- What you'll be hauling\n- Your preferred trailer size\n- Your budget range\n\nI'm here to answer any questions you have. Feel free to call me at [YOUR PHONE] or reply to this email.\n\nLooking forward to working with you!\n\nBest regards,\n[YOUR NAME]\nMJ Cargo Sales`,
    },
    {
      id: "followup",
      name: "Follow-Up",
      subject: "Following Up on Your Trailer Inquiry",
      body: `Hi ${customerName},\n\nI wanted to follow up on your trailer inquiry. Have you had a chance to think about what you're looking for?\n\nI'd love to help answer any questions and show you our current inventory.\n\nWhen would be a good time for a quick call?\n\nBest regards,\n[YOUR NAME]\nMJ Cargo Sales`,
    },
    {
      id: "pricing",
      name: "Pricing Information",
      subject: "Pricing for [TRAILER SIZE] Trailer",
      body: `Hi ${customerName},\n\nThank you for your patience! Here's the pricing information you requested:\n\n[TRAILER DETAILS]\nPrice: $[PRICE]\n\nThis includes:\n- [FEATURE 1]\n- [FEATURE 2]\n- [FEATURE 3]\n\nWe also offer financing options if you're interested. Would you like me to send you a financing quote?\n\nLet me know if you have any questions!\n\nBest regards,\n[YOUR NAME]\nMJ Cargo Sales`,
    },
  ];

  // SMS templates
  const smsTemplates = [
    {
      id: "intro",
      name: "Quick Introduction",
      body: `Hi ${customerName}, this is [YOUR NAME] from MJ Cargo. Thanks for your interest! When's a good time to chat about trailers? Reply anytime!`,
    },
    {
      id: "followup",
      name: "Follow-Up",
      body: `Hi ${customerName}, just checking in on your trailer search. Any questions I can help with? Call me at [YOUR PHONE] anytime!`,
    },
    {
      id: "appointment",
      name: "Appointment Reminder",
      body: `Hi ${customerName}, looking forward to our call at [TIME] today! Call me at [YOUR PHONE] if you need to reschedule.`,
    },
  ];

  function handleCall() {
    if (!phone) {
      toast({
        title: "No Phone Number",
        description: "This lead doesn't have a phone number on file.",
        variant: "destructive",
      });
      return;
    }

    // Open phone dialer
    window.location.href = `tel:${phone}`;

    // Log activity
    logActivity("call", `Called ${customerName} at ${phone}`);

    toast({
      title: "Call Initiated",
      description: `Opening dialer for ${phone}`,
    });
  }

  function handleEmailClick() {
    if (!email) {
      toast({
        title: "No Email Address",
        description: "This lead doesn't have an email address on file.",
        variant: "destructive",
      });
      return;
    }

    setEmailDialogOpen(true);
  }

  function handleSMSClick() {
    if (!phone) {
      toast({
        title: "No Phone Number",
        description: "This lead doesn't have a phone number on file.",
        variant: "destructive",
      });
      return;
    }

    setSmsDialogOpen(true);
  }

  function handleNoteClick() {
    setNoteDialogOpen(true);
  }

  async function sendEmail() {
    setSending(true);
    try {
      const res = await fetch("/api/crm/quick-actions/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          to: email,
          subject,
          body: message,
        }),
      });

      if (!res.ok) throw new Error("Failed to send email");

      toast({
        title: "Email Sent",
        description: `Email sent to ${customerName}`,
      });

      setEmailDialogOpen(false);
      setSubject("");
      setMessage("");
      setSelectedTemplate("");
    } catch (error) {
      console.error("Failed to send email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  async function sendSMS() {
    setSending(true);
    try {
      const res = await fetch("/api/crm/quick-actions/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          to: phone,
          body: message,
        }),
      });

      if (!res.ok) throw new Error("Failed to send SMS");

      toast({
        title: "SMS Sent",
        description: `Text message sent to ${customerName}`,
      });

      setSmsDialogOpen(false);
      setMessage("");
      setSelectedTemplate("");
    } catch (error) {
      console.error("Failed to send SMS:", error);
      toast({
        title: "Error",
        description: "Failed to send SMS. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  async function saveNote() {
    setSending(true);
    try {
      const res = await fetch("/api/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          type: "note",
          subject: "Quick Note",
          description: message,
          status: "completed",
        }),
      });

      if (!res.ok) throw new Error("Failed to save note");

      toast({
        title: "Note Saved",
        description: "Note added to customer timeline",
      });

      setNoteDialogOpen(false);
      setMessage("");
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  async function logActivity(type: string, description: string) {
    try {
      await fetch("/api/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          type,
          subject: `${type.charAt(0).toUpperCase() + type.slice(1)} Activity`,
          description,
          status: "completed",
        }),
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  }

  function selectEmailTemplate(templateId: string) {
    const template = emailTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(template.subject);
      setMessage(template.body);
    }
  }

  function selectSMSTemplate(templateId: string) {
    const template = smsTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setMessage(template.body);
    }
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCall}
          disabled={!phone}
          title={phone ? `Call ${phone}` : "No phone number"}
        >
          <Phone className="w-4 h-4 mr-1" />
          Call
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleSMSClick}
          disabled={!phone}
          title={phone ? `Send SMS to ${phone}` : "No phone number"}
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          SMS
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleEmailClick}
          disabled={!email}
          title={email ? `Email ${email}` : "No email address"}
        >
          <Mail className="w-4 h-4 mr-1" />
          Email
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleNoteClick}
          title="Add quick note"
        >
          <Plus className="w-4 h-4 mr-1" />
          Note
        </Button>
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email to {customerName}</DialogTitle>
            <DialogDescription>
              Compose and send an email to {email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Template</label>
              <Select value={selectedTemplate} onValueChange={selectEmailTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template (optional)" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {emailTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Email subject"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[200px]"
                placeholder="Email body"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEmailDialogOpen(false)}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button onClick={sendEmail} disabled={sending || !subject || !message}>
                {sending ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SMS Dialog */}
      <Dialog open={smsDialogOpen} onOpenChange={setSmsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send SMS to {customerName}</DialogTitle>
            <DialogDescription>
              Send a text message to {phone}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Template</label>
              <Select value={selectedTemplate} onValueChange={selectSMSTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template (optional)" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {smsTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Message ({message.length}/160)
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
                placeholder="SMS message"
                maxLength={160}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSmsDialogOpen(false)}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button onClick={sendSMS} disabled={sending || !message}>
                {sending ? "Sending..." : "Send SMS"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a quick note to {customerName}'s timeline
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Note</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
                placeholder="Enter your note..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setNoteDialogOpen(false)}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button onClick={saveNote} disabled={sending || !message}>
                {sending ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
