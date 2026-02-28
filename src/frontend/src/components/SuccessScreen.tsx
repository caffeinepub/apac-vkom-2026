import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { motion } from "motion/react";
import type { Course } from "../backend.d";
import {
  formatDate,
  formatTime,
  getCategoryColor,
  getCategoryLabel,
} from "../utils/courseUtils";

interface Props {
  email: string;
  employeeId: string;
  selectedCourses: Course[];
  onStartOver: () => void;
}

export default function SuccessScreen({
  email,
  employeeId,
  selectedCourses,
  onStartOver,
}: Props) {
  const sortedCourses = [...selectedCourses].sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return a.startTime.localeCompare(b.startTime);
  });

  // Group by date for display
  const byDate: Record<string, Course[]> = {};
  for (const c of sortedCourses) {
    if (!byDate[c.date]) byDate[c.date] = [];
    byDate[c.date].push(c);
  }

  return (
    <div className="container max-w-2xl py-12">
      {/* Success header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <div className="relative inline-block mb-5">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
            style={{ background: "oklch(0.55 0.16 145 / 0.12)" }}
          >
            <CheckCircle2
              className="w-10 h-10"
              style={{ color: "oklch(0.5 0.14 145)" }}
            />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs"
            style={{
              background: "oklch(var(--gold))",
              color: "oklch(var(--navy-dark))",
            }}
          >
            ✓
          </motion.div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-3xl font-display font-bold text-foreground mb-2"
        >
          You're Registered!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto"
        >
          Your enrollment for APAC VKOM 2026 is confirmed. A confirmation email
          with your schedule has been sent to{" "}
          <span className="font-semibold text-foreground">{email}</span>.
        </motion.p>
      </motion.div>

      {/* Registration summary card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl border border-border shadow-card overflow-hidden mb-6"
      >
        {/* Card header */}
        <div
          className="px-5 py-4 border-b border-border"
          style={{ background: "oklch(var(--secondary))" }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-display font-bold text-foreground">
                Registration Confirmation
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                APAC VKOM 2026 · March 6–7, 2026
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Employee ID</p>
              <p className="font-mono font-bold text-foreground">
                {employeeId}
              </p>
            </div>
          </div>
        </div>

        {/* Email confirmation notice */}
        <div className="px-5 py-3 flex items-center gap-2 border-b border-border bg-card">
          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Confirmation sent to{" "}
            <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        {/* Registered sessions */}
        <div className="px-5 py-4 bg-card">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Your {selectedCourses.length} Registered Session
            {selectedCourses.length !== 1 ? "s" : ""}
          </h4>

          <div className="space-y-4">
            {Object.entries(byDate).map(([date, dayCourses]) => (
              <div key={date}>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {formatDate(date)}
                </div>
                <div className="space-y-2 pl-2 border-l-2 border-border">
                  {dayCourses.map((course) => {
                    const catClass = getCategoryColor(
                      course.category,
                      course.isMandatory,
                    );
                    return (
                      <div key={course.id} className="flex items-start gap-2">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold shrink-0 mt-0.5 ${catClass}`}
                        >
                          {course.isMandatory
                            ? "Mandatory"
                            : getCategoryLabel(course.category)}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-snug">
                            {course.title}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-muted-foreground">
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
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="flex justify-center"
      >
        <Button variant="outline" onClick={onStartOver} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Register Another Employee
        </Button>
      </motion.div>
    </div>
  );
}
