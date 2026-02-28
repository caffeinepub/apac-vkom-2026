import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import type { Course } from "../backend.d";
import {
  formatTime,
  getAvailableSeats,
  getCategoryLabel,
  getUniqueRooms,
  getUniqueTimeSlots,
  groupCoursesByDate,
  isFull,
} from "../utils/courseUtils";
import CourseCard from "./CourseCard";

interface Props {
  courses: Course[];
  selectedCourseIds: Set<string>;
  onToggleCourse: (course: Course) => void;
}

const DATE_LABELS: Record<string, string> = {
  "2026-03-06": "March 6, 2026",
  "2026-03-07": "March 7, 2026",
};

export default function CourseCalendar({
  courses,
  selectedCourseIds,
  onToggleCourse,
}: Props) {
  const grouped = groupCoursesByDate(courses);
  const dates = Object.keys(grouped).sort();

  const defaultDate = dates[0] || "2026-03-06";
  const [activeDate, setActiveDate] = useState(defaultDate);

  if (courses.length === 0) {
    return (
      <div className="container pb-32">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            Sessions have not been loaded yet.
          </p>
          <p className="text-muted-foreground text-xs mt-1 max-w-xs">
            Please ask the administrator to visit the Admin dashboard and click
            "Initialize Courses".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container pb-32">
      <Tabs value={activeDate} onValueChange={setActiveDate} className="w-full">
        <TabsList className="mb-6 h-auto p-1 gap-1 bg-secondary w-full sm:w-auto">
          {dates.map((date) => (
            <TabsTrigger
              key={date}
              value={date}
              className="flex-1 sm:flex-none px-4 py-2.5 font-display font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {DATE_LABELS[date] || date}
            </TabsTrigger>
          ))}
        </TabsList>

        {dates.map((date) => (
          <TabsContent key={date} value={date}>
            <DaySchedule
              courses={grouped[date] || []}
              selectedCourseIds={selectedCourseIds}
              onToggleCourse={onToggleCourse}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function DaySchedule({
  courses,
  selectedCourseIds,
  onToggleCourse,
}: {
  courses: Course[];
  selectedCourseIds: Set<string>;
  onToggleCourse: (course: Course) => void;
}) {
  const timeSlots = getUniqueTimeSlots(courses);
  const rooms = getUniqueRooms(courses);

  // Build lookup: room -> startTime -> course
  const lookup: Record<string, Record<string, Course>> = {};
  for (const course of courses) {
    if (!lookup[course.room]) lookup[course.room] = {};
    lookup[course.room][course.startTime] = course;
  }

  // For March 6 there are only a few sessions, use list view
  // For March 7 there are many rooms, use grid
  const useGrid = rooms.length > 2;

  if (!useGrid) {
    // Grouped by time, linear view for March 6
    return (
      <div className="space-y-6">
        {timeSlots.map((timeSlot) => {
          const slotCourses = courses.filter((c) => c.startTime === timeSlot);
          return (
            <div key={timeSlot}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="text-xs font-mono font-semibold px-3 py-1.5 rounded-full border"
                  style={{
                    background: "oklch(var(--primary) / 0.07)",
                    color: "oklch(var(--primary))",
                    borderColor: "oklch(var(--primary) / 0.2)",
                  }}
                >
                  {formatTime(timeSlot)}
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slotCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isSelected={selectedCourseIds.has(course.id)}
                    onToggle={() => onToggleCourse(course)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Full grid for March 7
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div
        className="grid gap-0 min-w-[900px]"
        style={{
          gridTemplateColumns: `100px repeat(${rooms.length}, minmax(150px, 1fr))`,
        }}
      >
        {/* Header row: rooms */}
        <div className="bg-muted/50 border border-border rounded-tl-lg p-2" />
        {rooms.map((room) => (
          <div
            key={room}
            className="bg-muted/50 border-t border-r border-b border-border p-2 first:border-l text-center"
          >
            <span className="text-xs font-display font-bold text-foreground uppercase tracking-wide">
              {room}
            </span>
          </div>
        ))}

        {/* Time rows */}
        {timeSlots.map((timeSlot, rowIdx) => (
          <>
            {/* Time label */}
            <div
              key={`time-${timeSlot}`}
              className={`border-l border-b border-r border-border bg-muted/30 p-2 flex items-center justify-center ${
                rowIdx === timeSlots.length - 1 ? "rounded-bl-lg" : ""
              }`}
            >
              <span className="time-row-label text-center leading-tight text-muted-foreground">
                {formatTime(timeSlot)}
              </span>
            </div>

            {/* Course cells */}
            {rooms.map((room, colIdx) => {
              const course = lookup[room]?.[timeSlot];
              return (
                <div
                  key={`${timeSlot}-${room}`}
                  className={`border-r border-b border-border p-1.5 ${
                    rowIdx === timeSlots.length - 1 &&
                    colIdx === rooms.length - 1
                      ? "rounded-br-lg"
                      : ""
                  }`}
                  style={{ minHeight: "90px" }}
                >
                  {course ? (
                    <CourseCard
                      course={course}
                      isSelected={selectedCourseIds.has(course.id)}
                      onToggle={() => onToggleCourse(course)}
                      compact
                    />
                  ) : (
                    <div className="h-full w-full bg-muted/20 rounded" />
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground font-semibold">
          Legend:
        </span>
        {[
          { label: "Panel Discussion", cls: "badge-panel" },
          { label: "Breakout / Mandatory", cls: "badge-mandatory" },
          { label: "Solution Overview", cls: "badge-solution" },
          { label: "Short Talk", cls: "badge-short-talk" },
        ].map((l) => (
          <span
            key={l.label}
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${l.cls}`}
          >
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
