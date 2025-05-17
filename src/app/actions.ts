"use server";

import { db } from "@/db";
import { sanitizeString } from "@/lib/utils";

interface Student {
  _id: string;
  name: string;
  intake: number;
  section: string;
  phone: string;
  email?: string;
  courseCodes: string[];
}

interface Course {
  code: string;
  name: string;
}

const hiddenEmail = "email-hidden-for-privacy@courseimprove.studio";
const hiddenPhone = "01234567890";

export async function getCourses(): Promise<Course[]> {
  try {
    const courses = await db.CourseCode.find({}, { _id: 0, code: 1, name: 1 });
    return courses.map((course) => ({
      code: course.code,
      name: course.name,
    }));
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export async function searchStudent(id: string): Promise<Student | null> {
  try {
    const foundStudent = await db.RetakeSubmission.findById(id, {
      phone: 0,
      email: 0,
    });
    if (!foundStudent) return null;

    return {
      _id: foundStudent._id.toString(),
      name: foundStudent.name,
      intake: foundStudent.intake,
      section: foundStudent.section,
      phone: hiddenPhone,
      email: hiddenEmail,
      courseCodes: foundStudent.courseCodes,
    };
  } catch (error) {
    console.error("Error searching student:", error);
    return null;
  }
}

export async function saveStudent(
  studentData: Student,
): Promise<Student | null> {
  try {
    const { _id, ...update } = studentData;

    if (update.email !== undefined && update.email.trim() === "") {
      update.email = undefined;
      //@ts-expect-error update query does not need to match types
      update.$unset = { email: 1 };
    } else if (update.email === hiddenEmail) {
      update.email = undefined;
    }

    if (update.phone === hiddenPhone) {
      //@ts-expect-error update query does not need to match types
      update.phone = undefined;
    }

    // sanitize data
    if (update.name) update.name = sanitizeString(update.name);
    if (update.phone) update.phone = sanitizeString(update.phone);
    if (update.email) update.email = sanitizeString(update.email);
    if (update.section)
      update.section = sanitizeString(update.section.replace(/^\s*0/, ""));

    const updatedStudent = await db.RetakeSubmission.findByIdAndUpdate(
      { _id },
      update,
      { upsert: true, new: true },
    );

    if (!updatedStudent) return null;

    return {
      _id: updatedStudent._id.toString(),
      name: updatedStudent.name,
      intake: updatedStudent.intake,
      section: updatedStudent.section,
      phone: updatedStudent.phone,
      email: updatedStudent.email,
      courseCodes: updatedStudent.courseCodes,
    };
  } catch (error) {
    console.error("Error saving student:", error);
    return null;
  }
}

export async function getCourseRankings() {
  try {
    const [courses, students] = await Promise.all([
      db.CourseCode.find({}),
      db.RetakeSubmission.find(
        {},
        {
          _id: 1,
          name: 1,
          intake: 1,
          section: 1,
          courseCodes: 1,
        },
      ),
    ]);

    const courseMap = new Map(
      courses.map((course) => [course.code, course.name]),
    );

    // Create a map to store course rankings
    const courseRankings = new Map<
      string,
      {
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
    >();

    // Process each student's course selections
    for (const student of students) {
      for (const courseCode of student.courseCodes) {
        if (!courseRankings.has(courseCode)) {
          courseRankings.set(courseCode, {
            code: courseCode,
            name: courseMap.get(courseCode) || courseCode,
            count: 0,
            students: [],
          });
        }

        const ranking = courseRankings.get(courseCode)!;
        ranking.count++;
        ranking.students.push({
          id: student._id.toString(),
          name: student.name,
          intake: student.intake,
          section: student.section,
        });
      }
    }

    // Convert to array and sort by count
    return {
      totalStudents: students.length,
      rankings: Array.from(courseRankings.values()).sort(
        (a, b) => b.count - a.count,
      ),
    };
  } catch (error) {
    console.error("Error fetching course rankings:", error);
    return { totalStudents: 0, rankings: [] };
  }
}
