import Icon from "./Icon.jsx"

export default function MenuItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-md px-2 py-3 text-left hover:bg-white/60 active:bg-white/80 transition"
    >
      <Icon name={icon} className="w-5 h-5 text-neutral-800" />
      <span className="text-sm text-neutral-800">{label}</span>
    </button>
  )
}
