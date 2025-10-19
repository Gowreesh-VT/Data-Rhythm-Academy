import { lazy } from 'react';

// Lazy load components for better performance
export const LandingPage = lazy(() => import('../components/pages/LandingPage').then(module => ({ default: module.LandingPage })));
export const LoginPage = lazy(() => import('../components/auth/LoginPage').then(module => ({ default: module.LoginPage })));
export const RegisterPage = lazy(() => import('../components/auth/RegisterPage').then(module => ({ default: module.RegisterPage })));
export const CourseDetailPage = lazy(() => import('../components/course/CourseDetailPage').then(module => ({ default: module.CourseDetailPage })));
export const CoursesPage = lazy(() => import('../components/course/CoursesPage').then(module => ({ default: module.CoursesPage })));
export const StudentDashboard = lazy(() => import('../components/dashboard/StudentDashboard').then(module => ({ default: module.StudentDashboard })));
export const InstructorDashboard = lazy(() => import('../components/dashboard/InstructorDashboard').then(module => ({ default: module.InstructorDashboard })));
export const LessonViewer = lazy(() => import('../components/course/LessonViewer').then(module => ({ default: module.LessonViewer })));
export const CourseReviews = lazy(() => import('../components/course/CourseReviews').then(module => ({ default: module.CourseReviews })));
export const PrivacyPolicyPage = lazy(() => import('../components/pages/PrivacyPolicyPage').then(module => ({ default: module.PrivacyPolicyPage })));