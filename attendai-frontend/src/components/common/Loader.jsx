export default function Loader({ label = 'Loading', full = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink400">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-line" />
        <div className="absolute inset-0 rounded-full border-2 border-signal-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-xs font-mono uppercase tracking-widest">{label}</p>
    </div>
  )

  if (full) {
    return <div className="min-h-screen flex items-center justify-center bg-paper">{content}</div>
  }
  return content
}
