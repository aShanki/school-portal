"use client"

import { use } from 'react'
import { AttendanceCalendar } from "@/components/dashboard/calendar"
import { useState, useEffect } from "react"
import { format, startOfDay } from "date-fns"
import { useSession } from 'next-auth/react'

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface Class {
  _id: string;
  name: string;
  studentIds: Student[];
}

interface AttendanceRecord {
  _id?: string;
  studentId: string;
  status: 'present' | 'absent' | 'late';
  date: Date;
  classId: string;
  teacherId: string;
}

export default function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession({
    required: true,
  })
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [classData, setClassData] = useState<Class | null>(null);
  const [attendance, setAttendance] = useState<Map<string, AttendanceRecord>>(new Map());

  useEffect(() => {
    fetchClassData();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      fetchAttendance();
    }
  }, [selectedDate]);

  const fetchClassData = async () => {
    try {
      const response = await fetch(`/api/dashboard/teacher/classes/${id}`);
      const data = await response.json();
      setClassData(data);
    } catch (error) {
      console.error('Failed to fetch class:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/dashboard/teacher/classes/${id}/attendance?date=${selectedDate.toISOString()}`);
      const data = await response.json();
      console.log('Fetched attendance data:', data); // Debug log
      
      // Convert array to Map using studentId as key
      const attendanceMap = new Map(
        data.map((record: AttendanceRecord) => [record.studentId, record])
      );
      console.log('Attendance Map:', Object.fromEntries(attendanceMap)); // Debug log
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const updateAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    if (!session?.user?.id) {
      console.error('No user ID found in session');
      return;
    }

    try {
      console.log('Sending attendance update:', {
        studentId,
        teacherId: session.user.id,
        classId: id,
        date: selectedDate,
        status
      });

      const response = await fetch(`/api/dashboard/teacher/classes/${id}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          teacherId: session.user.id,
          classId: id,
          date: selectedDate.toISOString(),
          status
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update attendance: ${errorData}`);
      }

      const updatedRecord = await response.json();
      console.log('Server response:', updatedRecord);

      setAttendance(new Map(
        new Map(attendance).set(studentId, updatedRecord)
      ));
    } catch (error) {
      console.error('Failed to update attendance:', error);
      // Optionally show error to user
    }
  };

  const getButtonClass = (studentId: string, buttonStatus: 'present' | 'absent' | 'late') => {
    const record = attendance.get(studentId);
    const currentStatus = record?.status;
    
    console.log(`Button class for ${studentId}:`, { currentStatus, buttonStatus }); // Debug log
    
    if (currentStatus === buttonStatus) {
      switch (buttonStatus) {
        case 'present':
          return 'bg-green-500 text-white';
        case 'absent':
          return 'bg-red-500 text-white';
        case 'late':
          return 'bg-yellow-500 text-white';
      }
    }
    return 'bg-gray-100 hover:bg-gray-200';
  };

  if (!classData) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex gap-6">
        <AttendanceCalendar 
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate}
        />
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4">
            {classData.name} - {format(selectedDate, "MMMM d, yyyy")}
          </h2>
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Student Name</th>
                  <th className="px-6 py-3 text-center">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {classData.studentIds.map((student) => (
                  <tr key={student._id} className="border-t">
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {['present', 'absent', 'late'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateAttendance(student._id, status as any)}
                            className={`px-4 py-2 rounded transition-colors ${
                              getButtonClass(student._id, status as any)
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
