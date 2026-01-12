import Image from "next/image";

export const metadata = {
  title: "Onboarding | Remotive Logistics",
  description: "Complete your onboarding to join the Remotive Logistics sales team",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #E96114 0%, #09213C 50%, #050d18 100%)",
      }}
    >
      {/* Header */}
      <header className="w-full py-6 px-4">
        <div className="max-w-4xl mx-auto flex justify-center">
          <Image
            src="/images/Remotivesaleshublogo.webp"
            alt="Remotive Logistics"
            width={220}
            height={70}
            className="object-contain"
            priority
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Remotive Logistics. All rights reserved.
      </footer>
    </div>
  );
}
