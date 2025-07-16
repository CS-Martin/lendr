import React, { useState } from "react"
import { motion } from 'framer-motion'

interface Card3DInterface {
    children: React.ReactNode;
    className: string;
}

export const Card3D = ({ children, className = "" }: Card3DInterface) => {
    const [rotateX, setRotateX] = useState(0)
    const [rotateY, setRotateY] = useState(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const rotateXValue = (e.clientY - centerY) / 30
        const rotateYValue = (centerX - e.clientX) / 30

        setRotateX(rotateXValue)
        setRotateY(rotateYValue)
    }

    const handleMouseLeave = () => {
        setRotateX(0)
        setRotateY(0)
    }

    return (
        <motion.div
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
                rotateX,
                rotateY,
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
            }}
            style={{
                transformStyle: "preserve-3d",
                transformOrigin: "center center",
            }}
        >
            {children}
        </motion.div>
    )
}