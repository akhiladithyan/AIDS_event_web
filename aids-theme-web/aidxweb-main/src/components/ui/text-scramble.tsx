"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;
const CHARS = "!@#$%^&*():{};|,.<>/?";

type Props = {
    children: string;
    className?: string;
};

export default function TextScramble({ children, className }: Props) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [text, setText] = useState(children);

    const stopScramble = () => {
        clearInterval(intervalRef.current || undefined);
        setText(children);
    };

    const scramble = () => {
        let pos = 0;

        intervalRef.current = setInterval(() => {
            const scrambled = children
                .split("")
                .map((char, index) => {
                    if (pos / CYCLES_PER_LETTER > index) {
                        return char;
                    }

                    const randomChar = CHARS[Math.floor(Math.random() * CHARS.length)];
                    return randomChar;
                })
                .join("");

            setText(scrambled);
            pos++;

            if (pos >= children.length * CYCLES_PER_LETTER) {
                stopScramble();
            }
        }, SHUFFLE_TIME);
    };

    useEffect(() => {
        setText(children);
    }, [children]);

    return (
        <motion.span
            onMouseEnter={scramble}
            onMouseLeave={stopScramble}
            className={className}
        >
            {text}
        </motion.span>
    );
}
