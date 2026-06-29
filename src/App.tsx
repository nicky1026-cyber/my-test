/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, HelpCircle, Armchair, Ban, GraduationCap, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SeatInfo, Student, ArrangementStats } from './types';
import StatsBoard from './components/StatsBoard';
import ConfigPanel from './components/ConfigPanel';
import ClassroomGrid from './components/ClassroomGrid';
import { fetchClassroomData, saveClassroomData } from './lib/classroomService';

export default function App() {
  // --- States ---
  const [students, setStudents] = useState<Student[]>([]);
  const [excludedSeats, setExcludedSeats] = useState<number[]>([]);
  
  // fixedSeats maps seatIndex (0-19) to studentId (string)
  const [fixedSeats, setFixedSeats] = useState<{ [seatIndex: number]: string }>({});
  
  // assignedSeats stores the name of the student in each of the 20 seats, or null
  const [assignedSeats, setAssignedSeats] = useState<(string | null)[]>(Array(20).fill(null));
  const [isAssigned, setIsAssigned] = useState<boolean>(false);

  // Loading & Action states
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isSavingStudents, setIsSavingStudents] = useState<boolean>(false);
  const [isSavingSeating, setIsSavingSeating] = useState<boolean>(false);
  const [isLoadingSeating, setIsLoadingSeating] = useState<boolean>(false);
  const [isFixedMode, setIsFixedMode] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // --- Toast Trigger Helper ---
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  // --- Initial Load from Firestore ---
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchClassroomData();
        if (data) {
          // 1. Load Students list if present, else set default
          if (data.students && data.students.length > 0) {
            setStudents(data.students);
          } else {
            // Default 15 students
            const defaultStudents = Array.from({ length: 15 }, (_, i) => ({
              id: `student-${Date.now()}-${i}`,
              name: `학생 ${i + 1}`,
            }));
            setStudents(defaultStudents);
          }

          // 2. Load Excluded seats
          if (data.excludedSeats) {
            setExcludedSeats(data.excludedSeats);
          }

          // 3. Load Fixed seats (Convert string keys back to numbers)
          if (data.fixedSeats) {
            const parsedFixed: { [seatIndex: number]: string } = {};
            Object.entries(data.fixedSeats).forEach(([k, v]) => {
              parsedFixed[Number(k)] = v;
            });
            setFixedSeats(parsedFixed);
          }
        } else {
          // If Firestore is empty, initialize with default students
          const defaultStudents = Array.from({ length: 15 }, (_, i) => ({
            id: `student-init-${i}`,
            name: `학생 ${i + 1}`,
          }));
          setStudents(defaultStudents);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        // Fallback to local defaults if DB load fails
        const defaultStudents = Array.from({ length: 15 }, (_, i) => ({
          id: `student-fail-${i}`,
          name: `학생 ${i + 1}`,
        }));
        setStudents(defaultStudents);
        alert('데이터베이스 연결 실패로 기본 데이터로 시작합니다. 인터넷 상태를 확인해 주세요.');
      } finally {
        setIsInitialLoading(false);
      }
    }
    loadData();
  }, []);

  // --- Stats Calculation ---
  const stats = useMemo<ArrangementStats>(() => {
    const totalSeats = 20;
    const excludedCount = excludedSeats.length;
    const fixedCount = Object.keys(fixedSeats).length;
    const availableCount = totalSeats - excludedCount;
    const autoEmptyCount = Math.max(0, availableCount - students.length);

    return {
      totalSeats,
      studentCount: students.length,
      excludedCount,
      fixedCount,
      availableCount,
      autoEmptyCount,
    };
  }, [students, excludedSeats, fixedSeats]);

  // --- Student List Management ---
  const handleAddStudent = () => {
    if (students.length >= 20) {
      alert('학생 인원은 교실 크기(최대 20명)를 초과할 수 없습니다.');
      return;
    }
    // Find next available student number for name suggestion
    const nextNum = students.length + 1;
    const newStudent: Student = {
      id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `학생 ${nextNum}`,
    };
    setStudents((prev) => [...prev, newStudent]);
    setIsAssigned(false);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setIsAssigned(false);

    // If this deleted student was fixed to a seat, remove that fixed setting
    setFixedSeats((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((key) => {
        const idx = Number(key);
        if (copy[idx] === id) {
          delete copy[idx];
        }
      });
      return copy;
    });
  };

  const handleUpdateStudentName = (id: string, name: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
  };

  // --- Firebase DB: Save Student List ---
  const handleSaveStudents = async () => {
    if (students.length === 0) return;
    setIsSavingStudents(true);
    try {
      // Save student list, current excluded seats, and current fixed seats
      // Firestore doesn't support numeric map keys, so convert keys to string
      const stringifiedFixed: { [seatIndex: string]: string } = {};
      Object.entries(fixedSeats).forEach(([k, v]) => {
        stringifiedFixed[k] = v as string;
      });

      await saveClassroomData({
        students,
        excludedSeats,
        fixedSeats: stringifiedFixed,
      });
      showToast('학생 명단과 고정석 설정이 DB에 저장되었습니다!');
    } catch (err) {
      console.error(err);
      alert('학생 명단 저장에 실패했습니다. 파이어베이스 설정을 확인해 주세요.');
    } finally {
      setIsSavingStudents(false);
    }
  };

  // --- Toggle Exclude Seat ---
  const handleToggleExclude = (index: number) => {
    if (isAssigned) return;

    // Check if this seat is already a fixed seat
    if (fixedSeats[index]) {
      // Release the lock first
      setFixedSeats((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    }

    setExcludedSeats((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        const maxAllowedExcluded = 20 - students.length;
        if (prev.length < maxAllowedExcluded) {
          return [...prev, index];
        }
        return prev;
      }
    });
  };

  // --- Fixed Seat Selector ---
  const handleSelectFixedStudent = (seatIndex: number, studentId: string | null) => {
    if (studentId === null) {
      // Release lock for this seat
      setFixedSeats((prev) => {
        const copy = { ...prev };
        delete copy[seatIndex];
        return copy;
      });
    } else {
      // Assign studentId to this seat.
      // 1. Remove this student from any other seat they were fixed to (no double locking)
      setFixedSeats((prev) => {
        const copy = { ...prev };
        Object.keys(copy).forEach((key) => {
          const idx = Number(key);
          if (copy[idx] === studentId) {
            delete copy[idx];
          }
        });
        copy[seatIndex] = studentId;
        return copy;
      });
    }
    // Any change to config resets the current randomized active placement view
    setIsAssigned(false);
  };

  const handleUnlockSeat = (seatIndex: number) => {
    setFixedSeats((prev) => {
      const copy = { ...prev };
      delete copy[seatIndex];
      return copy;
    });
    setIsAssigned(false);
  };

  // --- Seating Shuffle Logic ---
  const handleAssign = () => {
    // 1. Sanity Check: Can we fit all students?
    const availableCount = 20 - excludedSeats.length;
    if (students.length > availableCount) {
      alert(`배치 불가능합니다!\n현재 전체 학생은 ${students.length}명인데, 제외석을 뺀 배치 공간은 ${availableCount}석뿐입니다. 제외석을 줄여주세요.`);
      return;
    }

    // Initialize layout of length 20
    const result: (string | null)[] = Array(20).fill(null);

    // 2. Map fixed student IDs to names, keeping track of who is already placed
    const placedStudentIds = new Set<string>();
    
    // Check if there are any invalid fixed configurations (e.g. fixed student no longer exists, or fixed on excluded seat)
    Object.entries(fixedSeats).forEach(([seatIdxStr, studentId]) => {
      const seatIdx = Number(seatIdxStr);
      const studentIdStr = studentId as string;
      
      // If seat is excluded, skip it
      if (excludedSeats.includes(seatIdx)) {
        return;
      }

      // Find the student
      const student = students.find((s) => s.id === studentIdStr);
      if (student) {
        result[seatIdx] = student.name;
        placedStudentIds.add(studentIdStr);
      }
    });

    // 3. Find all students that are NOT fixed
    const remainingStudents = students.filter((s) => !placedStudentIds.has(s.id));

    // 4. Find all seat indices that are NOT excluded AND NOT fixed
    const availableIndices = Array.from({ length: 20 }, (_, i) => i).filter((index) => {
      const isExcluded = excludedSeats.includes(index);
      const isFixed = fixedSeats[index] !== undefined;
      return !isExcluded && !isFixed;
    });

    // Double check if space is enough for non-fixed students
    if (remainingStudents.length > availableIndices.length) {
      alert('배치 공간이 부족합니다! 고정석 및 제외석 지정이 과도하여 남은 학생들을 배치할 자리가 없습니다.');
      return;
    }

    // 5. Shuffle remaining students using Fisher-Yates
    const shuffledRemaining = [...remainingStudents];
    for (let i = shuffledRemaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledRemaining[i], shuffledRemaining[j]] = [shuffledRemaining[j], shuffledRemaining[i]];
    }

    // 6. Place shuffled students into remaining available seats
    for (let i = 0; i < shuffledRemaining.length; i++) {
      const targetSeatIdx = availableIndices[i];
      result[targetSeatIdx] = shuffledRemaining[i].name;
    }

    setAssignedSeats(result);
    setIsAssigned(true);
    setIsFixedMode(false); // Turn off design mode so they see the result clearly
  };

  // --- Reset All Configs ---
  const handleReset = () => {
    if (window.confirm('모든 고정석과 제외석 설정을 비우고 초기 상태로 되돌리시겠습니까? (이름 명단은 유지됩니다)')) {
      setExcludedSeats([]);
      setFixedSeats({});
      setAssignedSeats(Array(20).fill(null));
      setIsAssigned(false);
      setIsFixedMode(false);
    }
  };

  // --- Seating Arrangement: Save and Load to DB ---
  const handleSaveSeating = async () => {
    if (!isAssigned) {
      alert('먼저 자리를 무작위로 배정한 후 저장할 수 있습니다.');
      return;
    }
    setIsSavingSeating(true);
    try {
      const stringifiedFixed: { [seatIndex: string]: string } = {};
      Object.entries(fixedSeats).forEach(([k, v]) => {
        stringifiedFixed[k] = v as string;
      });

      await saveClassroomData({
        savedAssignedSeats: assignedSeats,
        savedExcludedSeats: excludedSeats,
        savedFixedSeats: stringifiedFixed,
        savedIsAssigned: isAssigned,
      });
      showToast('현재 자리배치가 DB에 안전하게 보존되었습니다!');
    } catch (err) {
      console.error(err);
      alert('자리배치 저장에 실패했습니다. 네트워크 상태를 점검해 주세요.');
    } finally {
      setIsSavingSeating(false);
    }
  };

  const handleLoadSeating = async () => {
    setIsLoadingSeating(true);
    try {
      const data = await fetchClassroomData();
      if (data && data.savedIsAssigned) {
        // Load assigned seats
        if (data.savedAssignedSeats) {
          setAssignedSeats(data.savedAssignedSeats);
        }
        // Load excluded seats
        if (data.savedExcludedSeats) {
          setExcludedSeats(data.savedExcludedSeats);
        }
        // Load fixed seats
        if (data.savedFixedSeats) {
          const parsedFixed: { [seatIndex: number]: string } = {};
          Object.entries(data.savedFixedSeats).forEach(([k, v]) => {
            parsedFixed[Number(k)] = v;
          });
          setFixedSeats(parsedFixed);
        }
        // Load assignment status
        setIsAssigned(data.savedIsAssigned);
        setIsFixedMode(false);
        showToast('저장되어 있던 자리 배치를 성공적으로 불러왔습니다!');
      } else {
        alert('조회 실패: 저장된 자리배치 데이터가 존재하지 않습니다. 먼저 "현재 자리 저장" 버튼을 눌러 상태를 등록해 주세요.');
      }
    } catch (err) {
      console.error(err);
      alert('자리배치를 불러오는 중 오류가 발생했습니다. 데이터 연결을 점검해 주세요.');
    } finally {
      setIsLoadingSeating(false);
    }
  };

  // --- Map State to seat array for Classroom Grid ---
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
        isFixed: fixedSeats[i] !== undefined,
        studentName: isAssigned ? assignedSeats[i] : null,
      };
    });
  }, [excludedSeats, fixedSeats, assignedSeats, isAssigned]);

  // --- Loading screen on mount ---
  if (isInitialLoading) {
    return (
      <div id="loading-screen" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="p-4 bg-emerald-50 rounded-2xl animate-bounce text-emerald-600">
          <GraduationCap className="w-12 h-12" />
        </div>
        <div className="text-center">
          <p className="font-extrabold text-slate-800 text-lg">교실 데이터 불러오는 중...</p>
          <p className="text-xs text-slate-400 mt-1">Firebase Firestore 데이터베이스와 연결 중입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="main-container" className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <header id="header" className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="p-3 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl text-white shadow-md shadow-indigo-100">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
                자리 바꾸기 프로그램 <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">PRO (Firestore)</span>
              </h1>
              <p className="text-sm font-medium text-slate-500">
                선생님을 위한 클라우드 동기화 지원 자리 바꾸기 시스템
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-white border border-slate-100 shadow-xs px-3 py-1.5 rounded-full flex items-center space-x-1">
              <span>Cloud DB 활성화</span>
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
              students={students}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onUpdateStudentName={handleUpdateStudentName}
              onSaveStudents={handleSaveStudents}
              
              isAssigned={isAssigned}
              onAssign={handleAssign}
              onReset={handleReset}
              
              onSaveSeating={handleSaveSeating}
              onLoadSeating={handleLoadSeating}
              
              fixedSeats={fixedSeats}
              onUnlockSeat={handleUnlockSeat}
              
              stats={stats}
              
              isFixedMode={isFixedMode}
              onToggleFixedMode={setIsFixedMode}
              
              isSavingStudents={isSavingStudents}
              isSavingSeating={isSavingSeating}
              isLoadingSeating={isLoadingSeating}
              toastMsg={toastMsg}
            />
          </div>

          {/* Seating Grid (Right Column) */}
          <div className="lg:col-span-8">
            <ClassroomGrid
              seats={seats}
              students={students}
              fixedSeats={fixedSeats}
              isAssigned={isAssigned}
              onToggleExclude={handleToggleExclude}
              onSelectFixedStudent={handleSelectFixedStudent}
              isFixedMode={isFixedMode}
              maxAllowedExcluded={20 - students.length}
            />
          </div>
        </main>

        {/* Footer info */}
        <footer id="footer" className="text-center text-xs text-slate-400 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} 자리 바꾸기 프로그램 Cloud. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="hover:text-slate-600 transition-colors cursor-help flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>실시간 Firestore 연동을 통해 다른 브라우저에서도 배치 데이터를 즉시 불러올 수 있습니다.</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
