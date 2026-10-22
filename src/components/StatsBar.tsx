import { useGameStore } from '~/store/gameStore'

export function StatsBar() {
  const { player, getCurrentGPA, getCGPA } = useGameStore()
  if (!player) return null

  const statBar = (label: string, value: number, color: string, max = 100) => (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-400">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-900 border-b border-gray-800">
      <div className="flex flex-col justify-center">
        <span className="text-sm text-gray-400">Money</span>
        <span className="text-xl font-bold text-green-400">₦{player.money.toLocaleString()}</span>
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-sm text-gray-400">Academic</span>
        <span className="text-sm font-medium">GPA: {getCurrentGPA().toFixed(2)} | CGPA: {getCGPA().toFixed(2)}</span>
      </div>
      <div className="col-span-2 grid grid-cols-2 gap-2">
        {statBar('Energy', player.stats.energy, 'bg-yellow-500')}
        {statBar('Hunger', player.stats.hunger, 'bg-orange-500')}
        {statBar('Stress', player.stats.stress, 'bg-red-500')}
        {statBar('Social', player.stats.social, 'bg-blue-500')}
      </div>
    </div>
  )
}