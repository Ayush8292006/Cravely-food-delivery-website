import React from 'react'

function GlassCard({ children, className = '', hover = true }) {
    return (
        <div className={`glass-card ${hover ? 'hover:scale-[1.02] hover:border-white/20' : ''} ${className}`}>
            {children}
        </div>
    )
}

export default GlassCard