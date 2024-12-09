"use client"

import { Calendar as CalendarBase } from "@/components/ui/calendar"
import { useState } from "react"
import { format } from "date-fns"

interface AttendanceCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export function AttendanceCalendar({ onDateSelect, selectedDate }: AttendanceCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate);

  const handleSelect = (date?: Date) => {
    setDate(date);
    if (date && onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <CalendarBase
        mode="single"
        selected={date}
        onSelect={handleSelect}
        className="rounded-md"
      />
      {date && (
        <p className="text-center mt-4">
          Selected: {format(date, "PPP")}
        </p>
      )}
    </div>
  );
}
