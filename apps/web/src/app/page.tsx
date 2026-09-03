import Image from "next/image";
import { Header } from '@/components/header'
import { SSLAB } from "@/components/sslablogo";


export default function Home() {
  return (
    <div>
      <Header />

      <main className="flex-1">
        <section className="text-center max-w-5xl mx-auto py-32 px-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-magenta/[0.03] blur-[120px] rounded-full -z-10"></div>
          <h1 className="hero-title font-display text-7xl md:text-9xl font-extrabold tracking-tighter text-ink mb-8 cursor-default">
            <span className="ss-glitch " data-text="SS">
              SS
            </span>
            LAB
          </h1>
          <p className="text-lg md:text-xl font-mono text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            <span className="text-accent-cyan">&gt;</span>
            INITIATING_SESSION...
            <br></br>
            Interactive playground to build &amp; text API behavior and ORM query understanding, browser-based environment.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a href="/login" className="btn-cyber text-lg px-12 py-5">START_LEARNING.EXE</a>
            <div className="text-xs font-mono text-muted">
              <span className="text-accent-magenta">[!]</span>
              NO SETUP REQUIRED
            </div>
          </div>
        </section>


        <section id="feature" className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-4xl font-bold text-ink uppercase tracking-tighter">System Features</h2>
              <p className="text-xs font-mono text-accent-cyan tracking-[0.2em] uppercase opacity-60">Architectural Core // Modules</p>
            </div>

            <div className="text-xs font-mono text-muted border border-ink/10 px-3 py-1 rounded"> Build Stable // 0xAF32
            </div>
          </div>

          <div className="mt-6 mb-6">
            <hr className="border border-gray-800 opacity-60"></hr>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="cyber-card md:col-span-8 p-10 group/card flex flex-col justify-between min-h-[350px]">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono tracking-[0.3em] text-accent-cyan">01</span>
                  <div className="h-px w-8 bg-accent-cyan/30"></div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-display text-4xl font-bold text-ink transition-colors leading-none uppercase group-hover/card:text-accent-cyan">
                    <span>Online<br></br></span><span>Playground</span>
                  </h3>
                  <p className="text-muted leading-relaxed text-lg max-w-md">Write and API behavior and ORM query directly in your browser. Live preview of your backend logic with zero latency.</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="text-[10px] font-mono text-muted/30 tracking-[0.5em]">01001111 01001110 01001100 01001001 01001110 01000101</div>
                <div className="w-12 h-12 border border-ink/5 flex items-center justify-center opacity-20 group-hover/card:opacity-100 group-hover/card:border-accent-cyan transition-all">
                  <span className="text-accent-cyan">&#10132;</span>
                </div>
              </div>
            </div>
            <div className="cyber-card md:col-span-4 p-10 group/card ">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono tracking-[0.3em] text-accent-magenta">02</span>
                  <div className="h-px w-8 bg-accent-magenta/30"></div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-display text-2xl font-bold text-ink transition-colors leading-none uppercase group-hover/card:text-accent-magenta">
                    <span>Real-time<br></br></span><span>Schema</span>
                  </h3>
                  <p className="text-muted leading-relaxed ">Visualize your database structure instantly. Auto-generated ER-diagrams for every model definition.</p>
                </div>
              </div>
            </div>
            <div className="cyber-card md:col-span-4 p-10 group/card min-h-[350px]">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono tracking-[0.3em] text-accent-cyan">03</span>
                  <div className="h-px w-8 bg-accent-magenta/30"></div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-display text-2xl font-bold text-ink transition-colors leading-none uppercase group-hover/card:text-accent-cyan">
                    <span>AI<br></br></span><span>Grader</span>
                  </h3>
                  <p className="text-muted leading-relaxed ">LLM-powered assistant provides real-time feedback on your model architecture and performance.</p>
                </div>
              </div>
            </div>
            <div className="cyber-card md:col-span-8 p-10 group/card flex flex-col justify-between min-h-[350px]">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono tracking-[0.3em] text-accent-magenta">04</span>
                  <div className="h-px w-8 bg-accent-cyan/30"></div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-display text-4xl font-bold text-ink transition-colors leading-none uppercase group-hover/card:text-accent-magenta">
                    <span>Guided Labs</span>
                  </h3>
                  <p className="text-muted leading-relaxed text-lg max-w-md">Structured exercises designed to build your server-side skills. Follow the path from apprentice to architect.</p>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <div className="w-3 h-3 bg-accent-cyan"></div>
                <div className="w-3 h-3 bg-accent-magenta"></div>
                <div className="w-3 h-3 bg-ink/10"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto w-full px-6 py-12">
        <div className="border-t border-ink/5 pt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-mono text-muted">
          <div>
            <SSLAB size="text-xl"/>
            <p className="max-w-xs mb-4">Experimental learning platform for the next generation of server-side engineers.</p>
            <p>&copy; 2026 PROJECT_SSLAB. ALL RIGHTS RESERVED.</p>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <p className="text-ink">FACULTY OF INFORMATION TECHNOLOGY</p>
            <p>KING MONGKUT&rsquo;S INSTITUTE OF TECHNOLOGY LADKRABANG</p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-accent-cyan transition-colors">GITHUB</a>
              <a href="#" className="hover:text-accent-magenta transition-colors">DOCS</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
