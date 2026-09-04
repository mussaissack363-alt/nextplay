import Link from "next/link";

/** The NextPlay mark: a play triangle + "next" bar, on a black tile. */
export function LogoMark({
  className = "h-9 w-9",
}: {
  className?: string;
}) {
  return (
    <span
      className={`grid place-items-center rounded-xl bg-stone-950 shadow-md shadow-stone-900/10 transition-transform group-hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[56%] w-[56%]"
        aria-hidden
        focusable="false"
      >
        {/* play triangle — orange */}
        <path d="M3.4 4.6 17 12 3.4 19.4Z" fill="#ea580c" />
        {/* next bar — warm white */}
        <rect x="18.2" y="4.6" width="2.6" height="14.8" rx="1.3" fill="#fafaf9" />
      </svg>
    </span>
  );
}

/** The full lockup: mark + "NextPlay" wordmark with orange accent. */
export default function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <LogoMark />
      <span className="text-xl font-bold tracking-tight text-stone-950">
        Next<span className="text-orange-600">Play</span>
      </span>
    </Link>
  );
}