import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  CalendarCheck2,
  Clock,
  Loader2,
  Lock,
  MapPin,
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
  isSubmitting: boolean;
  error?: string;
}

export default function ConfirmationModal({
  open,
  onClose,
  selectedCourses,
  email,
  employeeId,
  onSubmit,
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

  return (
    <Dialog open={open} onOpenChange={(v) => !isSubmitting && !v && onClose()}>
      <DialogContent
        className="max-w-lg w-full max-h-[90vh] flex flex-col p-0 overflow-hidden"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4 border-b border-border"
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
          </div>
        </div>

        {/* Course list */}
        <ScrollArea className="flex-1 min-h-0 px-6 py-4">
          <div className="space-y-2">
            {sortedCourses.map((course) => {
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
                      : "bg-card border-border",
                  ].join(" ")}
                >
                  {course.isMandatory && (
                    <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
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
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Error */}
        {error && (
          <div className="px-6 py-3 flex items-start gap-2 bg-destructive/10 border-t border-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border gap-2 shrink-0">
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
            disabled={isSubmitting || selectedCourses.length === 0}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
