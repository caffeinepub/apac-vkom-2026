import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  AlertTriangle,
  CalendarCheck2,
  Clock,
  Loader2,
  Lock,
  MapPin,
  Trash2,
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
  selectedCourses: Course[];
  email: string;
  employeeId: string;
  onSubmit: () => void;
  onRemoveCourse: (courseId: string) => void;
  isSubmitting: boolean;
  error?: string;
}

/** Returns pairs of courses that overlap in time on the same date */
function detectConflicts(courses: Course[]): Array<[string, string]> {
  const conflicts: Array<[string, string]> = [];
  for (let i = 0; i < courses.length; i++) {
    for (let j = i + 1; j < courses.length; j++) {
      const a = courses[i];
      const b = courses[j];
      if (a.date !== b.date) continue;
      // Overlap if a.start < b.end AND b.start < a.end
      if (a.startTime < b.endTime && b.startTime < a.endTime) {
        conflicts.push([a.id, b.id]);
      }
    }
  }
  return conflicts;
}

export default function ConfirmationModal({
  open,
  onClose,
  selectedCourses,
  email,
  employeeId,
  onSubmit,
  onRemoveCourse,
  isSubmitting,
  error,
}: Props) {
  const sortedCourses = [...selectedCourses].sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    if (a.startTime < b.startTime) return -1;
    if (a.startTime > b.startTime) return 1;
    return 0;
  });

  const mandatory = selectedCourses.filter((c) => c.isMandatory);
  const optional = selectedCourses.filter((c) => !c.isMandatory);
  const conflicts = detectConflicts(selectedCourses);
  const conflictIds = new Set(conflicts.flat());
  const hasConflicts = conflicts.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !isSubmitting && !v && onClose()}>
      <DialogContent
        className="max-w-lg w-full p-0 gap-0 overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh", height: "90vh" }}
      >
        {/* Header — fixed, never scrolls */}
        <div
          className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0"
          style={{ background: "oklch(var(--primary))" }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <CalendarCheck2 className="w-6 h-6 text-white/80" />
              <DialogTitle className="text-white text-xl font-display">
                Review Your Selection
              </DialogTitle>
            </div>
            <DialogDescription className="text-white/70 text-sm">
              You are enrolling as{" "}
              <span className="font-semibold text-white">{email}</span> (ID:{" "}
              <span className="font-semibold text-white">{employeeId}</span>)
            </DialogDescription>
          </DialogHeader>

          {/* Summary pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            <div className="bg-white/15 rounded-full px-3 py-1 text-white text-xs font-semibold">
              {selectedCourses.length} total sessions
            </div>
            <div className="bg-white/15 rounded-full px-3 py-1 text-white text-xs font-semibold">
              {mandatory.length} mandatory
            </div>
            <div className="bg-white/15 rounded-full px-3 py-1 text-white text-xs font-semibold">
              {optional.length} chosen
            </div>
            {hasConflicts && (
              <div className="bg-red-500/80 rounded-full px-3 py-1 text-white text-xs font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        {/* Conflict warning banner — fixed, never scrolls */}
        {hasConflicts && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-start gap-2 flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm">
              <span className="font-semibold">
                Schedule conflicts detected.
              </span>{" "}
              The highlighted sessions overlap in time. Please remove one from
              each conflicting pair before submitting.
            </p>
          </div>
        )}

        {/* Course list — takes remaining space, scrolls independently */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 py-4 space-y-2">
            {sortedCourses.map((course) => {
              const catClass = getCategoryColor(
                course.category,
                course.isMandatory,
              );
              const catLabel = getCategoryLabel(course.category);
              const isConflict = conflictIds.has(course.id);
              return (
                <div
                  key={course.id}
                  className={[
                    "rounded-lg border p-3 flex items-start gap-3",
                    isConflict
                      ? "bg-red-50 border-red-300"
                      : course.isMandatory
                        ? "bg-amber-50 border-amber-200"
                        : "bg-card border-border",
                  ].join(" ")}
                >
                  {isConflict && (
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  {!isConflict && course.isMandatory && (
                    <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${catClass}`}
                      >
                        {course.isMandatory ? "Mandatory" : catLabel}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatDate(course.date)}
                      </span>
                      {isConflict && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 border border-red-300 text-red-600 font-semibold">
                          Time Conflict
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-sm text-foreground leading-snug">
                      {course.title}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
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
                  {/* Delete button — only for non-mandatory courses */}
                  {!course.isMandatory && (
                    <button
                      type="button"
                      onClick={() => onRemoveCourse(course.id)}
                      disabled={isSubmitting}
                      className="flex-shrink-0 p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-40"
                      aria-label={`Remove ${course.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error — fixed above footer */}
        {error && (
          <div className="px-6 py-3 flex items-start gap-2 bg-destructive/10 border-t border-destructive/20 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Footer — always visible at the bottom */}
        <div className="px-6 py-4 border-t border-border flex-shrink-0 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            Back to Selection
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isSubmitting || selectedCourses.length === 0 || hasConflicts
            }
            className="flex-1 sm:flex-none font-display font-semibold gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CalendarCheck2 className="w-4 h-4" />
                Submit Registration
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
