import React, { useState } from "react";

interface ApiKeyModalProps {
  onSubmit: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSubmit }) => {
  const [key, setKey] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0f0d] border border-emerald-900/30 p-8 w-full max-w-md shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-900 to-emerald-500"></div>

        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          GEMINI API ACCESS
        </h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Enter your free Google Gemini API key to continue without Puter.
        </p>

        <input
          type="password"
          placeholder="ENTER API KEY..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full bg-black/50 border border-emerald-900/30 px-4 py-3 mb-6 focus:border-emerald-500/50 outline-none text-emerald-500 placeholder:text-emerald-900/50 font-mono text-sm"
        />

        <button
          onClick={() => key.trim() && onSubmit(key)}
          disabled={!key.trim()}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900/20 disabled:text-emerald-900/40 text-black font-extrabold text-sm py-4 uppercase tracking-widest transition-all"
        >
          Initialize System
        </button>

        <div className="mt-4 text-center">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-900 hover:text-emerald-500 text-[10px] font-mono uppercase tracking-widest underline transition-colors"
          >
            Get Free API Key
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
