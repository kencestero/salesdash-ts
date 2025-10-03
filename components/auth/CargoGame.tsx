"use client";
import { useEffect, useRef, useState } from "react";

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed?: number;
}

const CargoGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const truckImg = useRef<HTMLImageElement>();
  const logoImg = useRef<HTMLImageElement>();
  const heartImg = useRef<HTMLImageElement>();
  const coneImg = useRef<HTMLImageElement>();

  const gameStateRef = useRef({
    player: { x: 150, y: 250, width: 150, height: 75 },
    obstacles: [] as GameObject[],
    cargo: [] as GameObject[],
    blimpX: -200,
    blimpY: 80,
    speed: 5,
    frame: 0,
    invincible: false,
    invincibleTimer: 0,
  });

  useEffect(() => {
    // Load images
    const truck = new window.Image();
    truck.src = "/images/LoginGame (2).png";
    const logo = new window.Image();
    logo.src = "/images/LoginGame (1).png";

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        truckImg.current = truck;
        logoImg.current = logo;
        setImagesLoaded(true);
      }
    };

    truck.onload = checkLoaded;
    logo.onload = checkLoaded;

    truck.onerror = () => {
      console.error("Failed to load truck image");
      checkLoaded();
    };
    logo.onerror = () => {
      console.error("Failed to load logo image");
      checkLoaded();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Draw cargo box
    const drawCargo = (x: number, y: number) => {
      ctx.fillStyle = "#f97316"; // Orange
      ctx.fillRect(x, y, 30, 30);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, 30, 30);

      // MJ text on box
      ctx.fillStyle = "#1e3a8a";
      ctx.font = "bold 14px monospace";
      ctx.fillText("MJ", x + 6, y + 20);
    };

    // Draw heart
    const drawHeart = (x: number, y: number, size: number) => {
      ctx.save();
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      const topY = y + size * 0.3;
      ctx.moveTo(x, topY);
      ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, topY);
      ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.7, x, y + size);
      ctx.bezierCurveTo(x, y + size * 0.7, x + size / 2, y + size / 2, x + size / 2, topY);
      ctx.bezierCurveTo(x + size / 2, y, x, y, x, topY);
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    };

    // Draw cone
    const drawCone = (x: number, y: number, width: number, height: number) => {
      // Orange cone body
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.closePath();
      ctx.fill();

      // White stripes
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + width * 0.2, y + height * 0.3, width * 0.6, height * 0.15);
      ctx.fillRect(x + width * 0.15, y + height * 0.6, width * 0.7, height * 0.15);

      // Black outline
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.closePath();
      ctx.stroke();
    };

    // Game loop
    let animationId: number;
    const gameLoop = () => {
      if (!canvas || !truckImg.current || !logoImg.current) return;

      const state = gameStateRef.current;
      state.frame++;

      // Handle invincibility
      if (state.invincible) {
        state.invincibleTimer--;
        if (state.invincibleTimer <= 0) {
          state.invincible = false;
        }
      }

      // Draw solid orange background
      ctx.fillStyle = "#f97316";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road lines
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw floating blimp with MJ logo
      state.blimpX += 2;
      if (state.blimpX > canvas.width + 200) {
        state.blimpX = -200;
      }

      // Blimp bouncing motion
      const blimpBounce = Math.sin(state.frame * 0.03) * 15;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        logoImg.current,
        state.blimpX,
        state.blimpY + blimpBounce,
        120,
        120
      );
      ctx.restore();

      // Spawn obstacles (traffic cones)
      if (state.frame % 100 === 0) {
        state.obstacles.push({
          x: canvas.width,
          y: Math.random() * (canvas.height - 150) + 50,
          width: 35,
          height: 45,
          speed: state.speed,
        });
      }

      // Spawn cargo
      if (state.frame % 130 === 0) {
        state.cargo.push({
          x: canvas.width,
          y: Math.random() * (canvas.height - 100) + 50,
          width: 30,
          height: 30,
          speed: state.speed,
        });
      }

      // Update and draw obstacles (traffic cones)
      state.obstacles = state.obstacles.filter((obs) => {
        obs.x -= obs.speed || state.speed;

        // Draw traffic cone
        drawCone(obs.x, obs.y, obs.width, obs.height);

        // Collision detection
        if (
          !state.invincible &&
          state.player.x < obs.x + obs.width &&
          state.player.x + state.player.width > obs.x &&
          state.player.y < obs.y + obs.height &&
          state.player.y + state.player.height > obs.y
        ) {
          // Lose a life
          setLives((prev) => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameOver(true);
            }
            return newLives;
          });

          // Set invincibility for 2 seconds
          state.invincible = true;
          state.invincibleTimer = 120; // 2 seconds at 60fps

          return false; // Remove the obstacle
        }

        return obs.x > -obs.width;
      });

      // Update and draw cargo
      state.cargo = state.cargo.filter((cargo) => {
        cargo.x -= cargo.speed || state.speed;
        drawCargo(cargo.x, cargo.y);

        // Collision detection
        if (
          state.player.x < cargo.x + cargo.width &&
          state.player.x + state.player.width > cargo.x &&
          state.player.y < cargo.y + cargo.height &&
          state.player.y + state.player.height > cargo.y
        ) {
          setScore((prev) => prev + 10);
          return false; // Remove collected cargo
        }

        return cargo.x > -cargo.width;
      });

      // Draw player truck (with flashing when invincible)
      if (!state.invincible || state.frame % 10 < 5) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          truckImg.current,
          state.player.x,
          state.player.y,
          state.player.width,
          state.player.height
        );
        ctx.restore();
      }

      // Draw score with better visibility
      ctx.fillStyle = "#000";
      ctx.fillRect(15, 15, 180, 45);
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 3;
      ctx.strokeRect(15, 15, 180, 45);

      ctx.fillStyle = "#f97316";
      ctx.font = "bold 28px monospace";
      ctx.fillText(`SCORE: ${score}`, 25, 45);

      // Draw lives (hearts)
      for (let i = 0; i < lives; i++) {
        drawHeart(canvas.width - 50 - (i * 50), 25, 30);
      }

      if (!gameOver) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      const moveSpeed = 20;

      if (e.key === "ArrowUp" && state.player.y > 50) {
        state.player.y -= moveSpeed;
      }
      if (e.key === "ArrowDown" && state.player.y < canvas.height - state.player.height - 50) {
        state.player.y += moveSpeed;
      }
      if (e.key === "ArrowLeft" && state.player.x > 50) {
        state.player.x -= moveSpeed;
      }
      if (e.key === "ArrowRight" && state.player.x < canvas.width - state.player.width - 50) {
        state.player.x += moveSpeed;
      }
    };

    // Mouse/Touch controls
    const handleClick = (e: MouseEvent | TouchEvent) => {
      const state = gameStateRef.current;
      const rect = canvas.getBoundingClientRect();
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const clickY = clientY - rect.top;

      if (clickY < canvas.height / 2 && state.player.y > 50) {
        state.player.y -= 40;
      } else if (clickY >= canvas.height / 2 && state.player.y < canvas.height - state.player.height - 50) {
        state.player.y += 40;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleClick);

    gameLoop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [gameOver, score, lives, imagesLoaded]);

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setLives(3);
    gameStateRef.current = {
      player: { x: 150, y: 250, width: 150, height: 75 },
      obstacles: [],
      cargo: [],
      blimpX: -200,
      blimpY: 80,
      speed: 5,
      frame: 0,
      invincible: false,
      invincibleTimer: 0,
    };
  };

  return (
    <div className="relative w-full h-full bg-primary">
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xl">
          Loading Game...
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
          <div className="text-center bg-primary/20 backdrop-blur-sm p-8 rounded-lg border-4 border-primary">
            <h2 className="text-5xl font-bold text-primary mb-4">GAME OVER!</h2>
            <p className="text-3xl text-white mb-6">SCORE: {score}</p>
            <button
              onClick={resetGame}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-xl hover:bg-primary/90 hover:scale-105 transition-transform"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black/70 px-4 py-2 rounded-lg border-2 border-primary">
        🎮 ↑↓←→ Arrow Keys or Click to Move
      </div>
    </div>
  );
};

export default CargoGame;
