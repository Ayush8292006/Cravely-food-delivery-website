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
            bg: 'bg-gradient-to-r from-[#e85d04] to-[#f48c06]',
            hoverBg: 'hover:shadow-[#e85d04]/40',
            text: 'text-white',
            border: 'border-transparent',
            glow: 'shadow-lg shadow-[#e85d04]/25 hover:shadow-[#e85d04]/40'
        },
        secondary: {
            bg: 'bg-gray-100',
            hoverBg: 'hover:bg-gray-200',
            text: 'text-gray-700 hover:text-gray-900',
            border: 'border-gray-200 hover:border-gray-300',
            glow: 'hover:shadow-lg hover:shadow-gray-200/50'
        },
        outline: {
            bg: 'bg-transparent',
            hoverBg: 'hover:bg-gray-50',
            text: 'text-gray-700',
            border: 'border-gray-300 hover:border-[#e85d04]/50',
            glow: 'hover:shadow-lg hover:shadow-[#e85d04]/10'
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
            hoverBg: 'hover:bg-gray-50',
            text: 'text-gray-400 hover:text-gray-600',
            border: 'border-transparent',
            glow: ''
        },
        // ✅ New white variant for clean design
        white: {
            bg: 'bg-white',
            hoverBg: 'hover:bg-gray-50',
            text: 'text-gray-700',
            border: 'border-gray-200 hover:border-[#e85d04]/30',
            glow: 'shadow-md shadow-gray-100/50 hover:shadow-lg hover:shadow-[#e85d04]/10'
        },
        // ✅ New soft variant for subtle actions
        soft: {
            bg: 'bg-[#fef3e8]',
            hoverBg: 'hover:bg-[#fde8d4]',
            text: 'text-[#e85d04]',
            border: 'border-[#fde8d4] hover:border-[#e85d04]/30',
            glow: 'hover:shadow-lg hover:shadow-[#e85d04]/10'
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
                relative overflow-hidden rounded-xl font-medium transition-all duration-300 border
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
            {/* ✅ Shimmer Effect - Only for primary/success/danger */}
            {!disabled && (variant === 'primary' || variant === 'success' || variant === 'danger') && (
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