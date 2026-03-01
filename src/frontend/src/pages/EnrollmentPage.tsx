import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Course } from "../backend.d";
import { useGetCourses, useRegister } from "../hooks/useQueries";
import { isFull } from "../utils/courseUtils";

import ConfirmationModal from "../components/ConfirmationModal";
import ConfirmedScheduleModal from "../components/ConfirmedScheduleModal";
import CourseCalendar from "../components/CourseCalendar";
import CourseSelectionCart from "../components/CourseSelectionCart";
import EmployeeForm from "../components/EmployeeForm";
import HeroBanner from "../components/HeroBanner";

type Step = "details" | "select";

interface Props {
  onNavigateAdmin: () => void;
}

export default function EnrollmentPage({ onNavigateAdmin }: Props) {
  const [step, setStep] = useState<Step>("details");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(
    new Set(),
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showConfirmedSchedule, setShowConfirmedSchedule] = useState(false);

  const { data: courses = [], isLoading: coursesLoading } = useGetCourses();
  const registerMutation = useRegister();

  // Auto-select mandatory courses
  useEffect(() => {
    if (courses.length > 0) {
      const mandatoryIds = courses
        .filter((c) => c.isMandatory)
        .map((c) => c.id);
      setSelectedCourseIds((prev) => {
        const next = new Set(prev);
        for (const id of mandatoryIds) next.add(id);
        return next;
      });
    }
  }, [courses]);

  const selectedCourses = courses.filter((c) => selectedCourseIds.has(c.id));

  const handleToggleCourse = (course: Course) => {
    if (course.isMandatory) return;
    if (isFull(course) && !selectedCourseIds.has(course.id)) return;
    setSelectedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(course.id)) {
        next.delete(course.id);
      } else {
        next.add(course.id);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    try {
      await registerMutation.mutateAsync({
        employeeId,
        email,
        courseIds: Array.from(selectedCourseIds),
      });
      setShowConfirmModal(false);
      setShowConfirmedSchedule(true);
    } catch {
      // error handled in modal
    }
  };

  const handleCloseConfirmedSchedule = () => {
    setShowConfirmedSchedule(false);
    // Reset form so another employee can register
    setStep("details");
    setEmployeeId("");
    setEmail("");
    setSelectedCourseIds(new Set());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy sticky top-0 z-40 shadow-navy">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gold flex items-center justify-center">
              <span className="text-xs font-display font-bold text-navy-dark">
                V
              </span>
            </div>
            <span className="font-display text-white font-semibold text-sm tracking-wide">
              APAC VKOM 2026
            </span>
          </div>
          <button
            type="button"
            onClick={onNavigateAdmin}
            className="text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            Admin
          </button>
        </div>
      </header>

      <main>
        {/* Hero Banner */}
        <HeroBanner />

        <AnimatePresence mode="wait">
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EmployeeForm
                onSubmit={(id, mail) => {
                  setEmployeeId(id);
                  setEmail(mail);
                  setStep("select");
                }}
                isLoading={coursesLoading}
                sessionCount={courses.length}
                onNavigateAdmin={onNavigateAdmin}
              />
            </motion.div>
          )}

          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="container py-6">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    ← Back
                  </button>
                  <div className="h-4 w-px bg-border" />
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Enrolling:{" "}
                      <span className="font-semibold text-foreground">
                        {email}
                      </span>
                      <span className="mx-2 text-border">·</span>
                      <span className="font-semibold text-foreground">
                        ID: {employeeId}
                      </span>
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl font-display font-bold text-foreground mb-1">
                  Select Your Sessions
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Click sessions to add them to your schedule. Mandatory
                  sessions are pre-selected.
                </p>
              </div>

              {coursesLoading ? (
                <div className="container flex items-center justify-center py-24">
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground text-sm">
                      Loading sessions...
                    </p>
                  </div>
                </div>
              ) : (
                <CourseCalendar
                  courses={courses}
                  selectedCourseIds={selectedCourseIds}
                  onToggleCourse={handleToggleCourse}
                />
              )}

              {/* Floating Cart */}
              <CourseSelectionCart
                selectedCourses={selectedCourses}
                onReview={() => setShowConfirmModal(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Confirmation Modal (review before submit) */}
      <ConfirmationModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        selectedCourses={selectedCourses}
        email={email}
        employeeId={employeeId}
        onSubmit={handleSubmit}
        isSubmitting={registerMutation.isPending}
        error={registerMutation.error?.message}
      />

      {/* Confirmed Schedule Modal (shown after successful submission) */}
      <ConfirmedScheduleModal
        open={showConfirmedSchedule}
        onClose={handleCloseConfirmedSchedule}
        email={email}
        employeeId={employeeId}
        selectedCourses={selectedCourses}
      />

      {/* Footer */}
      <footer className="bg-navy-dark text-white/50 py-6 mt-16">
        <div className="container text-center text-xs">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-white/70 hover:text-white transition-colors underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
