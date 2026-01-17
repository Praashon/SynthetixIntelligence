import React from "react";

const WarningBanner: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full z-40 bg-red-950/20 border-b border-red-500/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center">
        <span className="text-red-500 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
          No Puter Detected • Image Generation Disabled
        </span>
      </div>
    </div>
  );
};

export default WarningBanner;
