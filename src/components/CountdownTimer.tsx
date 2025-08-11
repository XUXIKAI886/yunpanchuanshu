'use client'

import { useEffect, useState } from 'react'
import { calculateTimeRemaining } from '@/lib/utils'
import { Clock, AlertTriangle } from 'lucide-react'

interface CountdownTimerProps {
  expiresAt: Date
  onExpired?: () => void
}

export function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [timeInfo, setTimeInfo] = useState(() => calculateTimeRemaining(new Date(expiresAt)))

  useEffect(() => {
    const expireDate = new Date(expiresAt)
    
    const updateTimer = () => {
      const newTimeInfo = calculateTimeRemaining(expireDate)
      setTimeInfo(newTimeInfo)
      
      if (newTimeInfo.isExpired && onExpired) {
        onExpired()
      }
    }

    // 立即更新一次
    updateTimer()

    // 设置定时更新，根据情况选择频率
    const currentTimeInfo = calculateTimeRemaining(expireDate)
    let intervalTime = 60 * 1000 // 默认1分钟

    if (currentTimeInfo.totalMinutes <= 5 && !currentTimeInfo.isExpired) {
      intervalTime = 10 * 1000 // 最后5分钟，每10秒
    } else if (currentTimeInfo.totalMinutes <= 60) {
      intervalTime = 30 * 1000 // 1小时内，每30秒
    }

    const interval = setInterval(updateTimer, intervalTime)

    return () => clearInterval(interval)
  }, [expiresAt, onExpired])

  const getColorClass = () => {
    if (timeInfo.isExpired) {
      return 'text-red-600 bg-red-50'
    } else if (timeInfo.totalMinutes < 60) {
      return 'text-orange-600 bg-orange-50'
    } else if (timeInfo.totalMinutes < 360) { // 6小时
      return 'text-yellow-600 bg-yellow-50'
    } else {
      return 'text-green-600 bg-green-50'
    }
  }

  const getIcon = () => {
    if (timeInfo.isExpired) {
      return <AlertTriangle className="h-3 w-3" />
    } else {
      return <Clock className="h-3 w-3" />
    }
  }

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getColorClass()}`}>
      {getIcon()}
      <span>{timeInfo.timeRemaining}</span>
    </div>
  )
}