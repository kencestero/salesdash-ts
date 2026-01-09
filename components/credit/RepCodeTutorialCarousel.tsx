"use client";

import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Link2,
  Workflow,
  Share2,
  Lightbulb,
  Trophy,
  CheckCircle,
  Copy,
  Image as ImageIcon,
  MessageSquare,
  Mail,
  Phone,
  QrCode,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  points?: string[];
  flowSteps?: { step: string; description: string }[];
  imagePlaceholder: string;
  imageSrc?: string; // Actual image path if available
  icon: LucideIcon;
  bgGradient: string;
  accentColor: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Your Personal Credit Application Link",
    subtitle: "Every application submitted = a lead assigned to YOU",
    points: [
      "Your unique link tracks ALL applications back to you",
      "No more lost leads or miscommunication",
      "Customers apply → you get the sale credit",
    ],
    imagePlaceholder: "Rep sharing link with customer",
    imageSrc: "/images/custapplicationlink.webp",
    icon: Link2,
    bgGradient: "from-[#E96114]/20 via-[#E96114]/5 to-transparent",
    accentColor: "text-[#E96114]",
  },
  {
    id: 2,
    title: "How Your Rep Code Works",
    subtitle: "Simple. Automatic. Powerful.",
    flowSteps: [
      { step: "1", description: "Copy your unique link" },
      { step: "2", description: "Share with customer" },
      { step: "3", description: "Customer submits form" },
      { step: "4", description: "Lead assigned to YOU!" },
    ],
    imagePlaceholder: "Visual flowchart showing the process",
    icon: Workflow,
    bgGradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    accentColor: "text-blue-500",
  },
  {
    id: 3,
    title: "Share Everywhere!",
    subtitle: "The more you share, the more leads you capture",
    points: [
      "Text message (fastest response)",
      "Email signature (auto-generate leads)",
      "Social media DMs",
      'Phone calls - "I\'ll text you the link right now"',
      "QR Code (print for events)",
    ],
    imagePlaceholder: "Multiple device/channel illustrations",
    icon: Share2,
    bgGradient: "from-green-500/20 via-green-500/5 to-transparent",
    accentColor: "text-green-500",
  },
  {
    id: 4,
    title: "Pro Tips for Maximum Conversions",
    subtitle: "What separates good reps from GREAT reps",
    points: [
      "Send the link DURING the call (strike while hot!)",
      "Follow up within 24 hours of submission",
      "Add customer to CRM immediately after sharing",
      "Always explain what happens next",
      "Financing talk: Conventional FIRST, RTO as backup",
    ],
    imagePlaceholder: "Sales tips illustration",
    icon: Lightbulb,
    bgGradient: "from-purple-500/20 via-purple-500/5 to-transparent",
    accentColor: "text-purple-500",
  },
  {
    id: 5,
    title: "Ready to Close More Deals?",
    subtitle: "Copy your link and start selling!",
    points: [
      "Your link is your most powerful sales tool",
      "Every share is a potential commission",
      "The CRM tracks everything automatically",
    ],
    imagePlaceholder: "Success/celebration illustration",
    icon: Trophy,
    bgGradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    accentColor: "text-amber-500",
  },
];

interface RepCodeTutorialCarouselProps {
  onCopyLink?: () => void;
}

export function RepCodeTutorialCarousel({ onCopyLink }: RepCodeTutorialCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const getChannelIcon = (point: string) => {
    if (point.includes("Text")) return MessageSquare;
    if (point.includes("Email")) return Mail;
    if (point.includes("Phone")) return Phone;
    if (point.includes("QR")) return QrCode;
    return Share2;
  };

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardContent className="p-0">
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          className="w-full"
        >
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={slide.id}>
                <div className={`bg-gradient-to-br ${slide.bgGradient} min-h-[400px] lg:min-h-[450px]`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 lg:p-8">
                    {/* Left: Content */}
                    <div className="space-y-5 flex flex-col justify-center">
                      {/* Header with Icon */}
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-background/80 shadow-lg ${slide.accentColor}`}>
                          <slide.icon className="h-8 w-8" />
                        </div>
                        <div>
                          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                            {slide.title}
                          </h2>
                          <p className="text-muted-foreground mt-1">
                            {slide.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Flow Steps (for slide 2) */}
                      {slide.flowSteps && (
                        <div className="flex flex-wrap items-center gap-2">
                          {slide.flowSteps.map((step, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-background/60 border ${slide.accentColor.replace("text-", "border-")}/30`}>
                                <span className={`font-bold ${slide.accentColor}`}>{step.step}</span>
                                <span className="text-sm">{step.description}</span>
                              </div>
                              {i < (slide.flowSteps?.length || 0) - 1 && (
                                <ArrowRight className={`h-4 w-4 ${slide.accentColor} hidden sm:block`} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Points List */}
                      {slide.points && (
                        <ul className="space-y-3">
                          {slide.points.map((point, i) => {
                            const ChannelIcon = slide.id === 3 ? getChannelIcon(point) : CheckCircle;
                            return (
                              <li
                                key={i}
                                className="flex items-start gap-3"
                              >
                                <ChannelIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${slide.accentColor}`} />
                                <span className="text-sm lg:text-base">{point}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {/* CTA Button on last slide */}
                      {slide.id === 5 && onCopyLink && (
                        <div>
                          <Button
                            onClick={onCopyLink}
                            size="lg"
                            className="bg-gradient-to-r from-[#E96114] to-[#09213C] hover:opacity-90 text-white font-semibold gap-2"
                          >
                            <Copy className="h-5 w-5" />
                            Copy My Link Now
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Right: Image or Placeholder */}
                    <div className="flex items-center justify-center">
                      {slide.imageSrc ? (
                        <div className="w-full rounded-xl overflow-hidden shadow-lg">
                          <Image
                            src={slide.imageSrc}
                            alt={slide.title}
                            width={1920}
                            height={1080}
                            className="w-full h-auto object-cover"
                            priority={slide.id === 1}
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-video bg-muted/30 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 backdrop-blur-sm">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
                          <p className="text-sm text-muted-foreground text-center px-4">
                            {slide.imagePlaceholder}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            1920 × 1080
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Buttons */}
          <CarouselPrevious className="left-2 lg:left-4 bg-background/80 hover:bg-background" />
          <CarouselNext className="right-2 lg:right-4 bg-background/80 hover:bg-background" />

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  current === index
                    ? "bg-[#E96114] w-8"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </CardContent>
    </Card>
  );
}
