"use client";

import { useEffect, useState, useRef } from "react";
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

function CopyableCell({
  value,
  className,
}: {
  value: string | number | undefined;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showBelow, setShowBelow] = useState(false);
  const cellRef = useRef<HTMLTableCellElement>(null);

  const handleClick = async () => {
    if (value === undefined) return;

    try {
      await navigator.clipboard.writeText(value.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    const checkPosition = () => {
      if (cellRef.current) {
        const rect = cellRef.current.getBoundingClientRect();
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;
        // Only show below if there's significantly more space below than above
        setShowBelow(spaceBelow > spaceAbove + 20);
      }
    };

    checkPosition();
    window.addEventListener("scroll", checkPosition);
    window.addEventListener("resize", checkPosition);

    return () => {
      window.removeEventListener("scroll", checkPosition);
      window.removeEventListener("resize", checkPosition);
    };
  }, []);

  return (
    <td
      ref={cellRef}
      onClick={handleClick}
      className={`${className} cursor-pointer hover:bg-gray-50 print:hover:bg-transparent transition-colors relative group`}
    >
      {value}
      <div
        className={`absolute left-1/2 transform -translate-x-1/2 print:hidden ${
          showBelow ? "top-full mt-1" : "bottom-full mb-1"
        }`}
      >
        <span
          className={`bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${
            copied ? "!opacity-100" : ""
          }`}
        >
          {copied ? "Copied!" : "Click to copy"}
        </span>
      </div>
    </td>
  );
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
                  <th className="px-4 py-2 border print:border print:px-2 print:py-1 print:text-sm text-center">
                    Signature
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.students.map((student) => (
                  <tr key={student.id} className="print:text-sm">
                    <CopyableCell
                      value={student.id}
                      className="px-4 py-2 border print:border print:px-2 print:py-1 text-center"
                    />
                    <CopyableCell
                      value={student.name}
                      className="px-4 py-2 border print:border print:px-2 print:py-1 text-left"
                    />
                    <CopyableCell
                      value={student.intake}
                      className="px-4 py-2 border print:border print:px-2 print:py-1 text-right"
                    />
                    <CopyableCell
                      value={student.section}
                      className="px-4 py-2 border print:border print:px-2 print:py-1 text-right"
                    />
                    <CopyableCell
                      value={student.phone}
                      className="px-4 py-2 border print:border print:px-2 print:py-1 text-center"
                    />
                    <td className="px-4 py-2 border print:border print:px-2 print:py-1 text-center">
                      {/* Empty cell for signature */}
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
