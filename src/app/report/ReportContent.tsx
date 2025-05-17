"use client";

import { useEffect, useState } from "react";
import { getCourseRankings } from "../actions";
import PrintButton from "./PrintButton";
import "./print.css";

interface Student {
  id: string;
  name: string;
  intake: number;
  section: string;
  phone?: string;
}

interface CourseGroup {
  code: string;
  name: string;
  count: number;
  students: Student[];
}

export default function ReportContent() {
  const [data, setData] = useState<{
    totalStudents: number;
    rankings: CourseGroup[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getCourseRankings({ includePhone: true });
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 print:p-0 print:max-w-none">
      <div className="flex justify-between items-center mb-6 print:mb-4">
        <div>
          <h1 className="text-2xl font-bold print:text-xl">
            Student Report by Course
          </h1>
          <p className="text-gray-600 print:text-sm print:mt-1">
            Total Students: {data.totalStudents}
          </p>
        </div>
        <PrintButton />
      </div>

      {data.rankings.map((group) => (
        <div
          key={group.code}
          className="mb-8 print:mb-6 print:break-inside-avoid"
        >
          <h2 className="text-xl font-semibold mb-4 print:text-lg print:mb-2 print:bg-gray-100 print:p-2">
            {group.name} ({group.code}) - {group.count} Students
          </h2>
          <div className="overflow-x-auto print:overflow-visible">
            <table className="min-w-full bg-white border border-gray-300 print:border-collapse">
              <thead>
                <tr className="bg-gray-100 print:bg-gray-100">
                  <th className="px-4 py-2 border print:border print:px-2 print:py-1 print:text-sm text-center">
                    Student ID
                  </th>
                  <th className="px-4 py-2 border print:border print:px-2 print:py-1 print:text-sm text-left">
                    Name
                  </th>
                  <th className="px-4 py-2 border print:border print:px-2 print:py-1 print:text-sm text-right">
                    Intake
                  </th>
                  <th className="px-4 py-2 border print:border print:px-2 print:py-1 print:text-sm text-right">
                    Section
                  </th>
                  <th className="px-4 py-2 border print:border print:px-2 print:py-1 print:text-sm text-center">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.students.map((student) => (
                  <tr key={student.id} className="print:text-sm">
                    <td className="px-4 py-2 border print:border print:px-2 print:py-1 text-center">
                      {student.id}
                    </td>
                    <td className="px-4 py-2 border print:border print:px-2 print:py-1 text-left">
                      {student.name}
                    </td>
                    <td className="px-4 py-2 border print:border print:px-2 print:py-1 text-right">
                      {student.intake}
                    </td>
                    <td className="px-4 py-2 border print:border print:px-2 print:py-1 text-right">
                      {student.section}
                    </td>
                    <td className="px-4 py-2 border print:border print:px-2 print:py-1 text-center">
                      {student.phone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
