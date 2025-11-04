import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Course } from '../../types';
import PrerequisitesSyllabus from '../PrerequisitesSyllabus';
import PaymentQR from '../PaymentQR.jpeg';

export const CourseEnrollmentPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setError('Course ID not found');
        setLoading(false);
        return;
      }

      try {
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleBack = () => {
    navigate('/courses');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error || 'Course not found'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <PrerequisitesSyllabus
      courseTitle={course.title}
      objectives={[
        'To provide the basics and fundamentals of the python programming language and introduce algorithmic skills through programming constructs',
        'To impart python collections for efficient data handling and processing and inculcate modular and recursive programming approaches for developing software applications',
        'To teach python libraries for data analysis and manipulations'
      ]}
      syllabus={[
        {
          module: 'Module 1: Introduction to Problem Solving and Python Basics – 1 Hours',
          topics: [
            'Problem analysis, flowchart, pseudocode',
            'Introduction to Python and IDE setup (VS Code)',
            'Variables, Data Types (Numeric, Boolean, String)',
            'Type Casting, Basic Input/Output',
            'Operators & Expressions, Math Functions',
            'Project 1: Display Program (e.g., Print Student Info, Sum of 2 Numbers)'
          ]
        },
        {
          module: 'Module 2: Control Constructs and Problem-Solving Approaches – 3 Hours',
          topics: [
            'Conditional statements: if, else, elif',
            'Logical operators',
            'Looping: while, for, nested loops',
            'Loop control: break, continue, pass',
            'Problem solving approaches: Top-down, Bottom-up, Divide & Conquer (Basic)',
            'Mini Projects: Number Guessing Game, Simple Countdown Timer',
            'Project 2: Simple Calculator (addition, subtraction, multiplication, division)',
            'Projects: Credit Card Validator, Quiz Game'
          ]
        },
        {
          module: 'Module 3: Data Organization with Collections – 3 Hours',
          topics: [
            'Strings, Lists, Tuples, Sets, Dictionaries',
            'Indexing & Data Access',
            'Iterators',
            'Comprehensions: List, Dictionary, Set',
            'Random module & applications',
            'Mini Projects: Rock–Paper–Scissors, Simple Quiz Game',
            'Project 3: Banking Program (Deposit, Withdraw, Balance)'
          ]
        },
        {
          module: 'Module 4: Functions, Recursion, and Functional Programming – 2 Hours',
          topics: [
            'Functions: Definition, Call, Return Values',
            'Parameters & Arguments (Positional, Keyword, Default, Arbitrary)',
            'Scope: Local, Global, Nonlocal',
            'Recursion: Factorial, Fibonacci (Basic Logic and Explain what is recursion and Fibonacci)',
            'Modular programming: Importing modules, Custom modules',
            'Intermediate Projects: Hangman Game, Dice Roller…'
          ]
        },
        {
          module: 'Module 5: Error Handling and File Operations – 2 Hours (Not Recommended)',
          topics: [
            'Exception handling: try, except, finally, raising exceptions',
            'File handling basics: Open, Read, Write, Close',
            'Menu-driven programs using files',
            'Projects: Student Grade Manager, Library Management System'
          ]
        },
        {
          module: 'Module 6: Mini Project – 2 hours',
          topics: [
            'Alien Shooter',
            'Sudoku'
          ]
        }
      ]}
      outcomes={[
        'Identify appropriate algorithmic approach, data representation, control constructs in developing software solutions for solving real-world problems',
        'Inculcate data handling techniques using python collections and modular programming strategies for developing multi-disciplinary software applications',
        'Idealize the importance of python libraries for handling, manipulating and analyzing multi-faceted real world problem domains'
      ]}
      paymentQRUrl={PaymentQR}
      contactNumber="+91-9444279287"
      onBack={handleBack}
    />
  );
};
