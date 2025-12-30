'use client'

import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Award, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface Analysis {
  video_id: string
  date: string
  retention_score: number
  final_status: string
}

interface EvolutionCardProps {
  analyses?: Analysis[]
  aiInsight?: string
  bestCategory?: {
    category: string
    label: string
    improvement: number
  } | null
  totalVideos?: number
}

export default function EvolutionCard({
  analyses = [],
  aiInsight = "Sube más videos para empezar a ver tu gráfica de evolución.",
  bestCategory = null,
  totalVideos = 0
}: EvolutionCardProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Transformar datos para el gráfico
    if (analyses && analyses.length > 0) {
      const data = analyses.map((a, idx) => ({
        name: `V${idx + 1}`,
        score: a.retention_score || 0,
        date: new Date(a.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        fullDate: a.date
      }))
      setChartData(data)
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [analyses])

  // Si menos de 2 videos
  if (analyses.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C4DFF]/10 to-[#9b6dff]/10 flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-[#7C4DFF]" />
        </div>
        <h3 className="text-2xl font-black text-[#111827] uppercase tracking-tight">Tu Gráfica de Evolución</h3>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          Sube más videos para empezar a ver tu gráfica de evolución y recibir insights personalizados.
        </p>
        <div className="mt-4 px-6 py-2 bg-[#7C4DFF]/10 rounded-full text-[10px] font-bold text-[#7C4DFF] uppercase tracking-wider">
          {totalVideos || 0} video{totalVideos === 1 ? '' : 's'} analizado{totalVideos === 1 ? '' : 's'}
        </div>
      </motion.div>
    )
  }

  const avgScore = Math.round(analyses.reduce((sum, a) => sum + (a.retention_score || 0), 0) / analyses.length)
  const maxScore = Math.max(...analyses.map(a => a.retention_score || 0))
  const minScore = Math.min(...analyses.map(a => a.retention_score || 0))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-[#7C4DFF]/5 to-transparent">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C4DFF] to-[#9b6dff] flex items-center justify-center shadow-lg shadow-[#7C4DFF]/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#111827] uppercase tracking-tight">Tu Evolución</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Progreso en los últimos análisis</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-[#7C4DFF]">{avgScore}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Promedio</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-white/60 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Máximo</div>
            <div className="text-2xl font-black text-emerald-600">{maxScore}</div>
          </div>
          <div className="p-3 bg-white/60 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Actual</div>
            <div className="text-2xl font-black text-[#7C4DFF]">{analyses[analyses.length - 1]?.retention_score || 0}</div>
          </div>
          <div className="p-3 bg-white/60 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Mínimo</div>
            <div className="text-2xl font-black text-orange-600">{minScore}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-8 bg-white">
        {!loading && chartData.length > 0 ? (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#999"
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <YAxis
                  stroke="#999"
                  domain={[0, 100]}
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontWeight: 'bold'
                  }}
                  formatter={(value) => [`${value}`, 'Retention Score']}
                  labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#7C4DFF"
                  strokeWidth={3}
                  dot={{ fill: '#7C4DFF', r: 5 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Cargando gráfica...</p>
          </div>
        )}
      </div>

      {/* AI Insight + Best Category */}
      <div className="px-8 py-6 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-r from-[#7C4DFF]/2 to-transparent">
        {/* AI Insight */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7C4DFF]/20 flex-shrink-0 flex items-center justify-center mt-0.5">
            <Sparkles className="w-5 h-5 text-[#7C4DFF]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#7C4DFF] uppercase tracking-wider mb-1">AI Insight</p>
            <p className="text-sm text-gray-700 font-medium leading-relaxed italic">"{aiInsight}"</p>
          </div>
        </div>

        {/* Best Category */}
        {bestCategory ? (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex-shrink-0 flex items-center justify-center mt-0.5">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Categoría Top</p>
              <p className="text-sm text-gray-700 font-bold">{bestCategory.label}</p>
              <p className="text-xs text-gray-500 mt-1">Mejora: +{bestCategory.improvement}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-center text-gray-400 text-sm">
            <p>Sin datos suficientes para categoría</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
