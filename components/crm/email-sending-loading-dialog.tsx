"use client";

import { EmailSendingAnimation } from "@/components/animations/email-sending-animation";

interface EmailSendingLoadingDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function EmailSendingLoadingDialog({
  open,
  onComplete,
}: EmailSendingLoadingDialogProps) {
  if (!open) return null;

  return (
    <EmailSendingAnimation
      isVisible={open}
      onComplete={onComplete}
    />
  );
}
