"use client";

import { useEffect, useState } from "react";
import { getCourseRankings } from "../actions";
import PrintButton from "./PrintButton";
import "./print.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [open, setOpen] = useState(false);

  const handleClick = async () => {
    if (value === undefined) return;

    try {
      await navigator.clipboard.writeText(value.toString());
      setCopied(true);
      setOpen(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <TableCell
          onClick={handleClick}
          className={`${className} cursor-pointer hover:bg-gray-50 print:hover:bg-transparent transition-colors`}
        >
          {value}
        </TableCell>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="bg-primary text-primary-foreground px-2 py-1 text-xs rounded shadow-md"
      >
        {copied ? "Copied!" : "Click to copy"}
      </TooltipContent>
    </Tooltip>
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
      <div className="flex justify-between items-center mb-3 print:mb-1.5">
        <div>
          <h1 className="text-xl font-bold print:text-lg">
            Student Report by Course
          </h1>
          <p className="text-gray-600 print:text-xs print:mt-0.5">
            Total Students: {data.totalStudents}
          </p>
        </div>
        <PrintButton />
      </div>

      {data.rankings.map((group) => (
        <div
          key={group.code}
          className="mb-4 print:mb-2 print:break-inside-avoid"
        >
          <h2 className="text-lg font-semibold mb-1.5 print:text-base print:mb-1 print:bg-gray-100 print:p-0.5">
            {group.name} ({group.code}) - {group.count} Students
          </h2>
          <div className="overflow-x-auto print:overflow-visible">
            <Table className="border border-gray-300 print:border-collapse text-sm print:text-xs">
              <TableHeader className="bg-gray-100 print:bg-gray-100">
                <TableRow>
                  <TableHead className="text-center print:border print:py-0.5 border-r w-[110px]">
                    Student ID
                  </TableHead>
                  <TableHead className="text-left print:border px-2 print:py-0.5 border-r">
                    Name
                  </TableHead>
                  <TableHead className="text-right print:border px-2 print:py-0.5 border-r w-[60px]">
                    Intake
                  </TableHead>
                  <TableHead className="text-right print:border px-2 print:py-0.5 border-r w-[60px]">
                    Section
                  </TableHead>
                  <TableHead className="text-center print:border px-2 print:py-0.5 border-r w-[100px]">
                    Phone
                  </TableHead>
                  <TableHead className="text-center print:border px-2 print:py-0.5 w-[120px]">
                    Signature
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.students.map((student) => (
                  <TableRow key={student.id} className="print:text-xs">
                    <CopyableCell
                      value={student.id}
                      className="text-center print:border print:py-0.5 border-r"
                    />
                    <CopyableCell
                      value={student.name}
                      className="text-left print:border px-2 print:py-0.5 border-r"
                    />
                    <CopyableCell
                      value={student.intake}
                      className="text-right  print:border px-2 print:py-0.5 border-r"
                    />
                    <CopyableCell
                      value={student.section}
                      className="text-right  print:border px-2 print:py-0.5 border-r"
                    />
                    <CopyableCell
                      value={student.phone}
                      className="text-center print:border px-2 print:py-0.5 border-r"
                    />
                    <TableCell className="text-center print:border px-2 print:py-0.5 h-7 print:h-8">
                      {/* Empty cell for signature */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
