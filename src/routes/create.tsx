import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useGameStore } from '~/store/gameStore'
import type { AccommodationId } from '~/types'

export const Route = createFileRoute('/create')({
  component: CharacterCreation,
})

function CharacterCreation() {
  const navigate = useNavigate()
  const createPlayer = useGameStore((s) => s.createPlayer)
  const [name, setName] = useState('')
  const [dept, setDept] = useState('mee')
  const [accom, setAccom] = useState<AccommodationId>('on_campus')

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createPlayer({
      name: name.trim(),
      departmentId: dept,
      accommodationId: accom,
      appearance: { gender: 'neutral', skinTone: 1, hairstyleId: 'short', hairColor: 'black' }
    })
    navigate({ to: '/play' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-6">
      <form onSubmit={handleStart} className="w-full max-w-md space-y-6 rounded-2xl bg-gray-900 p-8 shadow-xl border border-gray-800">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Create Your Student</h1>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Full Name</label>
          <input required value={name} onChange={e => setName(e.target.value)} className="w-full rounded bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Olufemi Adeyemi" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Department</label>
          <select value={dept} onChange={e => setDept(e.target.value)} className="w-full rounded bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="mee">Mechanical Engineering</option>
            <option value="csc">Computer Science</option>
            <option value="saat">Agriculture (SAAT)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Accommodation</label>
          <select value={accom} onChange={e => setAccom(e.target.value as AccommodationId)} className="w-full rounded bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="on_campus">On-Campus Hostel (₦20,000)</option>
            <option value="oba_akere">Oba-Akere (₦35,000)</option>
            <option value="obanla">Obanla (₦35,000)</option>
          </select>
        </div>

        <button type="submit" className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 transition">
          Begin Journey
        </button>
      </form>
    </div>
  )
}