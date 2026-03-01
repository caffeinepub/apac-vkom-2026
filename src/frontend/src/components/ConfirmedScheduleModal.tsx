import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Lock,
  Mail,
  MapPin,
  UserCircle,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import type { Course } from "../backend.d";
import {
  formatDate,
  formatTime,
  getCategoryColor,
  getCategoryLabel,
} from "../utils/courseUtils";

interface Props {
  open: boolean;
  onClose: () => void;
  email: string;
  employeeId: string;
  selectedCourses: Course[];
}

export default function ConfirmedScheduleModal({
  open,
  onClose,
  email,
  employeeId,
  selectedCourses,
}: Props) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const sortedCourses = [...selectedCourses].sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return a.startTime.localeCompare(b.startTime);
  });

  // Group by date
  const byDate: Record<string, Course[]> = {};
  for (const c of sortedCourses) {
    if (!byDate[c.date]) byDate[c.date] = [];
    byDate[c.date].push(c);
  }

  const handleScreenshot = async () => {
    if (!printAreaRef.current) return;
    setIsCapturing(true);
    try {
      // Use browser print dialog which allows saving as PDF
      const printWindow = window.open("", "_blank", "width=800,height=900");
      if (!printWindow) {
        // Fallback: trigger browser print on current page
        window.print();
        return;
      }
      const html = printAreaRef.current.outerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <title>APAC VKOM 2026 – My Schedule</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: system-ui, sans-serif; color: #1a1a1a; background: #fff; padding: 20px; }
            .rounded-xl { border-radius: 12px; }
            .rounded-lg { border-radius: 8px; }
            .rounded-full { border-radius: 9999px; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .text-white { color: #fff; }
            .text-sm { font-size: 14px; }
            .text-xs { font-size: 12px; }
            .text-base { font-size: 16px; }
            .flex { display: flex; }
            .flex-wrap { flex-wrap: wrap; }
            .items-center { align-items: center; }
            .gap-1 { gap: 4px; }
            .gap-2 { gap: 8px; }
            .gap-3 { gap: 12px; }
            .px-4 { padding-left: 16px; padding-right: 16px; }
            .py-3 { padding-top: 12px; padding-bottom: 12px; }
            .px-3 { padding-left: 12px; padding-right: 12px; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .px-1\\.5 { padding-left: 6px; padding-right: 6px; }
            .py-0\\.5 { padding-top: 2px; padding-bottom: 2px; }
            .p-3 { padding: 12px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-5 { margin-bottom: 20px; }
            .mt-1 { margin-top: 4px; }
            .mt-5 { margin-top: 20px; }
            .pt-3 { padding-top: 12px; }
            .pb-3 { padding-bottom: 12px; }
            .border-b { border-bottom: 1px solid #e5e7eb; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .border { border: 1px solid #e5e7eb; }
            .bg-gray-50 { background: #f9fafb; }
            .bg-amber-50 { background: #fffbeb; }
            .border-gray-200 { border-color: #e5e7eb; }
            .border-amber-200 { border-color: #fcd34d; }
            .text-gray-900 { color: #111827; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-400 { color: #9ca3af; }
            .text-amber-600 { color: #d97706; }
            .space-y-5 > * + * { margin-top: 20px; }
            .space-y-2 > * + * { margin-top: 8px; }
            .flex-1 { flex: 1; }
            .min-w-0 { min-width: 0; }
            .shrink-0 { flex-shrink: 0; }
            .mt-0\\.5 { margin-top: 2px; }
            .leading-snug { line-height: 1.375; }
            .text-center { text-align: center; }
            .h-px { height: 1px; }
            .uppercase { text-transform: uppercase; }
            .tracking-widest { letter-spacing: 0.1em; }
            .w-4 { width: 16px; }
            .h-4 { height: 16px; }
            .w-3 { width: 12px; }
            .h-3 { height: 12px; }
            .w-5 { width: 20px; }
            .h-5 { height: 20px; }
            svg { display: inline-block; vertical-align: middle; }
            @media print {
              body { padding: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>${html}</body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } catch {
      // silently ignore
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-xl w-full max-h-[92vh] flex flex-col p-0 overflow-hidden gap-0"
        aria-describedby={undefined}
      >
        {/* Confirmed header */}
        <div
          className="relative px-6 pt-6 pb-5 text-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.38 0.12 145), oklch(0.5 0.18 145))",
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors rounded-full p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center gap-2">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-white text-2xl font-display font-bold text-center">
                Registration Confirmed!
              </DialogTitle>
            </DialogHeader>
            <p className="text-white/80 text-sm">
              APAC VKOM 2026 · March 6–7, 2026
            </p>
          </div>

          {/* Employee info pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-white text-xs font-semibold">
              <Mail className="w-3 h-3" />
              {email}
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-white text-xs font-semibold">
              <UserCircle className="w-3 h-3" />
              ID: {employeeId}
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-white text-xs font-semibold">
              <Calendar className="w-3 h-3" />
              {selectedCourses.length} session
              {selectedCourses.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Scrollable schedule */}
        <ScrollArea className="flex-1 min-h-0">
          {/* Printable area — ref captures this content */}
          <div
            ref={printAreaRef}
            className="px-6 py-4 bg-white"
            style={{ fontFamily: "inherit" }}
          >
            {/* Print-only header (visible when screenshot is taken) */}
            <div className="mb-4 pb-3 border-b border-gray-200">
              <div
                className="rounded-xl px-4 py-3 text-white mb-3"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.38 0.12 145), oklch(0.5 0.18 145))",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-display font-bold text-base">
                    Registration Confirmed — APAC VKOM 2026
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-white/80">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {email}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserCircle className="w-3 h-3" /> ID: {employeeId}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {selectedCourses.length}{" "}
                    sessions registered
                  </span>
                </div>
              </div>
            </div>

            {/* Course list grouped by date */}
            <div className="space-y-5">
              {Object.entries(byDate).map(([date, dayCourses]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="h-px flex-1"
                      style={{ background: "oklch(0.9 0 0)" }}
                    />
                    <span
                      className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{
                        color: "oklch(0.38 0.12 145)",
                        background: "oklch(0.96 0.04 145)",
                        border: "1px solid oklch(0.88 0.07 145)",
                      }}
                    >
                      {formatDate(date)}
                    </span>
                    <div
                      className="h-px flex-1"
                      style={{ background: "oklch(0.9 0 0)" }}
                    />
                  </div>

                  <div className="space-y-2">
                    {dayCourses.map((course) => {
                      const catClass = getCategoryColor(
                        course.category,
                        course.isMandatory,
                      );
                      const catLabel = getCategoryLabel(course.category);
                      return (
                        <div
                          key={course.id}
                          className={[
                            "rounded-lg border p-3 flex items-start gap-3",
                            course.isMandatory
                              ? "bg-amber-50 border-amber-200"
                              : "bg-gray-50 border-gray-200",
                          ].join(" ")}
                        >
                          {course.isMandatory ? (
                            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2
                              className="w-4 h-4 shrink-0 mt-0.5"
                              style={{ color: "oklch(0.5 0.14 145)" }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${catClass}`}
                              >
                                {course.isMandatory ? "Mandatory" : catLabel}
                              </span>
                            </div>
                            <p className="font-semibold text-sm text-gray-900 leading-snug">
                              {course.title}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(course.startTime)} –{" "}
                                {formatTime(course.endTime)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {course.room}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div className="mt-5 pt-3 border-t border-gray-200 text-center text-xs text-gray-400">
              APAC VKOM 2026 · March 6–7, 2026
            </div>
          </div>
        </ScrollArea>

        {/* Action buttons — always visible, pinned at bottom */}
        <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row gap-2 shrink-0 bg-background">
          <Button
            variant="outline"
            onClick={handleScreenshot}
            disabled={isCapturing}
            className="flex-1 gap-2"
          >
            <Camera className="w-4 h-4" />
            {isCapturing ? "Capturing..." : "Take Screenshot"}
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 gap-2 font-display font-semibold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.38 0.12 145), oklch(0.5 0.18 145))",
              color: "white",
            }}
          >
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
