import { masteryColorClass } from '../goalUiUtils'

export const MasteryBar = ({ value }: { value: number }) => {
  const width = `${Math.max(0, Math.min(1, value)) * 100}%`
  const barClass = `h-full rounded-full ${masteryColorClass(value)}`

  return (
    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
      <div className={barClass} style={{ width }} />
    </div>
  )
}
