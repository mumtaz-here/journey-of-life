export default function Icon({ name, className = "w-5 h-5", stroke = 2 }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    viewBox: "0 0 24 24",
  }

  switch (name) {
    case "sprout":
      return (
        <svg {...common}>
          <path d="M12 21V10" />
          <path d="M5 10c3 0 5-2 5-5-3 0-5 2-5 5Z" />
          <path d="M19 10c-3 0-5-2-5-5 3 0 5 2 5 5Z" />
        </svg>
      )
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" />
          <path d="M6 3v16" />
        </svg>
      )
    case "chart":
      return (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <path d="M7 15V9" />
          <path d="M12 21V7" />
          <path d="M17 21v-8" />
        </svg>
      )
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10Z" />
          <circle cx="12" cy="11" r="3" />
        </svg>
      )
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c2.5-4 13.5-4 16 0" />
        </svg>
      )
    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.5 9a3.5 3.5 0 1 1 4.2 3.4c-.9.3-1.2.8-1.2 1.6V15" />
          <circle cx="12" cy="18" r=".5" />
        </svg>
      )
    case "menu":
      return (
        <svg {...common}>
          <path d="M3 6h18M3 12h14M3 18h10" />
        </svg>
      )
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      )
    case "more":
      return (
        <svg {...common}>
          <circle cx="6" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="18" cy="12" r="1.5" />
        </svg>
      )
    default:
      return null
  }
}
