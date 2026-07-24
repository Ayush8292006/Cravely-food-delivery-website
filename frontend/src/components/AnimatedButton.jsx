import React from 'react'
import { motion } from 'framer-motion'

function AnimatedButton({ 
    children, 
    variant = 'primary', 
    className = '', 
    onClick,
    type = 'button',
    disabled = false,
    size = 'md',
    fullWidth = false,
    icon = null,
    iconPosition = 'left'
}) {
    const variants = {
        primary: {
            bg: 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35]',
            hoverBg: 'hover:shadow-[#ff2d55]/40',
            text: 'text-white',
            border: 'border-transparent',
            glow: 'shadow-lg shadow-[#ff2d55]/25 hover:shadow-[#ff2d55]/40'
        },
        secondary: {
            bg: 'bg-white/5',
            hoverBg: 'hover:bg-white/10',
            text: 'text-white/70 hover:text-white',
            border: 'border-white/10 hover:border-[#ff2d55]/30',
            glow: 'hover:shadow-lg hover:shadow-[#ff2d55]/5'
        },
        outline: {
            bg: 'bg-transparent',
            hoverBg: 'hover:bg-[#ff2d55]/10',
            text: 'text-[#ff6b35]',
            border: 'border-[#ff2d55]/30 hover:border-[#ff2d55]/50',
            glow: 'hover:shadow-lg hover:shadow-[#ff2d55]/10'
        },
        success: {
            bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
            hoverBg: 'hover:shadow-green-500/40',
            text: 'text-white',
            border: 'border-transparent',
            glow: 'shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
        },
        danger: {
            bg: 'bg-gradient-to-r from-red-500 to-rose-500',
            hoverBg: 'hover:shadow-red-500/40',
            text: 'text-white',
            border: 'border-transparent',
            glow: 'shadow-lg shadow-red-500/25 hover:shadow-red-500/40'
        },
        ghost: {
            bg: 'bg-transparent',
            hoverBg: 'hover:bg-white/5',
            text: 'text-white/40 hover:text-white',
            border: 'border-transparent',
            glow: ''
        }
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-7 py-3.5 text-base',
        xl: 'px-9 py-4 text-lg'
    }

    const variantStyles = variants[variant] || variants.primary
    const sizeStyles = sizes[size] || sizes.md

    return (
        <motion.button
            type={type}
            whileHover={{ scale: disabled ? 1 : 1.03 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            className={`
                relative overflow-hidden rounded-xl font-medium transition-all duration-300
                ${variantStyles.bg}
                ${variantStyles.text}
                ${variantStyles.border}
                ${variantStyles.glow}
                ${sizeStyles}
                ${fullWidth ? 'w-full' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
            onClick={onClick}
            disabled={disabled}
        >
            {/* ✅ Shimmer Effect */}
            {!disabled && variant !== 'ghost' && variant !== 'secondary' && (
                <motion.div 
                    className="absolute inset-0 -translate-x-full"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                >
                    <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                </motion.div>
            )}

            {/* ✅ Glow Effect on Hover */}
            {!disabled && (
                <motion.div 
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ opacity: 1 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </motion.div>
            )}

            {/* ✅ Content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {icon && iconPosition === 'left' && (
                    <span className="text-current">{icon}</span>
                )}
                {children}
                {icon && iconPosition === 'right' && (
                    <span className="text-current">{icon}</span>
                )}
            </span>
        </motion.button>
    )
}

export default AnimatedButton