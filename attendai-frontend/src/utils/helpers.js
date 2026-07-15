export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPercent(value, digits = 1) {
  return `${Number(value).toFixed(digits)}%`
}

export function initials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function statusBadgeClass(status) {
  const map = {
    present: 'badge-present',
    late: 'badge-late',
    absent: 'badge-absent',
    spoof_detected: 'badge-spoof',
  }
  return map[status] || 'badge bg-slate-100 text-ink600'
}

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
