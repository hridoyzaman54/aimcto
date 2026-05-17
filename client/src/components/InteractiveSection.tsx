import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

interface InteractiveSectionProps {
    children: React.ReactNode;
    className?: string;
}

export default function InteractiveSection({ children, className = "" }: InteractiveSectionProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Motion values for tracking movement
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Handle mouse/touch movement to create a 3D tilt effect
    const handleMove = (clientX: number, clientY: number) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;

        // Calculate rotation based on cursor position relative to center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((offsetY - centerY) / centerY) * -5; // Max 5 degree tilt for subtlety
        const rotateY = ((offsetX - centerX) / centerX) * 5;

        x.set(rotateY);
        y.set(rotateX);
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        handleMove(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: React.TouchEvent) => {
        if (event.touches[0]) {
            handleMove(event.touches[0].clientX, event.touches[0].clientY);
        }
    };

    const resetPosition = () => {
        x.set(0);
        y.set(0);
    };

    // Smooth out the movement
    const springConfig = { stiffness: 150, damping: 20 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseLeave={resetPosition}
            style={{
                perspective: "1200px",
                rotateX: springY,
                rotateY: springX,
                transformStyle: "preserve-3d"
            }}
            className={`w-full h-full ${className}`}
        >
            {children}
        </motion.div>
    );
}
