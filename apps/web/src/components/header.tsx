"use client"
import { SSLAB } from "./sslablogo";
import { ThemeToggle } from "./theme-toggle";
import { LangToggle } from "./lang-toggle";
import Link from "next/link";

export function Header() {
    return (
        <header className="glass-nav sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
                <div className="flex items-center space-x-4 group shrink-0">
                    <Link href="/">
                        <SSLAB />
                    </Link>
                    <span className="hidden md:inline text-xs font-mono text-muted uppercase tracking-widest bg-ink/5 px-2 py-1 rounded">
                        IT KMITL // TERMINAL_V1
                    </span>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="hidden lg:flex items-center space-x-6">
                        <span
                            className={`text-sm text-muted hover:text-ink font-mono uppercase tracking-tight transition-colors`}
                        >
                            /Feature
                        </span>
                    </div>

                    <LangToggle />
                    <ThemeToggle />

                    <div className="user-chip flex items-center space-x-3 border border-ink/10 px-3 py-2 rounded-sm">
                        <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
                            B
                        </div>
                        <div className="hidden sm:flex flex-col">
                            <span className="text-ink font-bold text-[11px] leading-none uppercase tracking-wider">
                                K. Maneeratana
                            </span>
                            <span className="text-muted text-xs mt-1 font-mono uppercase opacity-60">
                                Student // 66070234
                            </span>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
