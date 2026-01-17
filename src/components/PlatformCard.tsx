import React, { useState } from "react";
import { PlatformDraft, ImageSize, AspectRatio } from "../types";
import { generateSpeech } from "../services/puter";

interface PlatformCardProps {
  draft: PlatformDraft;
  onGenerateImage: (
    platform: string,
    AspectRatio: AspectRatio,
    size: ImageSize,
  ) => void;
  onEditContent: (platform: string, newContent: string) => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  draft,
  onGenerateImage,
  onEditContent,
}) => {
  const [size, setSize] = useState<ImageSize>(ImageSize.S1K);
  const [ratio, setRatio] = useState<AspectRatio>(draft.suggestedAspectRatio);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleDownload = () => {
    if (!draft.imageUrl) return;
    const link = document.createElement("a");
    link.href = draft.imageUrl;
    link.download = `${draft.platform.replace("/", "_")}_Image_Post.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const playAudio = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const audioSrc = await generateSpeech(draft.content);
      const audio = new Audio(audioSrc);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      await audio.play();
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="bg-[#080d0b] border-white/5 rounded-none flex flex-col h-full transition-all duration-500 hover:border-emerald-500/30 group/card shadow-2xl">
      <div className="p-7 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-emerald-500/80"></div>
          <h3 className="mono font-bold text-[10px] uppercase tracking-[0.25em] text-white/90">
            {draft.platform}
          </h3>
        </div>
        <button
          onClick={playAudio}
          disabled={isSpeaking}
          className={`px-3 py-2 mono text-[8px] font-bold uppercase tracking-widest transition-all ${
            isSpeaking
              ? "bg-emerald-500 text-black"
              : "text-emerald-500/50 hover:text-emerald-400"
          }`}
        >
          {isSpeaking ? "SYS_PLAYBACK" : "TRANS_VOICE"}
        </button>
      </div>

      <div className="p-10 flex-grow flex flex-col gap-10">
        <textarea
          className="w-full h-48 p-0 bg-transparent border-none focus:ring-0 outline-none text-slate-300 text-[13px] loading-[1.7] font-medium resize-none tracking-normal"
          value={draft.content}
          onChange={(e) => onEditContent(draft.platform, e.target.value)}
          spellCheck={false}
        />

        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block mono text-[8px] font-bold text-slate-700 uppercase mb-3 tracking-[0.2em]">
                Aspect_Ratio
              </label>
              <select
                value={ratio}
                onChange={(e) => setRatio(e.target.value as AspectRatio)}
                className="w-full bg-[#0d1411] border border-white/5 text-slate-400 text-[10px] font-bold p-3 outline-none focus:border-emerald-500/30 transition-colors appearance-none mono"
              >
                {[
                  "1:1",
                  "2:3",
                  "3:2",
                  "3:4",
                  "4:3",
                  "4:5",
                  "5:4",
                  "9:16",
                  "16:9",
                  "21:9",
                ].map((r) => (
                  <option value={r} key={r} className="bg-black">
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block mono text-[8px] font-bold text-slate-700 uppercase mb-3 tracking-[0.2em]">
                Res_Tier
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as ImageSize)}
                className="w-full bg-[#0d1411] border border-white/5 text-slate-400 text-[10px] font-bold p-3 outline-none focus:border-emerald-500/30 transition-colors appearance-none mono"
              >
                <option value={ImageSize.S1K} className="bg-black">
                  1024PX
                </option>
                <option value={ImageSize.S2K} className="bg-black">
                  2048PX
                </option>
                <option value={ImageSize.S4K} className="bg-black">
                  4096PX
                </option>
              </select>
            </div>
          </div>

          <div className="realtive min-h-[220px] flex items-center justify-center bg-black border border-white/5 overflow-hidden">
            {draft.isGeneratingImage ? (
              <div className="absolute insect-0 z-10 flex flex-col items-center justify-center bg-black/95">
                <div className="w-16 h-px bg-emerald-500/20 overflow-hidden realtive mb-6">
                  <div className="absolute inset-0 bg-emerald-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                </div>
                <style>
                  {`@keyframes loading{0% {transform:translateX(-100%);} 
                          100%{transform: translateX(100%);}}
                      `}
                </style>
                <span className="mono text-[8px] font-bold uppercase tracking-[0.5em] text-emerald-500">
                  SYNCING_ASSETS
                </span>
              </div>
            ) : null}

            {draft.imageUrl ? (
              <div className="relative w-full h-full group/img">
                <img
                  src={draft.imageUrl}
                  alt="Render Frame"
                  className={`w-full h-full object-cover max-h-80 transition-all duration-1000 ${draft.isGeneratingImage ? "opacity-0 scale-95" : "opacity-70 group-hover/img:opacity-100 scale-100"}`}
                />

                <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover/img:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
                  <button
                    onClick={() => onGenerateImage(draft.platform, ratio, size)}
                    className="px-6 py-3 bg-black border border-emerald-500/40 text-emerald-500 text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all mono shadow-2xl"
                  >
                    RE_RENDER
                  </button>
                  <button
                    onClick={handleDownload}
                    className="w-11 h-11 bg-emerald-600 text-black flex items-center justify-center hover:bg-emerald-400 transition-all shadow-2xl"
                    title="Export Raw"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a2 2 0 002 2h12 a2 2 0 002-2v-1M7 10l5 5 5-5M12 15V3"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <button
                disabled={draft.isGeneratingImage}
                onClick={() => onGenerateImage(draft.platform, ratio, size)}
                className="w-full h-56 flex flex-col items-center justify-center gap-6 group/btn transition-all hover:bg-emerald-500/5"
              >
                <div className="w-10 h-px bg-emerald-900 group-hover/btn:w-20 transition-all duration-700"></div>
                <span className="mono text-[9px] font-bold uppercase tracking-[0.6em] text-emerald-600/60 group-hover/btn:text-emerald-400 transition-colors">
                  INITIALIZE_VISUAL
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 border-white/5 border-t bg-[#0a1210] flex justify-between items-center">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-1 h-1 bg-white/10"></div>
          ))}
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(draft.content);
            const btn = document.activeElement as HTMLElement;
            const originalText = btn.innerText;
            btn.innerText = "COPIED_TO_CLIPBOARD";
            btn.style.color = "#10b981";
            setTimeout(() => {
              btn.innerText = originalText;
              btn.style.color = "";
            }, 2500);
          }}
          className="mono text-[9px] uppercase font-bold tracking-[0.35em]  text-slate-600 hover:text-emerald-500 transition-all"
        >
          COPY_DATA
        </button>
      </div>
    </div>
  );
};

export default PlatformCard;
