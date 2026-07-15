import Icon from './Icon'

export default function StatCard({ eyebrow, value, delta, deltaLabel, icon, tone = 'signal' }) {
  const toneClasses = {
    signal: 'text-signal-600 bg-signal-50',
    present: 'text-present bg-emerald-50',
    late: 'text-late bg-amber-50',
    absent: 'text-absent bg-rose-50',
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-eyebrow">{eyebrow}</p>
          <p className="mt-2 text-3xl font-display font-semibold text-ink900">{value}</p>
        </div>
        {icon && (
          <div className={`reticle p-2.5 rounded ${toneClasses[tone]}`}>
            <Icon name={icon} size={20} />
          </div>
        )}
      </div>
      {delta !== undefined && (
        <p className="mt-3 text-xs text-ink600">
          <span className={delta >= 0 ? 'text-present font-medium' : 'text-absent font-medium'}>
            {delta >= 0 ? '+' : ''}
            {delta}%
          </span>{' '}
          {deltaLabel}
        </p>
      )}
    </div>
  )
}
