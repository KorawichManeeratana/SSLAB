"use client"
export function SSLAB({ size = "text-2xl" }: { size?: string }) {
    return (
        <div className="flex items-center space-x-1">
            <div className={`ss-glitch ${size}`} data-text="SS">
                SS
            </div>
            <div className={`font-display ${size} font-bold tracking-tighter text-ink`}>
                LAB
            </div>
        </div>
    );
}