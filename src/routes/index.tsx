import { createFileRoute, Link } from '@tanstack/react-router'
import { useGameStore } from '~/store/gameStore'

export const Route = createFileRoute('/')({
  component: MainMenu,
})

function MainMenu() {
  const { player, resetGame } = useGameStore()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-6">
      <div className="max-w-md text-center">
        <h1 className="text-5xl font-extrabold text-white mb-2 font-serif">FUTA Life</h1>
        <p className="text-gray-400 mb-8">Live the Akure student experience. From 100L to Graduation.</p>

        <div className="flex flex-col gap-4">
          {player ? (
            <>
              <Link to="/play" className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 transition">
                Continue Game ({player.name})
              </Link>
              <button onClick={() => { if(confirm("Start over?")) resetGame() }} className="text-sm text-gray-500 hover:text-white mt-4">
                Start New Game
              </button>
            </>
          ) : (
            <Link to="/create" className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 transition">
              New Game
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}