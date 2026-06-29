/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, HelpCircle, AlertCircle } from 'lucide-react';
import { ArrangementStats } from '../types';

interface ConfigPanelProps {
  studentCount: number;
  onStudentCountChange: (count: number) => void;
  isAssigned: boolean;
  onAssign: () => void;
  onReset: () => void;
  stats: ArrangementStats;
}

export default function ConfigPanel({
  studentCount,
  onStudentCountChange,
  isAssigned,
  onAssign,
  onReset,
  stats,
}: ConfigPanelProps) {
  // Generate options from 1 to 20
  const countOptions = Array.from({ length: 20 }, (_, i) => i + 1);

  // If excluded count is too high, warn the user
  const maxAllowedExcluded = 20 - studentCount;
  const isExcludedCountInvalid = stats.excludedCount > maxAllowedExcluded;

  return (
    <div id="config-panel" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col space-y-6 h-full">
      {/* Title & Introduction */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          ⚙️ 배치 설정
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          학생 인원수와 제외석을 자유롭게 설정하여 교실 자리를 무작위로 배정해보세요.
        </p>
      </div>

      {/* Select Student Count */}
      <div className="space-y-2">
        <label htmlFor="student-count-select" className="block text-sm font-semibold text-slate-700">
          학생 수 선택
        </label>
        <div className="relative">
          <select
            id="student-count-select"
            value={studentCount}
            onChange={(e) => onStudentCountChange(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
          >
            {countOptions.map((count) => (
              <option key={count} value={count}>
                {count}명
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Warnings & Messages */}
      {isExcludedCountInvalid && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start space-x-3 text-rose-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
          <div className="text-xs space-y-1">
            <p className="font-bold">제외석이 너무 많습니다!</p>
            <p className="leading-relaxed">
              선택한 학생 수({studentCount}명)를 배치하기 위해, 제외석(X)은 최대 {maxAllowedExcluded}개까지만 지정할 수 있습니다. 배치도를 클릭하여 일부 제외석 지정을 해제해 주세요.
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Instruction */}
      {!isAssigned && !isExcludedCountInvalid && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start space-x-3 text-emerald-800">
          <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <div className="text-xs space-y-1">
            <p className="font-bold">제외석(X)을 지정해보세요</p>
            <p className="leading-relaxed">
              우측 배치도에서 학생이 앉지 않을 자리(예: 교탁 바로 앞, 빈책상 등)를 클릭해 <strong>제외석(X)</strong>으로 설정할 수 있습니다. 남는 자리는 자동으로 '빈자리'가 됩니다.
            </p>
          </div>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          id="btn-assign"
          onClick={onAssign}
          disabled={isExcludedCountInvalid}
          className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
            isExcludedCountInvalid
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 hover:shadow-emerald-200'
          }`}
        >
          <Play className="w-5 h-5" />
          <span>{isAssigned ? '다시 자리 배정 (섞기)' : '자리 배정하기'}</span>
        </button>

        <button
          id="btn-reset"
          onClick={onReset}
          className="w-full py-3 px-6 rounded-2xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 hover:bg-slate-50 font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>초기화</span>
        </button>
      </div>

      {/* Minimal Instruction Checklist */}
      <div className="border-t border-slate-100 pt-5 mt-auto">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          💡 이용 방법
        </h3>
        <ul className="text-xs text-slate-500 space-y-2.5">
          <li className="flex items-start space-x-2">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 flex-shrink-0 mt-0.5">1</span>
            <span>드롭다운 메뉴에서 <strong>배정할 학생 인원수(1~20명)</strong>를 설정합니다.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 flex-shrink-0 mt-0.5">2</span>
            <span>배치도에서 원하지 않는 좌석을 클릭해 <strong>제외석(✕)</strong>으로 지정합니다.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 flex-shrink-0 mt-0.5">3</span>
            <span><strong>'자리 배정하기'</strong> 버튼을 클릭하면 무작위 배치가 실행됩니다.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 flex-shrink-0 mt-0.5">4</span>
            <span>X 표시가 된 자리는 배정에서 유지되며, 다른 자리만 계속 새로 섞을 수 있습니다.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
