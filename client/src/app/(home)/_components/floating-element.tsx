import { motion } from "framer-motion"

interface FloatingElementInterface {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export const FloatingElement = ({ children, delay = 0, duration = 4, className = "" }: FloatingElementInterface) => {
    return (
        <motion.div
            className={`absolute ${className}`}
            animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                rotateY: [0, 180, 360],
                rotateX: [0, 10, 0],
            }}
            transition={{
                duration,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay,
            }}
            style={{
                transformStyle: "preserve-3d",
            }}
        >
            {children}
        </motion.div>
    )
}