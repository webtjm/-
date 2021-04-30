const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
const relativeTime = require('dayjs/plugin/relativeTime')
const duration = require('dayjs/plugin/duration')
dayjs.extend(customParseFormat).extend(relativeTime).extend(duration)
export function dateParse (timestamp) {
  const date = dayjs(timestamp)
  return date.format('YYYY-MM-DD HH:mm:ss').toString()
}

export function daysToNow (timestamp) {
  const date = dayjs(timestamp)
  const now = dayjs()
  const diff = now.diff(date, 'day')
  return `${diff} day${diff > 1 ? 's' : ''}`
}

export function timeDuration (timestamp) {
  const date = dayjs(timestamp)
  const now = dayjs()
  const diff = date.diff(now, 'millisecond')
  const d = dayjs.duration(diff).humanize(true)
  return d
}
