'use client'

import React, { useRef, useEffect, useCallback } from "react";

const SpaceCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);

    const stars = useRef<{ x: number; y: number; radius: number; opacity: number }[]>([]);
    const comets = useRef<{ x: number; y: number; dx: number; dy: number; radius: number; isVisible: boolean }[]>([]);
    const shootingStars = useRef<{ x: number; y: number; dx: number; dy: number; opacity: number }[]>([]);
    const cosmicDust = useRef<{ x: number; y: number; dx: number; dy: number; opacity: number }[]>([]);

    // Configuration
    const config = {
        starCount: 200,
        cometCount: 1,
        cometSpeed: 2,
        cometTrailLength: 35,
        dustCount: 100,
        dustSpeed: 0.2,
        cometVisibilityChance: 0.005,
        cometHeadGlowSize: 15,
    };
    // Create stars
    const createStars = useCallback((width: number, height: number) => {
        stars.current = Array.from({ length: config.starCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2,
            opacity: Math.random(),
        }));
    }, [config.starCount]);

    // Create comets
    const createComets = useCallback((width: number, height: number) => {
        comets.current = Array.from({ length: config.cometCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            dx: (Math.random() * config.cometSpeed * 2) - config.cometSpeed,
            dy: (Math.random() * config.cometSpeed * 2) - config.cometSpeed,
            radius: Math.random() * 3 + 2,
            isVisible: false, // Add isVisible property
        }));
    }, [config.cometCount, config.cometSpeed]);

    // Create Cosmic Dust
    const createCosmicDust = useCallback((width: number, height: number) => {
        cosmicDust.current = Array.from({ length: config.dustCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            dx: (Math.random() - 0.5) * config.dustSpeed,
            dy: (Math.random() - 0.5) * config.dustSpeed,
            opacity: Math.random() * 0.5 + 0.1,
        }));
    }, [config.dustCount, config.dustSpeed]);

    // Draw function
    const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.clearRect(0, 0, width, height);

        // Draw stars
        stars.current.forEach((star) => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
        });

        // Twinkle effect for stars
        stars.current.forEach((star) => {
            star.opacity += (Math.random() - 0.5) * 0.05;
            if (star.opacity > 1) star.opacity = 1;
            if (star.opacity < 0) star.opacity = 0;
        });

        // Draw and animate comets
        comets.current.forEach((comet) => {
            if (!comet.isVisible && Math.random() < config.cometVisibilityChance) {
                comet.isVisible = true;
                comet.x = Math.random() * width;
                comet.y = Math.random() * height;
                comet.dx = (Math.random() * config.cometSpeed * 2) - config.cometSpeed;
                comet.dy = (Math.random() * config.cometSpeed * 2) - config.cometSpeed;
            }

            if (comet.isVisible) {
                // Create gradient for the comet tail
                const tailGradient = ctx.createLinearGradient(
                    comet.x,
                    comet.y,
                    comet.x - comet.dx * config.cometTrailLength,
                    comet.y - comet.dy * config.cometTrailLength
                );
                tailGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
                tailGradient.addColorStop(1, "rgba(0, 0, 255, 0)");

                // Draw tail
                ctx.beginPath();
                ctx.moveTo(comet.x, comet.y);
                ctx.lineTo(comet.x - comet.dx * config.cometTrailLength, comet.y - comet.dy * config.cometTrailLength);
                ctx.strokeStyle = tailGradient;
                ctx.lineWidth = comet.radius * 2;
                ctx.stroke();

                // Create radial gradient for the comet head (burning effect)
                const headGradient = ctx.createRadialGradient(
                    comet.x, comet.y, 0,
                    comet.x, comet.y, config.cometHeadGlowSize
                );
                headGradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // White core
                headGradient.addColorStop(0.3, "rgba(255, 200, 100, 0.8)"); // Orange-yellow middle
                headGradient.addColorStop(0.6, "rgba(255, 100, 50, 0.4)"); // Reddish outer
                headGradient.addColorStop(1, "rgba(255, 50, 0, 0)"); // Fade to transparent

                // Draw outer glow (burning effect)
                ctx.beginPath();
                ctx.arc(comet.x, comet.y, config.cometHeadGlowSize, 0, Math.PI * 2);
                ctx.fillStyle = headGradient;
                ctx.fill();

                // Draw core of the comet
                ctx.beginPath();
                ctx.arc(comet.x, comet.y, comet.radius, 0, Math.PI * 2);
                ctx.fillStyle = "white";
                ctx.fill();

                // Update comet position
                comet.x += comet.dx;
                comet.y += comet.dy;

                // Reset comet if off-screen
                if (comet.x < 0 || comet.x > width || comet.y < 0 || comet.y > height) {
                    comet.isVisible = false;
                }
            }
        });

        // Draw and animate shooting stars
        shootingStars.current.forEach((star, index) => {
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star.x - star.dx * 10, star.y - star.dy * 10);
            ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Update position and opacity
            star.x += star.dx;
            star.y += star.dy;
            star.opacity -= 0.02;

            // Remove star if faded
            if (star.opacity <= 0) {
                shootingStars.current.splice(index, 1);
            }
        });

        // Randomly add new shooting stars
        if (Math.random() < 0.002) {
            shootingStars.current.push({
                x: Math.random() * width,
                y: Math.random() * height / 2, // Top half of the screen
                dx: Math.random() * -5 - 2, // Leftward and downward
                dy: Math.random() * 2 + 1,
                opacity: 1,
            });
        }

        // Draw and animate cosmic dust
        cosmicDust.current.forEach((dust) => {
            ctx.beginPath();
            ctx.arc(dust.x, dust.y, 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${dust.opacity})`;
            ctx.fill();

            // Update position
            dust.x += dust.dx;
            dust.y += dust.dy;

            // Wrap around if off-screen
            if (dust.x < 0) dust.x = width;
            if (dust.x > width) dust.x = 0;
            if (dust.y < 0) dust.y = height;
            if (dust.y > height) dust.y = 0;
        });

    }, [config.cometTrailLength, config.cometSpeed, config.cometVisibilityChance, config.cometHeadGlowSize]);

    // Animate
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const { width, height } = canvas;
                draw(ctx, width, height);
            }
        }
        animationRef.current = requestAnimationFrame(animate);
    }, [draw]);

    // Initialize canvas and handle resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const resizeCanvas = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                createStars(canvas.width, canvas.height);
                createComets(canvas.width, canvas.height);
                createCosmicDust(canvas.width, canvas.height);
            };

            resizeCanvas();
            animate();
            window.addEventListener("resize", resizeCanvas);

            return () => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
                window.removeEventListener("resize", resizeCanvas);
            };
        }
    }, [createStars, createComets, createCosmicDust, animate]);

    return <canvas ref={canvasRef} style={{ display: "block" }} />;
};

export default SpaceCanvas;
