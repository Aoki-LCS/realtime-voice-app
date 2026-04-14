import React from 'react';
import { motion } from 'motion/react';

interface CharacterAvatarProps {
  isSpeaking: boolean;
  isConnected: boolean;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ isSpeaking, isConnected }) => {
  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Background Glow */}
      <motion.div
        className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-20"
        animate={isSpeaking ? {
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        } : {
          scale: 1,
          opacity: 0.2,
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Main Avatar Body */}
      <motion.div
        className={`relative w-full h-full rounded-full border-4 ${
          isConnected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'
        } flex items-center justify-center overflow-hidden shadow-inner`}
        animate={isSpeaking ? {
          y: [0, -4, 0],
        } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        {/* Face Container */}
        <div className="relative w-20 h-20 flex flex-col items-center justify-center">
          {/* Eyes */}
          <div className="flex gap-6 mb-2">
            <motion.div
              className="w-3 h-3 bg-slate-700 rounded-full"
              animate={isSpeaking ? {
                scaleY: [1, 0.8, 1],
              } : {
                scaleY: [1, 1, 0.1, 1],
              }}
              transition={{
                duration: isSpeaking ? 0.2 : 4,
                repeat: Infinity,
                repeatDelay: isSpeaking ? 0 : 2
              }}
            />
            <motion.div
              className="w-3 h-3 bg-slate-700 rounded-full"
              animate={isSpeaking ? {
                scaleY: [1, 0.8, 1],
              } : {
                scaleY: [1, 1, 0.1, 1],
              }}
              transition={{
                duration: isSpeaking ? 0.2 : 4,
                repeat: Infinity,
                repeatDelay: isSpeaking ? 0 : 2
              }}
            />
          </div>

          {/* Mouth */}
          <motion.div
            className="w-8 bg-slate-700 rounded-full"
            animate={isSpeaking ? {
              height: [4, 12, 4],
              borderRadius: ["20px", "50%", "20px"],
            } : {
              height: 2,
              borderRadius: "2px",
            }}
            transition={{ duration: 0.15, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Status Indicator */}
      <motion.div
        className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white ${
          isConnected ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
        initial={false}
        animate={{ scale: isConnected ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};
