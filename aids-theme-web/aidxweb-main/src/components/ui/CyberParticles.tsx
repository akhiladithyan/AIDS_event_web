"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const CyberParticles = () => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    if (!init) return null;

    return (
        <Particles
            id="tsparticles"
            className="fixed inset-0 z-10 pointer-events-none mix-blend-screen"
            options={{
                background: {
                    color: {
                        value: "transparent",
                    },
                },
                fpsLimit: 60, // Reduced from 120 for better performance
                interactivity: {
                    events: {
                        onClick: {
                            enable: true,
                            mode: "push",
                        },
                        onHover: {
                            enable: true,
                            mode: "grab",
                        },
                    },
                    modes: {
                        push: {
                            quantity: 2, // Reduced from 4
                        },
                        grab: {
                            distance: 120, // Reduced from 140
                            links: {
                                opacity: 0.5
                            }
                        },
                    },
                },
                particles: {
                    color: {
                        value: "#39ff88", // Doom Green
                    },
                    links: {
                        color: "#18c96a", // Doom Emerald
                        distance: 120, // Reduced from 150
                        enable: true,
                        opacity: 0.25,
                        width: 1,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce",
                        },
                        random: false,
                        speed: 1,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            // area: 800, // Removed to fix type error, using default
                        },
                        value: 30, // Reduced from 60 for better performance
                    },
                    opacity: {
                        value: 0.3,
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 3 },
                    },
                },
                detectRetina: true,
            }}
        />
    );
};

export default CyberParticles;
