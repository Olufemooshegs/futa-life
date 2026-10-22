import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useGameStore } from '~/store/gameStore'

export const Route = createFileRoute('/graduation')({
  component: Graduation,
})

function Graduation() {
  const navigate = useNavigate()
  const { player, getCGPA, getOutcome, resetGame } = useGameStore()

  useEffect(() => {
    if (!player) navigate({ to: '/' })
  }, [player, navigate])

  if (!player) return null

  const cgpa = getCGPA()
  const outcome = getOutcome()

  const outcomeLabels: Record<string, string> = {
    academic_weapon: "Academic Weapon",
    techie: "Techie",
    entrepreneur: "Entrepreneur",
    hustler: "Hustler",
    campus_celebrity: "Campus Celebrity",
    social_butterfly: "Social Butterfly",
    balanced: "Balanced Student",
    somehow_graduated: "Somehow Graduated",
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-6 text-center">
      <h1 className="text-5xl font-extrabold text-white mb-2 font-serif">Graduation Day!</h1>
      <p className="text-xl text-gray-400 mb-12">Congratulations, {player.name}.</p>

      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-8 shadow-2xl">
        <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-1">Final Outcome</div>
        <div className="text-3xl font-bold text-white mb-6">{outcomeLabels[outcome]}</div>
        
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
            <div className="text-xs text-gray-500 uppercase">CGPA</div>
            <div className="text-xl font-mono text-green-400">{cgpa.toFixed(2)} / 5.00</div>
          </div>
          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
            <div className="text-xs text-gray-500 uppercase">Final Money</div>
            <div className="text-xl font-mono text-green-400">₦{player.money.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => { resetGame(); navigate({ to: '/' }) }}
        className="mt-12 rounded-lg bg-white px-8 py-3 font-semibold text-black hover:bg-gray-200 transition"
      >
        Play Again
      </button>
    </div>
  )
}