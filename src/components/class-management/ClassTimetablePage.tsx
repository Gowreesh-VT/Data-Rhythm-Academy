import React from 'react';
import { ClassTimetable } from './ClassTimetable';

interface ClassTimetablePageProps {
  onNavigate: (path: string) => void;
}

export const ClassTimetablePage: React.FC<ClassTimetablePageProps> = ({ onNavigate }) => {
  // Get user ID from context or props
  const userId = 'current-user-id'; // Replace with actual user ID from context

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <ClassTimetable 
        onNavigate={onNavigate}
        userId={userId}
      />
    </div>
  );
};