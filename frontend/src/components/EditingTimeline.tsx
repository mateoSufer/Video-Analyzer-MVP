'use client'

import React, { useState } from 'react'
import { Scissors, ZoomIn, Palette, Volume2, Type, Zap, Check, Circle } from 'lucide-react'
import { motion } from 'framer-motion'

interface TimelineStep {
  timestamp: string
  timestamp_seconds: number
  action_type: 'zoom' | 'cut' | 'color' | 'audio' | 'text' | 'transition'
  technical_action: string
  reason: string
}

interface EditingTimelineProps {
  timeline: TimelineStep[]
  onSeek?: (seconds: number) => void
}

const actionIcons = {
  zoom: ZoomIn,
  cut: Scissors,
  color: Palette,
  audio: Volume2,
  text: Type,
  transition: Zap
}

const actionColors = {
  zoom: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  cut: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  color: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  audio: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  text: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  transition: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' }
}

export default function EditingTimeline({ timeline, onSeek }: EditingTimelineProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  const handleTimestampClick = (seconds: number) => {
    if (onSeek) {
      onSeek(seconds)
    }
  }

  if (!timeline || timeline.length === 0) {
    return null
  }

  const progress = Math.round((completedSteps.size / timeline.length) * 100)

  return (
    <div className="w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-[#7C4DFF]/5 to-transparent">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#7C4DFF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7C4DFF]/20">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#111827] tracking-tight uppercase">Guía de Montaje</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Receta técnica segundo a segundo</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-[#7C4DFF]">{progress}%</div>
            <div className="text-[10px] text-gray-400 font-black uppercase">Completado</div>
          </div>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-[#7C4DFF]"
          />
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="p-8 space-y-6">
        {timeline.map((step, index) => {
          const Icon = actionIcons[step.action_type] || Zap
          const colors = actionColors[step.action_type] || actionColors.transition
          const isCompleted = completedSteps.has(index)

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`relative flex gap-6 group ${isCompleted ? 'opacity-60' : ''}`}
            >
              {/* Timeline connector */}
              {index < timeline.length - 1 && (
                <div className="absolute left-[22px] top-[52px] w-0.5 h-full bg-gradient-to-b from-gray-200 to-transparent" />
              )}

              {/* Checkbox */}
              <div className="flex-shrink-0 mt-1 z-10">
                <button
                  onClick={() => toggleStep(index)}
                  className={`w-11 h-11 rounded-2xl border-2 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'bg-white border-gray-200 hover:border-[#7C4DFF]'
                  } flex items-center justify-center`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </button>
              </div>

              {/* Card with glassmorphism */}
              <div
                className={`flex-1 bg-gradient-to-br from-white via-white to-gray-50/30 backdrop-blur-sm border ${colors.border} rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer ${
                  isCompleted ? 'line-through' : ''
                }`}
                onClick={() => handleTimestampClick(step.timestamp_seconds)}
              >
                {/* Timestamp Badge + Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTimestampClick(step.timestamp_seconds)
                      }}
                      className="px-3 py-1.5 bg-gray-900 text-white font-mono text-sm font-bold rounded-lg hover:bg-[#7C4DFF] transition-colors shadow-sm"
                    >
                      {step.timestamp}
                    </button>
                  </div>
                  <span className={`text-[10px] font-bold ${colors.text} uppercase tracking-wider px-2 py-1 ${colors.bg} rounded-md`}>
                    {step.action_type}
                  </span>
                </div>

                {/* Technical Action */}
                <h4 className="text-base font-black text-[#111827] leading-tight mb-2">
                  {step.technical_action}
                </h4>

                {/* Reason */}
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  "{step.reason}"
                </p>

                {/* Hover indicator */}
                <div className="mt-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  ↗ Click para saltar al segundo {step.timestamp_seconds}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Footer tip */}
      <div className="px-8 py-6 border-t border-gray-50 bg-gradient-to-r from-[#7C4DFF]/2 to-transparent">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Scissors className="w-4 h-4 text-[#7C4DFF]" />
          <p className="font-medium">
            Usa estos pasos en <span className="font-bold text-[#7C4DFF]">CapCut, Premiere o cualquier editor</span>
          </p>
        </div>
      </div>
    </div>
  )
}
