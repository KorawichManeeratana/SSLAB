"use client";

import { useState } from "react";

export function LangToggle() {
    const [lang, setLang] = useState("th");

    return (
        <div className="flex items-center space-x-1 bg-ink/5 p-1 rounded border border-ink/5 font-mono text-xs tracking-tighter">
            {(["EN", "TH"] as const).map((option, i) => {
                const value = option.toLowerCase() as "en" | "th";
                return (
                    <span key={option} className="flex items-center">
                        {i > 0 && <span className="text-muted/30 mr-1">/</span>}
                        <button
                            type="button"
                            onClick={() => setLang(value)}
                            className={`px-2 py-0.5 rounded transition-all ${lang === value
                                ? "bg-accent-cyan text-black font-bold"
                                : "text-muted hover:text-ink"
                                }`}
                        >
                            {option}
                        </button>
                    </span>
                );
            })}
        </div>
    );
}
