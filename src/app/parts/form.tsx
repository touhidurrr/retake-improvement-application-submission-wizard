"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getCourses, saveStudent, searchStudent } from "../actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  id: z.string().min(10, {
    message: "Student ID must be at least 10 characters.",
  }),
});

const sanitizeString = (str: string) => str.replaceAll(/\s+/g, " ").trim();

const studentFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  intake: z.coerce.number().min(1, {
    message: "Intake must be a non-zero positive integer.",
  }),
  section: z.string().min(1, {
    message: "Section is required.",
  }),
  phone: z.string().min(11, {
    message: "Phone number must be at least 11 characters.",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .optional()
    .or(z.literal("")),
  courseCodes: z.array(z.string()).min(1, {
    message: "At least one course code is required.",
  }),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

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

export function IDSearchForm() {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      const courseList = await getCourses();
      setCourses(courseList);
    };
    fetchCourses();
  }, []);

  // Search form
  const searchForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
    },
  });

  // Student form
  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      intake: 0,
      section: "",
      phone: "",
      email: "",
      courseCodes: [],
    },
  });

  // Handle search
  async function onSearch(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const foundStudent = await searchStudent(values.id);
      if (foundStudent) {
        setStudent(foundStudent);
        studentForm.reset({
          name: sanitizeString(foundStudent.name),
          intake: foundStudent.intake,
          section: sanitizeString(foundStudent.section),
          phone: sanitizeString(foundStudent.phone),
          email: sanitizeString(foundStudent.email || ""),
          courseCodes: foundStudent.courseCodes,
        });
      } else {
        setStudent(null);
        studentForm.reset();
      }
      setHasSearched(true);
    } catch (error) {
      console.error("Error searching student:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle student form submission
  async function onSubmitStudent(values: StudentFormData) {
    setIsLoading(true);
    try {
      const studentData: Student = {
        _id: searchForm.getValues("id"),
        ...values,
      };

      const updatedStudent = await saveStudent(studentData);
      if (updatedStudent) {
        setStudent(updatedStudent);
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error("Error saving student:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle course selection
  const handleCourseSelect = (courseCode: string) => {
    const currentCodes = studentForm.getValues("courseCodes");
    if (!currentCodes.includes(courseCode)) {
      studentForm.setValue("courseCodes", [...currentCodes, courseCode]);
    }
  };

  // Handle course removal
  const handleCourseRemove = (courseCode: string) => {
    const currentCodes = studentForm.getValues("courseCodes");
    studentForm.setValue(
      "courseCodes",
      currentCodes.filter((code) => code !== courseCode),
    );
  };

  return (
    <div className="space-y-8 w-full max-w-md">
      <Form {...searchForm}>
        <form
          onSubmit={searchForm.handleSubmit(onSearch)}
          className="space-y-4"
        >
          <FormField
            control={searchForm.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your student ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </form>
      </Form>

      {hasSearched && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">
            {student ? "Update Information" : "Submit New Application"}
          </h2>
          {!student && (
            <p className="text-gray-600 mb-4">
              No existing application found. Please fill out the form below to
              submit your application.
            </p>
          )}
          <Form {...studentForm}>
            <form
              onSubmit={studentForm.handleSubmit(onSubmitStudent)}
              className="space-y-4"
            >
              <FormField
                control={studentForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={studentForm.control}
                name="intake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intake</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your intake" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={studentForm.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your section" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={studentForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={studentForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={studentForm.control}
                name="courseCodes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Codes</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="w-full justify-between"
                            >
                              Select courses...
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command
                              filter={(value, search) => {
                                const courseText = value.toLowerCase();
                                return courseText.includes(search.toLowerCase())
                                  ? 1
                                  : 0;
                              }}
                            >
                              <CommandInput placeholder="Search courses..." />
                              <CommandEmpty>No course found.</CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-auto">
                                {courses.map((course) => (
                                  <CommandItem
                                    key={course.code}
                                    value={`${course.code} ${course.name}`}
                                    onSelect={() => {
                                      handleCourseSelect(course.code);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value.includes(course.code)
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {course.code} - {course.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((code) => {
                            const course = courses.find((c) => c.code === code);
                            return (
                              <Badge
                                key={code}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {course ? `${code} - ${course.name}` : code}
                                <button
                                  type="button"
                                  onClick={() => handleCourseRemove(code)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : student
                    ? "Update Information"
                    : "Submit Application"}
              </Button>
            </form>
          </Form>
        </div>
      )}

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
            <DialogDescription>
              {student
                ? "Your information has been updated successfully."
                : "Your application has been submitted successfully."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              You can view the current rankings and see how many students have
              submitted for each course.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSuccessDialog(false)}
              >
                Close
              </Button>
              <Button asChild>
                <Link href="/ranking">View Rankings</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
