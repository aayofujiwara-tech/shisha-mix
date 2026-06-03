import { useState } from 'react'
import type { DiaryEntry } from '../types'
import './SessionCalendar.css'

const WEEK_DAYS = ['月', '火', '水', '木', '金', '土', '日']

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function buildCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const startDow = (firstDay.getDay() + 6) % 7 // Mon=0, Sun=6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: Date[] = []
  for (let i = startDow; i > 0; i--) days.push(new Date(year, month, 1 - i))
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))
  let next = 1
  while (days.length < 42) days.push(new Date(year, month + 1, next++))
  return days
}

interface Props {
  entries: DiaryEntry[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
  onMonthChange?: (year: number, month: number) => void
}

export default function SessionCalendar({ entries, selectedDate, onSelectDate, onMonthChange }: Props) {
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())

  const entryDates = new Set(entries.map((e) => e.date))
  const days = buildCalendarDays(calYear, calMonth)
  const todayStr = toDateStr(today)

  const prevMonth = () => {
    if (calMonth === 0) {
      const newYear = calYear - 1
      setCalYear(newYear)
      setCalMonth(11)
      onMonthChange?.(newYear, 11)
    } else {
      const newMonth = calMonth - 1
      setCalMonth(newMonth)
      onMonthChange?.(calYear, newMonth)
    }
  }
  const nextMonth = () => {
    if (calMonth === 11) {
      const newYear = calYear + 1
      setCalYear(newYear)
      setCalMonth(0)
      onMonthChange?.(newYear, 0)
    } else {
      const newMonth = calMonth + 1
      setCalMonth(newMonth)
      onMonthChange?.(calYear, newMonth)
    }
  }

  const handleDayClick = (d: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return
    const str = toDateStr(d)
    onSelectDate(selectedDate === str ? null : str)
  }

  return (
    <div className="sc-wrap">
      <div className="sc-nav">
        <button className="sc-nav-btn" onClick={prevMonth}>‹</button>
        <span className="sc-month-label">{calYear}年{calMonth + 1}月</span>
        <button className="sc-nav-btn" onClick={nextMonth}>›</button>
      </div>

      <div className="sc-grid">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="sc-dow">{d}</div>
        ))}
        {days.map((d, i) => {
          const isCurrentMonth = d.getMonth() === calMonth
          const str = toDateStr(d)
          const hasEntry = entryDates.has(str)
          const isToday = str === todayStr
          const isSelected = str === selectedDate
          return (
            <button
              key={i}
              className={[
                'sc-day',
                isCurrentMonth ? '' : 'sc-day--other',
                isToday ? 'sc-day--today' : '',
                isSelected ? 'sc-day--selected' : '',
              ].join(' ')}
              onClick={() => handleDayClick(d, isCurrentMonth)}
              disabled={!isCurrentMonth}
            >
              <span className="sc-day-num">{d.getDate()}</span>
              {hasEntry && isCurrentMonth && <span className="sc-dot" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
