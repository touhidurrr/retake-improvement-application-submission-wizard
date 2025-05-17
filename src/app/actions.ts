"use server";

import { db } from "@/db";
import { sanitizeString } from "@/lib/utils";
import { cookies } from "next/headers";
import { createHash } from "crypto";

if (!process.env.ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD environment variable is not set!');
}

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

interface CourseRankingsOptions {
  includePhone?: boolean;
}

function generateAuthToken() {
  const timestamp = Date.now();
  const secret = process.env.ADMIN_PASSWORD || "";
  return createHash("sha256")
    .update(`${timestamp}:${secret}`)
    .digest("hex");
}

export async function checkAuth() {
  if (!process.env.ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD environment variable is not set!');
    return false;
  }

  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth");
  
  if (!authCookie?.value) return false;
  
  const [timestamp, token] = authCookie.value.split(":");
  const now = Date.now();
  
  // Check if token is expired (1 hour)
  if (now - parseInt(timestamp) > 60 * 60 * 1000) {
    return false;
  }
  
  // Validate token
  const expectedToken = createHash("sha256")
    .update(`${timestamp}:${process.env.ADMIN_PASSWORD}`)
    .digest("hex");
    
  return token === expectedToken;
}

export async function authenticate(password: string) {
  if (password === process.env.ADMIN_PASSWORD) {
    const timestamp = Date.now();
    const token = generateAuthToken();
    const cookieStore = await cookies();
    
    cookieStore.set("admin_auth", `${timestamp}:${token}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
    });
    return true;
  }
  return false;
}

export async function getCourseRankings({ includePhone = false }: CourseRankingsOptions = {}) {
  try {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      includePhone = false;
    }

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
          ...(includePhone ? { phone: 1 } : {}),
        },
        {
          sort: { createdAt: 1 },
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
          phone?: string;
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
          ...(includePhone ? { phone: student.phone } : {}),
        });
      }
    }

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
