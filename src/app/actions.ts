"use server";

import { db } from "@/db";
import { Document } from "mongoose";

interface Student {
  _id: string;
  name: string;
  intake: number;
  section: string;
  phone: string;
  email?: string;
  courseCodes: string[];
}

interface RetakeSubmissionDocument extends Document {
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

export async function getCourses(): Promise<Course[]> {
  try {
    const courses = await db.CourseCode.find().lean();
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
    const foundStudent = (await db.RetakeSubmission.findById(
      id,
    ).lean()) as RetakeSubmissionDocument | null;
    if (!foundStudent) return null;

    return {
      _id: foundStudent._id,
      name: foundStudent.name,
      intake: foundStudent.intake,
      section: foundStudent.section,
      phone: foundStudent.phone,
      email: foundStudent.email,
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
      //@ts-expect-error valid mongodb update query
      update.$unset = { email: 1 };
    }
    const updatedStudent = await db.RetakeSubmission.findByIdAndUpdate(
      { _id },
      update,
      { upsert: true, new: true },
    );

    return {
      _id: updatedStudent._id,
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
