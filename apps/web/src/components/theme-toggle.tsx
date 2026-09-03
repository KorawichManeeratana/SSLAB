import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const isLight = mounted && theme === 'light';

    return (
        <button
            type="button"
            onClick={() => setTheme(isLight ? "dark" : "light")}
            aria-label="Toggle color theme"
            className="flex items-center space-x-1 bg-ink/5 p-1 rounded border border-ink/5 font-mono text-xs tracking-tighter"
        >
            <span
                className={`px-2 py-0.5 rounded transition-all ${!isLight ? "bg-accent-cyan text-black font-bold" : "text-muted"
                    }`}
            >
                DARK
            </span>
            <span className="text-muted/30">/</span>
            <span
                className={`px-2 py-0.5 rounded transition-all ${isLight ? "bg-accent-cyan text-black font-bold" : "text-muted"
                    }`}
            >
                LIGHT
            </span>
        </button>
    )
}