import { getCourseRankings } from "../actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  const { totalStudents, rankings } = await getCourseRankings();

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <main className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          Course Rankings
        </h1>
        <p className="text-gray-600 text-center mb-2">
          Showing the number of students who have submitted applications for each course.
          Click on a course to see the list of students.
        </p>
        <p className="text-lg font-semibold text-center mb-8">
          Total Students Submitted: {totalStudents}
        </p>

        <div className="space-y-4">
          {rankings.map((course: CourseRanking) => (
            <Accordion key={course.code} type="single" collapsible>
              <AccordionItem value={course.code}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">
                      {course.code} - {course.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {course.count} students
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Intake</TableHead>
                        <TableHead>Section</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course.students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.intake}</TableCell>
                          <TableCell>{student.section}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </main>
    </div>
  );
} 