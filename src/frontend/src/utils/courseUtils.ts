import type { Course } from "../backend.d";

export function getAvailableSeats(course: Course): number {
  return Number(course.capacity) - Number(course.enrolledCount);
}

export function isFull(course: Course): boolean {
  return getAvailableSeats(course) <= 0;
}

export function getCategoryColor(
  category: string,
  isMandatory: boolean,
): string {
  if (isMandatory) return "badge-mandatory";
  const cat = category.toLowerCase();
  if (cat.includes("panel")) return "badge-panel";
  if (cat.includes("breakout")) return "badge-breakout";
  if (cat.includes("solution") || cat.includes("overview"))
    return "badge-solution";
  if (cat.includes("short") || cat.includes("talk")) return "badge-short-talk";
  return "badge-panel";
}

export function getCategoryLabel(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes("panel")) return "Panel Discussion";
  if (cat.includes("breakout")) return "Breakout Session";
  if (cat.includes("solution") || cat.includes("overview"))
    return "Solution Overview";
  if (cat.includes("short") || cat.includes("talk")) return "Short Talk";
  return category;
}

export function formatTime(time: string): string {
  // time is like "14:00" or "2:00 PM"
  if (time.includes("AM") || time.includes("PM")) return time;
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export function groupCoursesByDate(
  courses: Course[],
): Record<string, Course[]> {
  return courses.reduce<Record<string, Course[]>>((acc, course) => {
    const date = course.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(course);
    return acc;
  }, {});
}

export function groupCoursesByRoom(
  courses: Course[],
): Record<string, Course[]> {
  return courses.reduce<Record<string, Course[]>>((acc, course) => {
    const room = course.room;
    if (!acc[room]) acc[room] = [];
    acc[room].push(course);
    return acc;
  }, {});
}

export function getUniqueTimeSlots(courses: Course[]): string[] {
  const slots = new Set(courses.map((c) => c.startTime));
  return Array.from(slots).sort();
}

export function getUniqueRooms(courses: Course[]): string[] {
  const rooms = new Set(courses.map((c) => c.room));
  return Array.from(rooms).sort((a, b) => {
    // Sort: ICC first, then IRIS 1, IRIS 2, IRIS 3, then Booth 1-6
    const order = [
      "ICC",
      "IRIS 1",
      "IRIS 2",
      "IRIS 3",
      "Booth 1",
      "Booth 2",
      "Booth 3",
      "Booth 4",
      "Booth 5",
      "Booth 6",
    ];
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function detectTimeConflicts(
  selected: Course[],
  candidate: Course,
): Course[] {
  return selected.filter((c) => {
    if (c.date !== candidate.date) return false;
    if (c.id === candidate.id) return false;
    // Check overlap: c.startTime < candidate.endTime && c.endTime > candidate.startTime
    return c.startTime < candidate.endTime && c.endTime > candidate.startTime;
  });
}

export function formatDate(dateStr: string): string {
  // dateStr could be "2026-03-06" or "March 6, 2026"
  if (dateStr.includes("-")) {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  return dateStr;
}
