'use client'

import { useEffect, useState } from 'react'
import { calculateTimeRemaining } from '@/lib/utils'
import { Clock, AlertTriangle } from 'lucide-react'

interface CountdownTimerProps {
  expiresAt: Date
  onExpired?: () => void
}

export function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [timeInfo, setTimeInfo] = useState(() => calculateTimeRemaining(expiresAt))

  useEffect(() => {
    const updateTimer = () => {
      const newTimeInfo = calculateTimeRemaining(expiresAt)
      setTimeInfo(newTimeInfo)
      
      if (newTimeInfo.isExpired && onExpired) {
        onExpired()
      }
    }

    // 立即更新一次
    updateTimer()

    // 根据剩余时间设置更新频率
    let interval: NodeJS.Timeout
    
    if (timeInfo.totalMinutes > 60) {
      // 超过1小时，每分钟更新一次
      interval = setInterval(updateTimer, 60 * 1000)
    } else if (timeInfo.totalMinutes > 5) {
      // 5分钟到1小时，每30秒更新一次
      interval = setInterval(updateTimer, 30 * 1000)
    } else if (!timeInfo.isExpired) {
      // 最后5分钟，每10秒更新一次
      interval = setInterval(updateTimer, 10 * 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [expiresAt, timeInfo.totalMinutes, timeInfo.isExpired, onExpired])

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