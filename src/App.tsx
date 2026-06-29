/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, HelpCircle, Armchair, Ban, GraduationCap } from 'lucide-react';
import { SeatInfo, ArrangementStats } from './types';
import StatsBoard from './components/StatsBoard';
import ConfigPanel from './components/ConfigPanel';
import ClassroomGrid from './components/ClassroomGrid';

export default function App() {
  // State variables
  const [studentCount, setStudentCount] = useState<number>(15);
  const [excludedSeats, setExcludedSeats] = useState<number[]>([]);
  const [assignedSeats, setAssignedSeats] = useState<(string | null)[]>(Array(20).fill(null));
  const [isAssigned, setIsAssigned] = useState<boolean>(false);

  // Stats calculation
  const stats = useMemo<ArrangementStats>(() => {
    const totalSeats = 20;
    const excludedCount = excludedSeats.length;
    const availableCount = totalSeats - excludedCount;
    const autoEmptyCount = Math.max(0, availableCount - studentCount);

    return {
      totalSeats,
      studentCount,
      excludedCount,
      availableCount,
      autoEmptyCount,
    };
  }, [studentCount, excludedSeats]);

  // Handle student count change
  const handleStudentCountChange = (count: number) => {
    setStudentCount(count);
    setIsAssigned(false);
    setAssignedSeats(Array(20).fill(null));

    // Automatically trim excluded seats if they exceed the max allowed for the new student count
    const maxAllowedExcluded = 20 - count;
    if (excludedSeats.length > maxAllowedExcluded) {
      setExcludedSeats((prev) => prev.slice(0, maxAllowedExcluded));
    }
  };

  // Toggle seat exclusion
  const handleToggleExclude = (index: number) => {
    if (isAssigned) return;

    setExcludedSeats((prev) => {
      if (prev.includes(index)) {
        // Remove from excluded list
        return prev.filter((i) => i !== index);
      } else {
        // Add to excluded list if we haven't reached the limit
        const maxAllowedExcluded = 20 - studentCount;
        if (prev.length < maxAllowedExcluded) {
          return [...prev, index];
        }
        return prev;
      }
    });
  };

  // Assign Seats logic (Random Shuffling)
  const handleAssign = () => {
    // Generate list of students: ["학생 1", "학생 2", ..., "학생 N"]
    const students = Array.from({ length: studentCount }, (_, i) => `학생 ${i + 1}`);

    // Find all indices that are NOT excluded
    const availableIndices = Array.from({ length: 20 }, (_, i) => i)
      .filter((index) => !excludedSeats.includes(index));

    // Shuffle the available indices using Fisher-Yates algorithm
    const shuffledAvailable = [...availableIndices];
    for (let i = shuffledAvailable.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledAvailable[i], shuffledAvailable[j]] = [shuffledAvailable[j], shuffledAvailable[i]];
    }

    // Initialize 20 seats as empty/null
    const result: (string | null)[] = Array(20).fill(null);

    // Assign students to the first 'studentCount' shuffled available spots
    for (let i = 0; i < students.length; i++) {
      const targetIndex = shuffledAvailable[i];
      result[targetIndex] = students[i];
    }

    setAssignedSeats(result);
    setIsAssigned(true);
  };

  // Reset to default configuration
  const handleReset = () => {
    setStudentCount(15);
    setExcludedSeats([]);
    setAssignedSeats(Array(20).fill(null));
    setIsAssigned(false);
  };

  // Map state to full seat structure for the grid
  const seats = useMemo<SeatInfo[]>(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const row = Math.floor(i / 5) + 1;
      const col = (i % 5) + 1;
      return {
        index: i,
        seatNumber: i + 1,
        row,
        col,
        isExcluded: excludedSeats.includes(i),
        studentName: isAssigned ? assignedSeats[i] : null,
      };
    });
  }, [excludedSeats, assignedSeats, isAssigned]);

  return (
    <div id="main-container" className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <header id="header" className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl text-white shadow-md shadow-emerald-100">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
                자리 바꾸기 프로그램
              </h1>
              <p className="text-sm font-medium text-slate-500">
                선생님과 학생들을 위한 직관적이고 현대적인 자리 바꾸기 도구
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-white border border-slate-100 shadow-sm px-3 py-1.5 rounded-full">
              오프라인 단독형
            </span>
          </div>
        </header>

        {/* Real-time Stats Board */}
        <StatsBoard stats={stats} />

        {/* Main Work Area */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls & Rules (Left Column) */}
          <div className="lg:col-span-4 h-full">
            <ConfigPanel
              studentCount={studentCount}
              onStudentCountChange={handleStudentCountChange}
              isAssigned={isAssigned}
              onAssign={handleAssign}
              onReset={handleReset}
              stats={stats}
            />
          </div>

          {/* Seating Grid (Right Column) */}
          <div className="lg:col-span-8">
            <ClassroomGrid
              seats={seats}
              isAssigned={isAssigned}
              onToggleExclude={handleToggleExclude}
              studentCount={studentCount}
              maxAllowedExcluded={20 - studentCount}
            />
          </div>
        </main>

        {/* Footer info */}
        <footer id="footer" className="text-center text-xs text-slate-400 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} 자리 바꾸기 프로그램. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="hover:text-slate-600 transition-colors cursor-help flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>데이터는 로컬 메모리에만 저장되며 저장하지 않습니다.</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
