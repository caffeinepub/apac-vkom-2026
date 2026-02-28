import { motion } from "motion/react";

export default function HeroBanner() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ background: "oklch(0.15 0.05 265)" }}
    >
      <img
        src="/assets/generated/apac-vkom-banner.dim_1200x400.jpg"
        alt="APAC VKOM 2026 Training Event Banner"
        className="w-full object-cover"
        style={{ maxHeight: "360px", objectPosition: "center" }}
        loading="eager"
      />
      {/* Overlay gradient for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, oklch(0.15 0.05 265 / 0.6) 0%, transparent 50%, oklch(0.15 0.05 265 / 0.3) 100%)",
        }}
      />
      {/* Event info overlay */}
      <div className="absolute inset-0 flex flex-col justify-end pb-6 px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-3 items-center"
        >
          <span className="text-xs font-mono tracking-widest text-white/70 uppercase bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
            March 6–7, 2026
          </span>
          <span className="text-xs font-mono tracking-widest text-white/70 uppercase bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
            Training Enrollment
          </span>
        </motion.div>
      </div>
    </div>
  );
}
