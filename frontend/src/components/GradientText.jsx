import React from 'react'

function GradientText({ 
    children, 
    className = '', 
    as: Tag = 'span',
    variant = 'primary', // primary, secondary, accent, warm
    animate = false
}) {
    // ✅ Different gradient variants for different use cases
    const variants = {
        primary: 'from-orange-400 via-orange-500 to-amber-400',
        secondary: 'from-blue-400 via-indigo-500 to-purple-400',
        accent: 'from-pink-400 via-rose-500 to-red-400',
        warm: 'from-amber-400 via-orange-500 to-yellow-400',
        cool: 'from-cyan-400 via-blue-500 to-indigo-400',
        premium: 'from-orange-400 via-amber-400 to-orange-500'
    }

    const gradient = variants[variant] || variants.primary

    return (
        <Tag className={`inline-block ${className}`}>
            <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${animate ? 'animate-gradient' : ''}`}>
                {children}
            </span>
            
            {/* ✅ Optional animation styles */}
            {animate && (
                <style>{`
                    @keyframes gradient-flow {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    .animate-gradient {
                        background-size: 200% auto;
                        animation: gradient-flow 3s ease-in-out infinite;
                    }
                `}</style>
            )}
        </Tag>
    )
}

export default GradientText