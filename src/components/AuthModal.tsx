import React from "react";

interface AuthModalProps {
  onLogin: () => void;
  onFallback: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onFallback }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0f0d] border border-emerald-900/30 p-8 w-full max-w-md shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-900 to-emerald-500"></div>

        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          AUTHENTICATION REQUIRED
        </h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Please sign in to access the full suite of Synthetix Intelligence
          tools, including image generation.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={onLogin}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm py-4 uppercase tracking-widest transition-all"
          >
            Login with Puter
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-emerald-900/30"></div>
            <span className="flex-shrink-0 mx-4 text-emerald-900/50 text-xs font-mono uppercase">
              OR
            </span>
            <div className="flex-grow border-t border-emerald-900/30"></div>
          </div>

          <button
            onClick={onFallback}
            className="w-full bg-transparent border border-emerald-900/50 hover:border-emerald-500/50 text-emerald-500 hover:text-emerald-400 font-bold text-sm py-4 uppercase tracking-widest transition-all"
          >
            Use Free Gemini API
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
