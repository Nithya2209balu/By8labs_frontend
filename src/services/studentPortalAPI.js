import axios from 'axios';

const STUDENT_API_URL = 'https://student-portal-znxr.onrender.com/api';

// Separate token key so it doesn't collide with the HR backend token
const TOKEN_KEY = 'student_portal_token';

export const getStudentPortalToken = () => localStorage.getItem(TOKEN_KEY);
export const setStudentPortalToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearStudentPortalToken = () => localStorage.removeItem(TOKEN_KEY);

// Create axios instance for Student Portal
const studentApi = axios.create({
    baseURL: STUDENT_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Attach student portal token (not HR token)
studentApi.interceptors.request.use(
    (config) => {
        const token = getStudentPortalToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

studentApi.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

// Auth
export const portalAuthAPI = {
    login: (data) => studentApi.post('/auth/login', data),
};

// 1) Dashboard
export const dashboardAPI = {
    getCounts: () => studentApi.get('/dashboard/counts'),
};

// 2) Admin
export const adminStudentAPI = {
    getAllStudents: () => studentApi.get('/admin/students'),
    approveStudent: (id) => studentApi.patch(`/admin/students/${id}/approve`),
    rejectStudent: (id) => studentApi.patch(`/admin/students/${id}/reject`),
};

// 3) Courses
export const courseAPI = {
    getCategories: () => studentApi.get('/courses/categories'),
    getAllCourses: () => studentApi.get('/courses'),
    getCourseAbout: (id) => studentApi.get(`/courses/${id}/about`),
    enrollCourse: (id) => studentApi.post(`/courses/${id}/enroll`),
    getCourseLessons: (id) => studentApi.get(`/courses/${id}/lessons`),
    
    // Doubts
    getDoubts: (id) => studentApi.get(`/courses/${id}/doubts`),
    postDoubt: (id, data) => studentApi.post(`/courses/${id}/doubts`, data),
    
    // Notes
    getNotes: (id) => studentApi.get(`/courses/${id}/notes`),
    postNote: (id, data) => studentApi.post(`/courses/${id}/notes`, data),

    // Quizzes & MCQs
    getLessonMCQs: (lessonId) => studentApi.get(`/courses/lessons/${lessonId}/mcq`),
    submitQuizScore: (lessonId, data) => studentApi.post(`/courses/lessons/${lessonId}/quiz-score`, data),
};

// 4) Attendance
export const attendanceAPI = {
    getSummary: () => studentApi.get('/attendance/summary'),
    getMyAttendance: () => studentApi.get('/attendance'),
};

// 5) Leaderboard
export const leaderboardAPI = {
    getLeaderboard: () => studentApi.get('/leaderboard'),
};

// 6) Notifications
export const notificationAPI = {
    getNotifications: () => studentApi.get('/notifications'),
};

// 7) Enrollments
export const enrollmentAPI = {
    getMyCourses: () => studentApi.get('/enrollments/my-courses'),
};

export default studentApi;
