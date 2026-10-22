import { useGameStore } from '~/store/gameStore'

export function EventDialog() {
  const { getCurrentEvent, resolveEvent } = useGameStore()
  const event = getCurrentEvent()

  if (!event) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">{event.title}</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-300 leading-relaxed mb-6">{event.description}</p>
          <div className="flex flex-col gap-3">
            {event.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => resolveEvent(idx)}
                className="w-full text-left px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
              >
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}