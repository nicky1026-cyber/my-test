/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ban, Monitor, HelpCircle, Sparkles, AlertCircle } from 'lucide-react';
import { SeatInfo } from '../types';

interface ClassroomGridProps {
  seats: SeatInfo[];
  isAssigned: boolean;
  onToggleExclude: (index: number) => void;
  studentCount: number;
  maxAllowedExcluded: number;
}

export default function ClassroomGrid({
  seats,
  isAssigned,
  onToggleExclude,
  studentCount,
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
          {seats.map((seat, idx) => {
            const { index, seatNumber, isExcluded, studentName } = seat;

            // Determine classes and states based on current assignment and excluded states
            let cardBgClass = '';
            let cardBorderClass = '';
            let content = null;

            if (isExcluded) {
              cardBgClass = 'bg-rose-50/80 hover:bg-rose-100/60';
              cardBorderClass = 'border-rose-200 border-2 border-dashed text-rose-600';
              content = (
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                  <Ban className="w-5 h-5 text-rose-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-rose-600 tracking-tight">제외석</span>
                </div>
              );
            } else if (isAssigned) {
              if (studentName) {
                // Beautiful assigned student card
                cardBgClass = 'bg-gradient-to-b from-white to-slate-50/50 hover:to-slate-100/50';
                cardBorderClass = 'border-emerald-200 border-2 border-t-emerald-500 border-t-[5px] text-slate-800 shadow-sm shadow-emerald-50';
                content = (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex flex-col items-center justify-center h-full space-y-1"
                  >
                    <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md text-[9px] font-bold">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>배정됨</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold tracking-tight text-slate-800">
                      {studentName}
                    </span>
                  </motion.div>
                );
              } else {
                // Empty seat after assignment
                cardBgClass = 'bg-slate-50/60';
                cardBorderClass = 'border-slate-200 border border-dashed text-slate-400';
                content = (
                  <div className="flex flex-col items-center justify-center h-full space-y-1 opacity-70">
                    <HelpCircle className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-semibold text-slate-400">빈자리</span>
                  </div>
                );
              }
            } else {
              // Before assignment, interactive setup card
              cardBgClass = 'bg-slate-50/30 hover:bg-slate-50 hover:shadow-sm';
              cardBorderClass = 'border-slate-200 border border-dashed text-slate-400 hover:border-emerald-300 hover:border-solid';
              content = (
                <div className="flex flex-col items-center justify-center h-full text-center group-hover:scale-105 transition-transform duration-200">
                  <span className="text-[9px] font-semibold text-slate-400 group-hover:text-emerald-600 transition-colors">
                    클릭하여
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                    제외하기
                  </span>
                </div>
              );
            }

            return (
              <motion.div
                key={index}
                layoutId={`seat-${index}`}
                onClick={() => {
                  if (!isAssigned) {
                    onToggleExclude(index);
                  }
                }}
                className={`group h-24 sm:h-28 rounded-2xl relative transition-all duration-200 select-none ${
                  isAssigned ? 'cursor-default' : 'cursor-pointer hover:-translate-y-0.5'
                } ${cardBgClass} ${cardBorderClass}`}
                whileTap={isAssigned ? {} : { scale: 0.95 }}
              >
                {/* Seat Number Badge */}
                <div className="absolute top-2 left-2 bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-lg flex items-center justify-center border border-slate-200/50">
                  {seatNumber}
                </div>

                {/* Main Content */}
                <div className="h-full pt-4 px-2 pb-2">
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
        {isAssigned ? (
          <span className="text-emerald-600 font-medium flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>배정이 완료되었습니다!</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1">
            {isAtMaxExcluded ? (
              <span className="text-rose-500 font-semibold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>제외석 지정 한도에 도달했습니다.</span>
              </span>
            ) : (
              <span>좌석을 클릭하여 제외석으로 지정해보세요.</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
