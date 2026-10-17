export interface Course {
  code: string;
  title: string;
  units: number;
  semester: string;
}

export type CourseDoc = Pick<
  Course,
  "code" | "title" | "units" | "semester"
>;

export interface Session {
  id?: string;
  subject: string;
  durationMinutes: number;
  ratePerHour: number;
  title?: string;
  description?: string;
}

export type SessionDoc = Pick<
  Session,
  "subject" | "durationMinutes" | "ratePerHour"
>;
