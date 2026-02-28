import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Course } from "../backend.d";

interface Props {
  selectedCourses: Course[];
  onReview: () => void;
}

export default function CourseSelectionCart({
  selectedCourses,
  onReview,
}: Props) {
  const nonMandatory = selectedCourses.filter((c) => !c.isMandatory);
  const mandatory = selectedCourses.filter((c) => c.isMandatory);

  return (
    <AnimatePresence>
      {selectedCourses.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-30 p-4 sm:p-6"
        >
          <div
            className="max-w-2xl mx-auto rounded-2xl border border-border/80 shadow-navy px-5 py-4 flex items-center gap-4"
            style={{
              background: "oklch(0.18 0.05 265 / 0.97)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Icon + count */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "oklch(var(--gold) / 0.15)" }}
                >
                  <ShoppingBag
                    className="w-5 h-5"
                    style={{ color: "oklch(var(--gold))" }}
                  />
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCourses.length}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: "oklch(var(--gold))",
                      color: "oklch(var(--navy-dark))",
                    }}
                  >
                    {selectedCourses.length}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="min-w-0">
                <p className="text-white text-sm font-semibold leading-snug">
                  {selectedCourses.length} session
                  {selectedCourses.length !== 1 ? "s" : ""} selected
                </p>
                <p className="text-white/50 text-xs truncate">
                  {mandatory.length > 0 && `${mandatory.length} mandatory`}
                  {mandatory.length > 0 && nonMandatory.length > 0 && " · "}
                  {nonMandatory.length > 0 && `${nonMandatory.length} chosen`}
                </p>
              </div>
            </div>

            {/* Review button */}
            <Button
              onClick={onReview}
              className="shrink-0 font-display font-semibold gap-1.5 px-5"
              style={{
                background: "oklch(var(--gold))",
                color: "oklch(var(--navy-dark))",
              }}
            >
              Review
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
