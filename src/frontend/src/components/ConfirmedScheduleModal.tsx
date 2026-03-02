import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Lock,
  Mail,
  MapPin,
  UserCircle,
  X,
} from "lucide-react";
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
  const sortedCourses = [...selectedCourses].sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return a.startTime.localeCompare(b.startTime);
  });

  const byDate: Record<string, Course[]> = {};
  for (const c of sortedCourses) {
    if (!byDate[c.date]) byDate[c.date] = [];
    byDate[c.date].push(c);
  }

  const handleDownloadSpreadsheet = () => {
    const escapeCell = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
    const headers = [
      "Date",
      "Start Time",
      "End Time",
      "Title",
      "Room",
      "Category",
      "Mandatory",
      "Employee ID",
      "Email",
    ];
    const rows = sortedCourses.map((course) => [
      escapeCell(formatDate(course.date)),
      escapeCell(formatTime(course.startTime)),
      escapeCell(formatTime(course.endTime)),
      escapeCell(course.title),
      escapeCell(course.room),
      escapeCell(getCategoryLabel(course.category)),
      escapeCell(course.isMandatory ? "Yes" : "No"),
      escapeCell(employeeId),
      escapeCell(email),
    ]);
    const csvContent = `\uFEFF${[headers.map(escapeCell), ...rows].map((r) => r.join(",")).join("\r\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `APAC-VKOM-2026-Schedule-${employeeId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent
          className="max-w-xl w-full max-h-[92vh] flex flex-col p-0 overflow-hidden gap-0"
          aria-describedby={undefined}
        >
          {/* Visible header (stays pinned at top) */}
          <div
            className="relative px-6 pt-6 pb-5 text-center shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.38 0.12 145), oklch(0.5 0.18 145))",
            }}
          >
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

          {/* Scrollable course list */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-6 py-4 bg-white">
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
              <div className="mt-5 pt-3 border-t border-gray-200 text-center text-xs text-gray-400">
                APAC VKOM 2026 · March 6–7, 2026
              </div>
            </div>
          </div>

          {/* Action buttons — pinned at bottom */}
          <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row gap-2 shrink-0 bg-background">
            <Button
              variant="outline"
              onClick={handleDownloadSpreadsheet}
              className="flex-1 gap-2"
            >
              <Download className="w-4 h-4" />
              Download Schedule
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
    </>
  );
}
