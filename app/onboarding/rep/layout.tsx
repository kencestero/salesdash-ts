import { ReactNode } from "react";

export default function RepOnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #E96114 0%, #09213C 50%, #050d18 100%)",
      }}
    >
      {children}
    </div>
  );
}
