"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ExternalLink,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  contentType: "IMAGE" | "VIDEO" | "TEXT_ONLY";
  layoutType: "FULL_MEDIA" | "MEDIA_CAPTION" | "SPLIT_LEFT" | "SPLIT_RIGHT";
  mediaUrl?: string;
  youtubeId?: string;
  mediaAlt?: string;
  title?: string;
  description?: string;
  textColor?: string;
  backgroundColor?: string;
  linkUrl?: string;
  linkText?: string;
}

interface Slideshow {
  id: string;
  name: string;
  rotationSpeed: number;
  slides: Slide[];
}

export function DashboardSlideshow() {
  const [slideshow, setSlideshow] = useState<Slideshow | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch slideshow
  useEffect(() => {
    async function fetchSlideshow() {
      try {
        const response = await fetch("/api/dashboard-content");
        if (response.ok) {
          const data = await response.json();
          if (data.hasContent && data.slideshow) {
            setSlideshow(data.slideshow);
          }
        }
      } catch (error) {
        console.error("Error fetching slideshow:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSlideshow();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!slideshow || slideshow.slides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideshow.slides.length);
    }, slideshow.rotationSpeed);

    return () => clearInterval(interval);
  }, [slideshow, isPaused]);

  const goToSlide = useCallback((index: number) => {
    if (!slideshow) return;
    setCurrentIndex(index);
  }, [slideshow]);

  const goToPrev = useCallback(() => {
    if (!slideshow) return;
    setCurrentIndex((prev) => (prev - 1 + slideshow.slides.length) % slideshow.slides.length);
  }, [slideshow]);

  const goToNext = useCallback(() => {
    if (!slideshow) return;
    setCurrentIndex((prev) => (prev + 1) % slideshow.slides.length);
  }, [slideshow]);

  // Loading state
  if (loading) {
    return (
      <Card className="h-[300px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10">
        <CardContent className="h-full flex items-center justify-center">
          <div className="animate-pulse text-white/50">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  // No content - show placeholder
  if (!slideshow || slideshow.slides.length === 0) {
    return (
      <Card className="h-[300px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10 overflow-hidden">
        <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-full bg-[#E96114]/20 flex items-center justify-center mb-4">
            <Megaphone className="w-8 h-8 text-[#E96114]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Remotive Logistics</h3>
          <p className="text-white/60 text-sm">
            News and updates will be coming soon
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentSlide = slideshow.slides[currentIndex];

  // Render slide content based on layout
  const renderSlideContent = (slide: Slide) => {
    const textStyle = { color: slide.textColor || "#FFFFFF" };

    // Text content component
    const TextContent = () => (
      <div className="flex flex-col justify-center p-6">
        {slide.title && (
          <h3 className="text-xl md:text-2xl font-bold mb-2" style={textStyle}>
            {slide.title}
          </h3>
        )}
        {slide.description && (
          <p className="text-sm md:text-base opacity-90 mb-4" style={textStyle}>
            {slide.description}
          </p>
        )}
        {slide.linkUrl && (
          <a
            href={slide.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#E96114] hover:text-[#E96114]/80 font-medium"
          >
            {slide.linkText || "Learn more"}
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    );

    // Media component
    const MediaContent = () => {
      if (slide.youtubeId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${slide.youtubeId}?autoplay=0&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }

      if (slide.contentType === "VIDEO" && slide.mediaUrl) {
        // Check if it's a Google Drive video
        if (slide.mediaUrl.includes("drive.google.com")) {
          return (
            <iframe
              src={slide.mediaUrl}
              className="w-full h-full"
              allow="autoplay"
              allowFullScreen
            />
          );
        }
        return (
          <video
            src={slide.mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        );
      }

      if (slide.contentType === "IMAGE" && slide.mediaUrl) {
        return (
          <img
            src={slide.mediaUrl}
            alt={slide.mediaAlt || slide.title || "Slide"}
            className="w-full h-full object-cover"
          />
        );
      }

      return null;
    };

    // Layout rendering
    switch (slide.layoutType) {
      case "FULL_MEDIA":
        return (
          <div className="relative w-full h-full">
            <MediaContent />
            {(slide.title || slide.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                {slide.title && (
                  <h3 className="text-xl font-bold text-white mb-1">{slide.title}</h3>
                )}
                {slide.description && (
                  <p className="text-sm text-white/80">{slide.description}</p>
                )}
                {slide.linkUrl && (
                  <a
                    href={slide.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#E96114] hover:text-[#E96114]/80 font-medium mt-2"
                  >
                    {slide.linkText || "Learn more"}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        );

      case "MEDIA_CAPTION":
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0">
              <MediaContent />
            </div>
            {(slide.title || slide.description) && (
              <div className="p-4 bg-black/50">
                {slide.title && (
                  <h3 className="text-lg font-bold" style={textStyle}>{slide.title}</h3>
                )}
                {slide.description && (
                  <p className="text-sm opacity-80" style={textStyle}>{slide.description}</p>
                )}
              </div>
            )}
          </div>
        );

      case "SPLIT_LEFT":
        return (
          <div className="flex h-full">
            <div className="w-1/2 h-full">
              <MediaContent />
            </div>
            <div className="w-1/2 h-full flex items-center">
              <TextContent />
            </div>
          </div>
        );

      case "SPLIT_RIGHT":
        return (
          <div className="flex h-full">
            <div className="w-1/2 h-full flex items-center">
              <TextContent />
            </div>
            <div className="w-1/2 h-full">
              <MediaContent />
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <TextContent />
          </div>
        );
    }
  };

  return (
    <Card
      className="h-[300px] overflow-hidden border-white/10 relative group"
      style={{ backgroundColor: currentSlide.backgroundColor || "#1a1a2e" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Content */}
      <CardContent className="p-0 h-full">
        {renderSlideContent(currentSlide)}
      </CardContent>

      {/* Navigation Controls (show on hover) */}
      {slideshow.slides.length > 1 && (
        <>
          {/* Prev/Next Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToPrev}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToNext}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {slideshow.slides.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-[#E96114] w-6"
                    : "bg-white/50 hover:bg-white/80"
                )}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          {/* Pause/Play indicator */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge variant="soft" className="bg-black/50 text-white text-xs">
              {isPaused ? (
                <>
                  <Pause className="w-3 h-3 mr-1" /> Paused
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" /> Auto
                </>
              )}
            </Badge>
          </div>
        </>
      )}
    </Card>
  );
}
