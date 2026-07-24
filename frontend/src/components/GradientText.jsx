import React from 'react'

function GradientText({ children, className = '', as: Tag = 'span' }) {
    return (
        <Tag className={`text-gradient ${className}`}>
            {children}
        </Tag>
    )
}

export default GradientText