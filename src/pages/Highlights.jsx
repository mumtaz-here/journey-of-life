import Icon from "../components/Icon.jsx"

export default function Highlights({ onBack }) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-3 flex items-center gap-2">
        <button onClick={onBack} className="rounded-full bg-white/80 p-2 shadow">
          <Icon name="menu" className="w-5 h-5 text-neutral-800" />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow">
            <Icon name="pin" className="w-4 h-4 text-rose-700" />
            <span className="text-sm text-neutral-900">Highlights</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full bg-white/80 p-2 shadow">
            <Icon name="search" className="w-5 h-5 text-neutral-800" />
          </button>
          <button className="rounded-full bg-white/80 p-2 shadow">
            <Icon name="more" className="w-5 h-5 text-neutral-800" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-neutral-300 px-4 relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-20 text-sm text-neutral-700">
          Sorotan/penanda akan muncul di sini.
        </div>
      </div>
    </div>
  )
}
