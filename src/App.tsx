import React, { useState, useEffect } from "react";
import { Tone, type PlatformDraft, ImageSize, type AspectRatio } from "./types";
import {
  generateDrafts,
  generatePlatformImage,
  checkAuth,
  signIn,
} from "./services/puter";
import { generateDraftsGemini } from "./services/gemini";
import PlatformCard from "./components/PlatformCard";
import AuthModal from "./components/AuthModal";
import ApiKeyModal from "./components/ApiKeyModal";
import WarningBanner from "./components/WarningBanner";

type AuthMode = "checking" | "puter" | "gemini" | "guest";

const App: React.FC = () => {
  const [idea, setIdea] = useState("");
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [isLoading, setIsLoading] = useState(false);
  const [drafts, setDrafts] = useState<PlatformDraft[]>([]);
  const [authMode, setAuthMode] = useState<AuthMode>("checking");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [sessionUsage, setSessionUsage] = useState(0);

  useEffect(() => {
    const initAuth = async () => {
      const isSignedIn = await checkAuth();
      setAuthMode(isSignedIn ? "puter" : "guest");
    };
    initAuth();
  }, []);

  useEffect(() => {
    const canvas = document.getElementById("bg-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    const mouse = { x: 0, y: 0, radius: 250 };
    const glow = { x: 0, y: 0, targetX: 0, targetY: 0 };

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      opacity: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 1.0 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = Math.random() * 25 + 2;
        this.opacity = Math.random() * 0.3 + 0.05;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(16, 185, 129, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = mouse.radius;
        const force = (maxDistance - distance) / maxDistance;
        const directionX = forceDirectionX * force * this.density;
        const directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
          this.x -= directionX;
          this.y -= directionY;
        } else {
          if (this.x !== this.baseX) {
            const dx = this.x - this.baseX;
            this.x -= dx / 25;
          }
          if (this.y !== this.baseY) {
            const dy = this.y - this.baseY;
            this.y -= dy / 25;
          }
        }
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 12000;
      for (let i = 0; i < numberOfParticles; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
      }
    };

    const connect = () => {
      if (!ctx) return;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 110) {
            const opacityValue = 1 - distance / 110;
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacityValue * 0.04})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      glow.x += (glow.targetX - glow.x) * 0.04;
      glow.y += (glow.targetY - glow.y) * 0.04;

      const gradient = ctx.createRadialGradient(
        glow.x,
        glow.y,
        0,
        glow.x,
        glow.y,
        700,
      );
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.025)");
      gradient.addColorStop(1, "rgba(5, 8, 10, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
        particles[i].update();
      }
      connect();
      requestAnimationFrame(animate);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
      glow.targetX = event.x;
      glow.targetY = event.y;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", init);

    init();
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", init);
    };
  }, []);

  const handleLogin = async () => {
    await signIn();
    // Puter sign in usually reloads or handles auth, but let's reconfirm
    const isSignedIn = await checkAuth();
    if (isSignedIn) setAuthMode("puter");
  };

  const handleFallback = () => {
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) {
      setAuthMode("gemini");
    } else {
      setAuthMode("gemini");
      setShowApiKeyModal(true);
    }
  };

  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem("gemini_api_key", key);
    setShowApiKeyModal(false);
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsLoading(true);
    try {
      let result;
      if (authMode === "puter") {
        result = await generateDrafts(idea, tone);
      } else if (authMode === "gemini") {
        const key = localStorage.getItem("gemini_api_key");
        if (!key) {
          setShowApiKeyModal(true);
          setIsLoading(false);
          return;
        }
        result = await generateDraftsGemini(idea, tone, key);
        setSessionUsage((prev) => prev + 1);
      }

      if (result) {
        setDrafts(
          result.drafts.map((d) => ({ ...d, isGeneratingImage: false })),
        );
      }
    } catch (error) {
      console.error(error);
      let message = "Failed to generate drafts. Please try again.";
      if (error instanceof Error) {
        message += `\nError: ${error.message}`;
      }
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (
    platform: string,
    AspectRatio: AspectRatio,
    size: ImageSize,
  ) => {
    if (authMode === "gemini") {
      alert("Image generation is disabled in free tier mode.");
      return;
    }

    const draftIndex = drafts.findIndex((d) => d.platform === platform);
    if (draftIndex === -1) return;

    setDrafts((prev) =>
      prev.map((d, i) =>
        i === draftIndex ? { ...d, isGeneratingImage: true } : d,
      ),
    );

    try {
      const imageUrl = await generatePlatformImage(
        drafts[draftIndex].content,
        AspectRatio,
        size,
      );

      setDrafts((prev) =>
        prev.map((d, i) =>
          i === draftIndex ? { ...d, imageUrl, isGeneratingImage: false } : d,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Image Generation Failed.");
      setDrafts((prev) =>
        prev.map((d, i) =>
          i === draftIndex ? { ...d, isGeneratingImage: false } : d,
        ),
      );
    }
  };

  const handleEditContent = (platform: string, newContent: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.platform === platform ? { ...d, content: newContent } : d,
      ),
    );
  };

  if (authMode === "checking") return null;

  return (
    <div className="min-h-screen bg-transparent text-slate-300 selection:bg-emerald-500/20 relative z-10">
      {authMode === "guest" && (
        <AuthModal onLogin={handleLogin} onFallback={handleFallback} />
      )}

      {authMode === "gemini" && showApiKeyModal && (
        <ApiKeyModal onSubmit={handleApiKeySubmit} />
      )}

      {authMode === "gemini" && <WarningBanner />}

      {authMode === "gemini" && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-[#0a0f0d] border border-emerald-900/30 px-4 py-2 rounded shadow-2xl backdrop-blur-md">
            <div className="flex flex-col items-end">
              <span className="mono text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                SESSION_USAGE
              </span>
              <span className="text-white font-mono text-sm font-bold">
                {sessionUsage} <span className="text-emerald-900">Reqs</span>
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-28">
        <header className="mb-16 lg:mb-28 flex flex-col items-center">
          <div className="flex items-center gap-6 mb-8 lg:mb-12">
            <div className="px-4 py-1 rounded-full bg-emerald-950/20 border border-emerald-900/40 mono text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-500">
              SYNTHETIX INTELLIGENCE
            </div>
          </div>

          <h1 className="text-5xl md:text-8xl lg:text-9xl font-[800] tracking-[-0.06em] mb-6 lg:mb-10 text-center leading-[0.85] text-white">
            SYNTHETIX<span className="text-emerald-500 font-black">.AI</span>
          </h1>
          <p className="text-center text-slate-500 max-w-xs lg:max-w-lg text-[8px] lg:text-[10px] font-bold tracking-[0.3em] lg:tracking-[0.5em] uppercase leading-relaxed opacity-60 mono px-4">
            Next-Generation Influence Architecture
          </p>
        </header>

        <div className="max-w-4xl mx-auto mb-20 lg:mb-36 relative group">
          <div className="relative bg-[#0a0f0d] border border-emerald-900/30 rounded-none p-1 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] transition-all group-hover:border-emerald-500/30">
            <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-0">
              <input
                type="text"
                placeholder="DEFINE CONTENT STRATEGY..."
                className="flex-grow bg-transparent border-none px-6 py-6 lg:px-12 lg:py-10 focus:ring-0 outline-none text-base lg:text-xl text-white placeholder:text-slate-800 font-bold tracking-tight uppercase"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              />
              <div className="flex flex-col md:flex-row border-t md:border-t-0 md:border-l border-emerald-900/20">
                <select
                  className="bg-transparent border-none px-6 py-4 md:px-10 outline-none mono text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-400 transition-all cursor-pointer appearance-none border-b md:border-b-0 border-emerald-900/20 md:border-r"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                >
                  {Object.values(Tone).map((t) => (
                    <option key={t} value={t} className="bg-black text-white">
                      {t}
                    </option>
                  ))}
                </select>
                <button
                  disabled={isLoading || !idea.trim()}
                  onClick={handleGenerate}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-900 disabled:text-slate-700 text-black font-extrabold text-[12px] uppercase tracking-[0.25em] py-4 px-10 lg:px-16 transition-all whitespace-nowrap"
                >
                  {isLoading ? "..." : "GENERATE"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {drafts.length > 0 ? (
            drafts.map((draft, idx) => (
              <PlatformCard
                key={idx}
                draft={draft}
                onGenerateImage={handleGenerateImage}
                onEditContent={handleEditContent}
              />
            ))
          ) : (
            <div className="col-span-full py-28 flex flex-col items-center justify-center grayscale opacity-10 pointer-events-none">
              <div className="w-px h-32 bg-gradient-to-b from-emerald-500 to-transparent mb-10"></div>
              <p className="mono text-[10px] font-bold uppercase tracking-[1em] text-center">
                AWAITING_INITIALIZATION
              </p>
            </div>
          )}
        </div>

        <footer className="mt-56 mb-20 flex flex-col items-center gap-10">
          <div className="h-px w-48 bg-gradient-to-r from-transparent via-emerald-900/50 to-transparent"></div>
          <p className="mono text-slate-800 text-[9px] font-bold uppercase tracking-[0.8em]">
            SYNTHETIX PROPRIETARY ENGINE // 2025
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
