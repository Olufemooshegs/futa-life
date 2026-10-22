import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useGameStore } from '~/store/gameStore'
import { StatsBar } from '~/components/StatsBar'
import { EventDialog } from '~/components/EventDialog'
import locationsData from '~/data/locations.json'
import type { Location } from '~/types'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

export const Route = createFileRoute('/play')({
  ssr: false, // ← Add this line
  component: GameLoop,
})

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const Route = createFileRoute('/play')({
  component: GameLoop,
})

const LOCATIONS = locationsData as (Location & { coords: [number, number] })[]
const LEVELS = [{label: "100L - 1st Sem"}, /* ... other levels ... */]

// Center of FUTA Campus
const CAMPUS_CENTER: [number, number] = [7.29308, 5.14967]

function GameLoop() {
  const navigate = useNavigate()
  const { player, currentSemesterIndex, currentLocationId, moveTo, getAvailableActions, performAction, graduated, skipSemester } = useGameStore()

  useEffect(() => {
    if (!player) navigate({ to: '/' })
    if (graduated) navigate({ to: '/graduation' })
  }, [player, graduated, navigate])

  if (!player) return null

  const actions = getAvailableActions()
  const currentLoc = LOCATIONS.find(l => l.id === currentLocationId)
  const semLabel = LEVELS[currentSemesterIndex]?.label || "Graduated"

  return (
    <div className="flex h-screen flex-col bg-[#1a1e24] text-white font-sans overflow-hidden">
      
      {/* Top Header - Keep this */}
      <header className="flex items-center justify-between bg-gray-900 px-6 py-3 border-b border-gray-800 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <div className="font-extrabold text-xl tracking-tight text-white">FUTA<span className="text-emerald-500">Life</span></div>
          <div className="text-xs font-bold bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">{semLabel}</div>
        </div>
        <div className="text-sm font-mono text-emerald-400 font-bold bg-gray-950 px-4 py-1.5 rounded-lg border border-gray-800">
          ₦{player.money.toLocaleString()}
        </div>
      </header>

      <StatsBar />
      <EventDialog />

      {/* THE MAP AREA - Replaced */}
      <div className="flex-1 relative">
        <MapContainer 
          center={CAMPUS_CENTER} 
          zoom={16} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          scrollWheelZoom={true}
        >
          {/* OpenStreetMap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render Location Markers */}
          {LOCATIONS.map(loc => (
            <Marker 
              key={loc.id} 
              position={loc.coords}
              eventHandlers={{
                click: () => moveTo(loc.id),
              }}
            >
              <Popup>
                <div className="text-center">
                  <span className="text-2xl">{loc.icon}</span>
                  <h3 className="font-bold text-lg">{loc.name}</h3>
                  <p className="text-sm text-gray-600">{loc.description}</p>
                  <button 
                    onClick={() => moveTo(loc.id)}
                    className="mt-2 bg-emerald-600 text-white px-3 py-1 rounded text-sm font-bold"
                  >
                    Move Here
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* BOTTOM ACTION PANEL - Keep this */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300">
        <div className="max-w-4xl mx-auto p-6">
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>{currentLoc?.icon}</span> {currentLoc?.name}
              </h2>
              <p className="text-sm text-gray-400">{currentLoc?.description}</p>
            </div>
            <button onClick={skipSemester} className="text-[10px] text-gray-600 hover:text-gray-400">[Dev] Skip</button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {actions.map(action => (
              <button
                key={action.id}
                onClick={() => performAction(action.id)}
                className="flex-shrink-0 w-64 text-left p-4 rounded-xl bg-gray-800 border-2 border-gray-700 hover:border-emerald-500 hover:bg-gray-800/80 transition-all group"
              >
                <div className="font-bold text-emerald-400 mb-1 group-hover:text-emerald-300">{action.label}</div>
                <div className="text-xs text-gray-400 line-clamp-2">{action.description}</div>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-900 inline-block px-2 py-1 rounded">
                  {action.timeCost} action
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>

    </div>
  )
}