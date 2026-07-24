import React from 'react'
import { FaUtensils, FaUtensilSpoon } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function Logo() {
    const navigate = useNavigate()

    return (
        <motion.div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* ✅ Logo Icon - Spoon + Fork */}
            <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/25 group-hover:scale-110 transition-all duration-300 group-hover:shadow-[#ff2d55]/40 group-hover:rotate-[-5deg]">
                    <FaUtensilSpoon className="text-white text-base sm:text-lg transform -rotate-12" />
                    <FaUtensils className="text-white text-sm sm:text-base transform rotate-12 ml-[-3px]" />
                </div>
                {/* ✅ Star Badge */}
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ffd93d] flex items-center justify-center animate-pulse">
                    <span className="text-[7px] font-bold text-[#0a0a0f]">★</span>
                </div>
                {/* ✅ Green Dot */}
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0a0a0f] animate-pulse" />
            </div>

            {/* ✅ Brand Name - Cravely */}
            <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-none group-hover:text-gradient transition-all duration-300">
                    Cravely
                </h1>
                <div className="flex items-center gap-1.5">
                    <p className="text-[8px] text-white/30 tracking-[0.2em] uppercase group-hover:text-white/50 transition-all duration-300">
                        🍽️ Food Delivery
                    </p>
                    <MdVerified size={9} className="text-blue-400" />
                </div>
            </div>
        </motion.div>
    )
}

export default Logo