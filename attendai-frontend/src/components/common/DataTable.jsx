import Icon from './Icon'

/**
 * Generic data table.
 * columns: [{ key, label, render? }]
 * rows: array of objects
 */
export default function DataTable({ columns, rows, emptyLabel = 'No records found', actions }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="card py-14 flex flex-col items-center justify-center text-center">
        <div className="reticle p-3 rounded bg-signal-50 text-signal-600 mb-3">
          <Icon name="search" size={20} />
        </div>
        <p className="text-sm text-ink600">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-paper/60">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-ink400">
                {col.label}
              </th>
            ))}
            {actions && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="border-b border-line last:border-0 hover:bg-paper/50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-ink900">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
