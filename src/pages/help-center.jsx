import Icon from "../components/Icon.jsx"

export default function HelpCenter({ onBack }) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-3 flex items-center gap-2">
        <button onClick={onBack} className="rounded-full bg-white/80 p-2 shadow">
          <Icon name="menu" className="w-5 h-5 text-neutral-800" />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow">
            <Icon name="help" className="w-4 h-4 text-blue-700" />
            <span className="text-sm text-neutral-900">Help Center</span>
          </div>
        </div>
        <div className="w-[84px]" />
      </div>

      <div className="flex-1 bg-neutral-300 px-4 relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-20 text-sm text-neutral-700 text-center">
          Butuh bantuan? FAQ dan kontak akan ditambahkan di sini.
        </div>
      </div>
    </div>
  )
}
