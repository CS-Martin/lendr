'use client';

import { useEffect, useState } from 'react';

export const GridBackground = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Only update mouse position after flash screen is complete
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className='absolute inset-0 opacity-20'>
            <div
                className='absolute inset-0 bg-gradient-to-br from-lendr-400/10 via-transparent to-cyan-400/10'
                style={{
                    backgroundImage: `
              linear-gradient(rgba(220, 243, 71, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220, 243, 71, 0.1) 1px, transparent 1px)
              `,
                    backgroundSize: '50px 50px',
                    transform: `translate(${mousePosition?.x ? mousePosition.x * 0.3 : 0}px, ${mousePosition?.y ? mousePosition.y * 0.3 : 0}px)`,
                }}
            />
        </div>
    );
};
