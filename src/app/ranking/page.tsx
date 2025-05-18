import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { connection } from "next/server";
import { getCourseRankings } from "../actions";
import { BackToHome } from "../parts/back-to-home";
import { Copyright } from "../parts/copyright";
import { WhatsAppButton } from "../parts/whatsapp-button";

interface CourseRanking {
  code: string;
  name: string;
  count: number;
  students: Array<{
    id: string;
    name: string;
    intake: number;
    section: string;
  }>;
}

export default async function RankingPage() {
  await connection();
  const { totalStudents, rankings } = await getCourseRankings();

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <main className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-8">
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex justify-between items-center">
            <BackToHome />
            <WhatsAppButton />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center">
            Course Rankings
          </h1>
        </div>
        <p className="text-gray-600 text-center mb-2 text-sm sm:text-base">
          Showing the number of students who have submitted applications for
          each course. Click on a course to see the list of students.
        </p>
        <p className="text-base sm:text-lg font-semibold text-center mb-6 sm:mb-8">
          Total Students Submitted: {totalStudents}
        </p>

        <div className="space-y-4">
          {rankings.map((course: CourseRanking) => (
            <Accordion key={course.code} type="single" collapsible>
              <AccordionItem value={course.code}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full pr-4 gap-1 sm:gap-0">
                    <span className="font-medium text-left">
                      {course.code} - {course.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {course.count} students
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-[400px] sm:min-w-[480px] px-4 sm:px-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">
                              Student ID
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="w-[60px] text-center">
                              Intake
                            </TableHead>
                            <TableHead className="hidden sm:table-cell w-[60px] text-center">
                              Section
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {course.students.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-mono text-sm">
                                {student.id}
                              </TableCell>
                              <TableCell className="truncate max-w-[200px]">
                                {student.name}
                              </TableCell>
                              <TableCell className="text-center">
                                {student.intake}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-center">
                                {student.section}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </main>
      <div className="py-2">
        <Copyright />
      </div>
    </div>
  );
}
