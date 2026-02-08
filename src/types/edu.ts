export interface Course {
    code: string;
    title: string;
    grade: string; // "A+", "85", "Pass"
    credits: number; // e.g. 0.5 or 1.0
    term?: string; // "Fall 2023"
}

export interface Semester {
    term: string; // "Fall 2023"
    year: number;
    courses: Course[];
    semesterGpa?: number;
}

export interface Transcript {
    id: string;
    studentName?: string;
    university?: string;
    program?: string;
    cgpa?: number; // Cumulative GPA if found
    semesters: Semester[];
    rawText?: string;
    dateUploaded: number;
}
