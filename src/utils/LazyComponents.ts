import { lazy } from 'react';

// Lazy load components for better performance
export const LandingPage = lazy(() => import('../components/LandingPage').then(module => ({ default: module.LandingPage })));
export const LoginPage = lazy(() => import('../components/LoginPage').then(module => ({ default: module.LoginPage })));
export const RegisterPage = lazy(() => import('../components/RegisterPage').then(module => ({ default: module.RegisterPage })));
export const CourseDetailPage = lazy(() => import('../components/CourseDetailPage').then(module => ({ default: module.CourseDetailPage })));
export const CoursesPage = lazy(() => import('../components/CoursesPage').then(module => ({ default: module.CoursesPage })));
export const StudentDashboard = lazy(() => import('../components/StudentDashboard').then(module => ({ default: module.StudentDashboard })));
export const InstructorDashboard = lazy(() => import('../components/InstructorDashboard').then(module => ({ default: module.InstructorDashboard })));
export const LessonViewer = lazy(() => import('../components/LessonViewer').then(module => ({ default: module.LessonViewer })));
export const CourseReviews = lazy(() => import('../components/CourseReviews').then(module => ({ default: module.CourseReviews })));
export const PrivacyPolicyPage = lazy(() => import('../components/PrivacyPolicyPage').then(module => ({ default: module.PrivacyPolicyPage })));