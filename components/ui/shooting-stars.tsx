"use client";

import React, { useEffect, useRef, useState } from "react";

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
}

interface ShootingStarsProps {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
  className?: string;
}

export const ShootingStars: React.FC<ShootingStarsProps> = ({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 10,
  starHeight = 1,
  className,
}) => {
  const [stars, setStars] = useState<ShootingStar[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const createStar = (): ShootingStar => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Random starting position on screen edge
      const side = Math.floor(Math.random() * 4);
      let x, y, angle;

      switch (side) {
        case 0: // Top edge
          x = Math.random() * viewportWidth;
          y = 0;
          angle = Math.random() * (Math.PI / 2) + Math.PI / 4; // 45-135 degrees
          break;
        case 1: // Right edge
          x = viewportWidth;
          y = Math.random() * viewportHeight;
          angle = Math.random() * (Math.PI / 2) + (3 * Math.PI) / 4; // 135-225 degrees
          break;
        case 2: // Bottom edge
          x = Math.random() * viewportWidth;
          y = viewportHeight;
          angle = Math.random() * (Math.PI / 2) - Math.PI / 4; // 315-45 degrees
          break;
        default: // Left edge
          x = 0;
          y = Math.random() * viewportHeight;
          angle = Math.random() * (Math.PI / 2) - Math.PI / 4; // -45-45 degrees
          break;
      }

      return {
        id: Date.now() + Math.random(),
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
      };
    };

    const animateStars = () => {
      setStars((prevStars) => {
        return prevStars
          .map((star) => {
            const newX = star.x + star.speed * Math.cos(star.angle);
            const newY = star.y + star.speed * Math.sin(star.angle);
            const newDistance = star.distance + star.speed;
            const newScale = 1 + newDistance / 100;

            // Remove star if it's out of bounds
            if (
              newX < -20 ||
              newX > window.innerWidth + 20 ||
              newY < -20 ||
              newY > window.innerHeight + 20
            ) {
              return null;
            }

            return {
              ...star,
              x: newX,
              y: newY,
              distance: newDistance,
              scale: newScale,
            };
          })
          .filter((star): star is ShootingStar => star !== null);
      });

      requestAnimationFrame(animateStars);
    };

    const spawnStar = () => {
      setStars((prev) => [...prev, createStar()]);
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      setTimeout(spawnStar, delay);
    };

    spawnStar();
    const animationId = requestAnimationFrame(animateStars);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [minSpeed, maxSpeed, minDelay, maxDelay]);

  return (
    <svg
      ref={svgRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {stars.map((star) => {
        const trailLength = star.distance;
        const x2 = star.x - trailLength * Math.cos(star.angle);
        const y2 = star.y - trailLength * Math.sin(star.angle);

        return (
          <line
            key={star.id}
            x1={star.x}
            y1={star.y}
            x2={x2}
            y2={y2}
            stroke={`url(#gradient-${star.id})`}
            strokeWidth={starHeight * star.scale}
            strokeLinecap="round"
          >
            <defs>
              <linearGradient id={`gradient-${star.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={trailColor} stopOpacity="0" />
                <stop offset="100%" stopColor={starColor} stopOpacity="1" />
              </linearGradient>
            </defs>
          </line>
        );
      })}
    </svg>
  );
};
