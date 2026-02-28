import { CheckCircle2, Clock, Lock, MapPin, Users } from "lucide-react";
import type { Course } from "../backend.d";
import {
  formatTime,
  getAvailableSeats,
  getCategoryColor,
  getCategoryLabel,
  isFull,
} from "../utils/courseUtils";

interface Props {
  course: Course;
  isSelected: boolean;
  onToggle: () => void;
  compact?: boolean;
}

export default function CourseCard({
  course,
  isSelected,
  onToggle,
  compact = false,
}: Props) {
  const available = getAvailableSeats(course);
  const full = isFull(course);
  const disabled = full && !isSelected && !course.isMandatory;
  const categoryClass = getCategoryColor(course.category, course.isMandatory);
  const categoryLabel = getCategoryLabel(course.category);

  const fillPercent = Math.min(
    100,
    Math.round((Number(course.enrolledCount) / Number(course.capacity)) * 100),
  );

  if (compact) {
    return (
      <button
        type="button"
        onClick={!disabled && !course.isMandatory ? onToggle : undefined}
        disabled={disabled}
        aria-pressed={isSelected}
        aria-label={`${course.title} - ${formatTime(course.startTime)} to ${formatTime(course.endTime)}`}
        className={[
          "w-full h-full text-left p-2 rounded-lg border transition-all duration-150 text-xs",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          course.isMandatory
            ? "course-mandatory border-amber-300 cursor-default"
            : isSelected
              ? "course-selected border-primary cursor-pointer hover:shadow-selected"
              : disabled
                ? "course-full bg-muted/50 border-border cursor-not-allowed"
                : "bg-card border-border cursor-pointer hover:shadow-card-hover hover:border-primary/40 hover:bg-secondary/60",
        ].join(" ")}
      >
        {/* Category badge */}
        <span
          className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full border font-semibold mb-1 ${categoryClass}`}
        >
          {course.isMandatory ? "Mandatory" : categoryLabel}
        </span>

        <p className="font-semibold text-foreground leading-snug line-clamp-2 mb-1">
          {course.title}
        </p>

        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="w-3 h-3 shrink-0" />
          <span>
            {available}/{String(course.capacity)}
          </span>
          {isSelected && !course.isMandatory && (
            <CheckCircle2 className="w-3 h-3 ml-auto text-primary" />
          )}
          {course.isMandatory && (
            <Lock className="w-3 h-3 ml-auto text-amber-600" />
          )}
          {full && !isSelected && (
            <span className="ml-auto text-destructive text-[10px] font-bold">
              FULL
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={!disabled && !course.isMandatory ? onToggle : undefined}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={`${course.title} - ${formatTime(course.startTime)} to ${formatTime(course.endTime)}${isSelected ? " (selected)" : ""}${disabled ? " (full)" : ""}`}
      className={[
        "w-full text-left p-4 rounded-xl border transition-all duration-150 group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        course.isMandatory
          ? "course-mandatory border-amber-300 cursor-default"
          : isSelected
            ? "course-selected border-primary shadow-selected"
            : disabled
              ? "course-full bg-muted/40 border-border cursor-not-allowed"
              : "bg-card border-border cursor-pointer hover:shadow-card-hover hover:border-primary/40 hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold shrink-0 ${categoryClass}`}
        >
          {course.isMandatory ? "⚠ Mandatory" : categoryLabel}
        </span>
        {isSelected && !course.isMandatory && (
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5 animate-scale-in" />
        )}
        {course.isMandatory && (
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        )}
        {full && !isSelected && (
          <span className="text-[11px] font-bold text-destructive shrink-0">
            FULL
          </span>
        )}
      </div>

      <h3 className="font-display font-semibold text-sm text-foreground leading-snug mb-3">
        {course.title}
      </h3>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3 shrink-0" />
          <span>
            {formatTime(course.startTime)} – {formatTime(course.endTime)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>{course.room}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3 h-3 shrink-0" />
          <span>
            {full ? (
              <span className="text-destructive font-semibold">
                No seats available
              </span>
            ) : (
              <span>
                <span className="font-semibold text-foreground">
                  {available}
                </span>{" "}
                of {String(course.capacity)} seats available
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Seat fill bar */}
      <div className="mt-3">
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${fillPercent}%`,
              background:
                fillPercent >= 90
                  ? "oklch(var(--destructive))"
                  : fillPercent >= 70
                    ? "oklch(var(--gold))"
                    : "oklch(var(--primary))",
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>{fillPercent}% filled</span>
          <span>{String(course.capacity)} capacity</span>
        </div>
      </div>
    </button>
  );
}
