/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ban, Monitor, HelpCircle, Sparkles, AlertCircle, Lock, HelpCircle as QuestionIcon } from 'lucide-react';
import { SeatInfo, Student } from '../types';

interface ClassroomGridProps {
  seats: SeatInfo[];
  students: Student[];
  fixedSeats: { [seatIndex: number]: string };
  isAssigned: boolean;
  onToggleExclude: (index: number) => void;
  onSelectFixedStudent: (seatIndex: number, studentId: string | null) => void;
  isFixedMode: boolean;
  maxAllowedExcluded: number;
}

export default function ClassroomGrid({
  seats,
  students,
  fixedSeats,
  isAssigned,
  onToggleExclude,
  onSelectFixedStudent,
  isFixedMode,
  maxAllowedExcluded,
}: ClassroomGridProps) {
  const currentExcludedCount = seats.filter(s => s.isExcluded).length;
  const isAtMaxExcluded = currentExcludedCount >= maxAllowedExcluded;

  return (
    <div id="classroom-grid-container" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col space-y-6">
      {/* Blackboard/Whiteboard Area (FRONT) */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md bg-slate-800 text-slate-100 py-3 px-6 rounded-2xl shadow-inner flex items-center justify-center space-x-2 relative border-b-4 border-slate-900">
          <Monitor className="w-5 h-5 text-slate-400" />
          <span className="font-bold tracking-widest text-sm">칠판 & 교탁 (앞쪽)</span>
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-800"></div>
        </div>
      </div>

      {/* Grid of Seats (4 rows x 5 columns) */}
      <div 
        id="seats-grid"
        className="grid grid-cols-5 gap-3 sm:gap-4 pt-4"
      >
        <AnimatePresence mode="popLayout">
          {seats.map((seat) => {
            const { index, seatNumber, isExcluded, isFixed, studentName } = seat;

            // Determine rendering states
            let cardBgClass = '';
            let cardBorderClass = '';
            let content = null;

            if (isExcluded) {
              // 1. Excluded Seat (X)
              cardBgClass = 'bg-rose-50/80 hover:bg-rose-100/60';
              cardBorderClass = 'border-rose-200 border-2 border-dashed text-rose-600';
              content = (
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                  <Ban className="w-5 h-5 text-rose-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-rose-600 tracking-tight">제외석</span>
                </div>
              );
            } else if (isFixedMode) {
              // 2. Fixed Seat Assignment Mode Active
              const currentFixedStudentId = fixedSeats[index] || '';
              
              cardBgClass = currentFixedStudentId ? 'bg-amber-50/80 hover:bg-amber-100/60' : 'bg-white hover:bg-slate-50';
              cardBorderClass = currentFixedStudentId 
                ? 'border-amber-300 border-2 border-solid shadow-sm shadow-amber-50' 
                : 'border-slate-300 border border-dashed hover:border-amber-400';
              
              content = (
                <div className="flex flex-col items-center justify-center h-full px-1 space-y-1">
                  <div className="flex items-center space-x-0.5 text-amber-700 text-[9px] font-bold">
                    <Lock className="w-3 h-3" />
                    <span>고정석 배치</span>
                  </div>
                  
                  {/* Select Dropdown inside Seat Card */}
                  <select
                    value={currentFixedStudentId}
                    onChange={(e) => {
                      const val = e.target.value;
                      onSelectFixedStudent(index, val ? val : null);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1 px-1 text-[10px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="">— 비어있음 —</option>
                    {students.map((student) => {
                      // Check if this student is already fixed to another seat
                      const alreadyFixedSeatIdx = Object.entries(fixedSeats).find(
                        ([sIdx, sId]) => Number(sIdx) !== index && sId === student.id
                      );
                      const isLockedElsewhere = !!alreadyFixedSeatIdx;
                      const seatNo = isLockedElsewhere ? Number(alreadyFixedSeatIdx[0]) + 1 : 0;

                      return (
                        <option 
                          key={student.id} 
                          value={student.id} 
                          disabled={isLockedElsewhere}
                        >
                          {student.name} {isLockedElsewhere ? `(🔒 ${seatNo}번)` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              );
            } else if (isAssigned) {
              // 3. Assignment Active - Seats Shuffled
              if (studentName) {
                if (isFixed) {
                  // Assigned and Fixed Seat
                  cardBgClass = 'bg-gradient-to-b from-amber-50/30 to-amber-50/70 hover:to-amber-100/40';
                  cardBorderClass = 'border-amber-300 border-2 border-t-amber-500 border-t-[5px] text-slate-800 shadow-sm shadow-amber-50';
                  content = (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full space-y-1"
                    >
                      <div className="flex items-center space-x-1 bg-amber-500 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold shadow-xs">
                        <Lock className="w-2.5 h-2.5" />
                        <span>고정됨</span>
                      </div>
                      <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-800">
                        {studentName}
                      </span>
                    </motion.div>
                  );
                } else {
                  // Normal Assigned Seat
                  cardBgClass = 'bg-gradient-to-b from-white to-slate-50/50 hover:to-slate-100/50';
                  cardBorderClass = 'border-emerald-200 border-2 border-t-emerald-500 border-t-[5px] text-slate-800 shadow-sm shadow-emerald-50';
                  content = (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full space-y-1"
                    >
                      <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md text-[9px] font-bold">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>무작위</span>
                      </div>
                      <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-800">
                        {studentName}
                      </span>
                    </motion.div>
                  );
                }
              } else {
                // Empty Seat after Assignment
                cardBgClass = 'bg-slate-50/50';
                cardBorderClass = 'border-slate-200 border border-dashed text-slate-400';
                content = (
                  <div className="flex flex-col items-center justify-center h-full space-y-1 opacity-75">
                    <HelpCircle className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-semibold text-slate-400">빈자리</span>
                  </div>
                );
              }
            } else {
              // 4. Default Setup Mode - Interactive Exclusion Selection
              const hasFixedStudent = !!fixedSeats[index];
              const fixedStudentId = fixedSeats[index];
              const fixedStudent = fixedStudentId ? students.find(s => s.id === fixedStudentId) : null;

              if (hasFixedStudent && fixedStudent) {
                // Showing fixed preview in setup mode
                cardBgClass = 'bg-amber-50/20 hover:bg-amber-50/40 border-amber-200 border border-solid';
                cardBorderClass = 'border-amber-300 hover:border-amber-400 text-amber-800';
                content = (
                  <div className="flex flex-col items-center justify-center h-full space-y-1">
                    <div className="flex items-center space-x-1 text-amber-700 text-[10px] font-bold">
                      <Lock className="w-3 h-3" />
                      <span>고정 {fixedStudent.name}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">(자리배정 시 고정)</span>
                  </div>
                );
              } else {
                // Normal available setup card
                cardBgClass = 'bg-slate-50/30 hover:bg-slate-50 hover:shadow-xs';
                cardBorderClass = 'border-slate-200 border border-dashed text-slate-400 hover:border-emerald-300 hover:border-solid';
                content = (
                  <div className="flex flex-col items-center justify-center h-full text-center group-hover:scale-105 transition-transform duration-200">
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-emerald-600 transition-colors">
                      클릭하여
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                      제외하기
                    </span>
                  </div>
                );
              }
            }

            return (
              <motion.div
                key={index}
                layoutId={`seat-${index}`}
                onClick={() => {
                  // Exclude toggle is only allowed when NOT in fixed mode and NOT assigned
                  if (!isAssigned && !isFixedMode) {
                    onToggleExclude(index);
                  }
                }}
                className={`group h-24 sm:h-28 rounded-2xl relative transition-all duration-200 select-none ${
                  isAssigned || isFixedMode ? 'cursor-default' : 'cursor-pointer hover:-translate-y-0.5'
                } ${cardBgClass} ${cardBorderClass}`}
                whileTap={isAssigned || isFixedMode ? {} : { scale: 0.95 }}
              >
                {/* Seat Number Badge */}
                <div className="absolute top-2 left-2 bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-lg flex items-center justify-center border border-slate-200/50">
                  {seatNumber}
                </div>

                {/* Main Content */}
                <div className="h-full pt-4 px-1 pb-2">
                  {content}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Interactive Helper Text */}
      <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-4">
        <span>총 20개 좌석 (4행 × 5열)</span>
        {isFixedMode ? (
          <span className="text-amber-600 font-bold flex items-center space-x-1">
            <Lock className="w-3.5 h-3.5 animate-bounce" />
            <span>고정석 배치 모드가 켜져 있습니다. 좌석에서 고정할 학생을 선택하세요.</span>
          </span>
        ) : isAssigned ? (
          <span className="text-emerald-600 font-medium flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>자리 배정이 완료되었습니다!</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1">
            {isAtMaxExcluded ? (
              <span className="text-rose-500 font-semibold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>제외석 지정 한도에 도달했습니다.</span>
              </span>
            ) : (
              <span>좌석을 클릭하면 제외석(X)으로 전환됩니다.</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
