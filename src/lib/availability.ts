import { prisma } from "@/lib/prisma";

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

/**
 * Generate all possible time slots for a given schedule entry
 */
function generateSlots(
  scheduleStart: string,
  scheduleEnd: string,
  slotDuration: number
): { startTime: string; endTime: string }[] {
  const slots: { startTime: string; endTime: string }[] = [];

  const [startH, startM] = scheduleStart.split(":").map(Number);
  const [endH, endM] = scheduleEnd.split(":").map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + slotDuration <= endMinutes) {
    const slotStart = `${String(Math.floor(currentMinutes / 60)).padStart(2, "0")}:${String(currentMinutes % 60).padStart(2, "0")}`;
    const slotEndMin = currentMinutes + slotDuration;
    const slotEnd = `${String(Math.floor(slotEndMin / 60)).padStart(2, "0")}:${String(slotEndMin % 60).padStart(2, "0")}`;

    slots.push({ startTime: slotStart, endTime: slotEnd });
    currentMinutes += slotDuration;
  }

  return slots;
}

/**
 * Check if two time ranges overlap
 */
function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Get available slots for a doctor on a specific date
 */
export async function getAvailableSlots(
  doctorId: string,
  date: Date
): Promise<TimeSlot[]> {
  const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday

  // 1. Get doctor schedule for this day
  const schedules = await prisma.schedule.findMany({
    where: {
      doctorId,
      dayOfWeek,
      isActive: true,
    },
  });

  if (schedules.length === 0) {
    return [];
  }

  // 2. Generate all possible slots
  let allSlots: { startTime: string; endTime: string }[] = [];
  for (const schedule of schedules) {
    const slots = generateSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.slotDuration
    );
    allSlots = allSlots.concat(slots);
  }

  // 3. Get existing appointments for this date (PENDING or CONFIRMED)
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: { gte: startOfDay, lte: endOfDay },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { startTime: true, endTime: true },
  });

  // 4. Get blocked slots for this date
  const blockedSlots = await prisma.blockedSlot.findMany({
    where: {
      doctorId,
      date: { gte: startOfDay, lte: endOfDay },
    },
    select: { startTime: true, endTime: true },
  });

  // 5. Filter out past slots if date is today
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const currentTime = isToday
    ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    : "00:00";

  // 6. Mark availability
  const result: TimeSlot[] = allSlots.map((slot) => {
    // Past slot today
    if (isToday && slot.startTime <= currentTime) {
      return { ...slot, isAvailable: false };
    }

    // Booked slot
    const isBooked = appointments.some((appt: { startTime: string; endTime: string }) =>
      timesOverlap(slot.startTime, slot.endTime, appt.startTime, appt.endTime)
    );
    if (isBooked) {
      return { ...slot, isAvailable: false };
    }

    // Blocked slot
    const isBlocked = blockedSlots.some((blocked: { startTime: string; endTime: string }) =>
      timesOverlap(
        slot.startTime,
        slot.endTime,
        blocked.startTime,
        blocked.endTime
      )
    );
    if (isBlocked) {
      return { ...slot, isAvailable: false };
    }

    return { ...slot, isAvailable: true };
  });

  return result;
}

/**
 * Get 7-day availability summary for a doctor
 */
export async function getWeekAvailability(
  doctorId: string
): Promise<
  { date: string; dayName: string; totalSlots: number; availableSlots: number }[]
> {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const slots = await getAvailableSlots(doctorId, date);
    const available = slots.filter((s) => s.isAvailable).length;

    result.push({
      date: date.toISOString().split("T")[0],
      dayName: i === 0 ? "Today" : dayNames[date.getDay()],
      totalSlots: slots.length,
      availableSlots: available,
    });
  }

  return result;
}
