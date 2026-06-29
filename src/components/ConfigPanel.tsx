/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, RotateCcw, HelpCircle, AlertCircle, 
  Plus, Trash2, Save, Download, Lock, Users, Sparkles, Check
} from 'lucide-react';
import { Student, ArrangementStats } from '../types';

interface ConfigPanelProps {
  students: Student[];
  onAddStudent: () => void;
  onDeleteStudent: (id: string) => void;
  onUpdateStudentName: (id: string, name: string) => void;
  onSaveStudents: () => Promise<void>;
  
  isAssigned: boolean;
  onAssign: () => void;
  onReset: () => void;
  
  onSaveSeating: () => Promise<void>;
  onLoadSeating: () => Promise<void>;
  
  fixedSeats: { [seatIndex: number]: string };
  onUnlockSeat: (seatIndex: number) => void;
  
  stats: ArrangementStats;
  
  isFixedMode: boolean;
  onToggleFixedMode: (enabled: boolean) => void;

  // Loading/Success states for beautiful visual feedback
  isSavingStudents: boolean;
  isSavingSeating: boolean;
  isLoadingSeating: boolean;
  toastMsg: string | null;
}

export default function ConfigPanel({
  students,
  onAddStudent,
  onDeleteStudent,
  onUpdateStudentName,
  onSaveStudents,
  
  isAssigned,
  onAssign,
  onReset,
  
  onSaveSeating,
  onLoadSeating,
  
  fixedSeats,
  onUnlockSeat,
  
  stats,
  
  isFixedMode,
  onToggleFixedMode,
  
  isSavingStudents,
  isSavingSeating,
  isLoadingSeating,
  toastMsg,
}: ConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'seating' | 'fixed'>('students');

  const maxAllowedExcluded = 20 - students.length;
  const isExcludedCountInvalid = stats.excludedCount > maxAllowedExcluded;
  const cannotAssign = students.length > stats.availableCount;

  // Find fixed seat student info
  const fixedList = Object.entries(fixedSeats).map(([seatIdxStr, studentId]) => {
    const seatIdx = Number(seatIdxStr);
    const student = students.find(s => s.id === studentId);
    return {
      seatIndex: seatIdx,
      seatNumber: seatIdx + 1,
      studentName: student ? student.name : '알 수 없는 학생',
    };
  }).sort((a, b) => a.seatNumber - b.seatNumber);

  return (
    <div id="config-panel" className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Dynamic Toast Banner inside Sidebar for local feedback */}
      {toastMsg && (
        <div id="sidebar-toast" className="bg-emerald-600 text-white py-2 px-4 text-center font-bold text-xs flex items-center justify-center space-x-1 transition-all duration-300 animate-slide-down">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1">
        <button
          id="tab-students"
          onClick={() => setActiveTab('students')}
          className={`py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
            activeTab === 'students'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-100/50'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>학생 관리</span>
        </button>

        <button
          id="tab-seating"
          onClick={() => setActiveTab('seating')}
          className={`py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
            activeTab === 'seating'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-100/50'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>자리 배정</span>
        </button>

        <button
          id="tab-fixed"
          onClick={() => setActiveTab('fixed')}
          className={`py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
            activeTab === 'fixed' || isFixedMode
              ? 'bg-white text-slate-800 shadow-sm border border-slate-100/50'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>고정석 설정</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-6 flex-1 flex flex-col overflow-hidden">
        {/* TAB 1: STUDENT ROSTER MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="flex flex-col h-full overflow-hidden space-y-4">
            <div className="flex-shrink-0">
              <h3 className="text-sm font-bold text-slate-800 mb-1">📋 학생 명단 관리</h3>
              <p className="text-xs text-slate-500">
                학생 이름을 직접 편집하거나 추가/삭제할 수 있습니다. (최대 20명)
              </p>
            </div>

            {/* Scrollable Student List */}
            <div id="students-list-container" className="flex-1 overflow-y-auto pr-1 space-y-2 border border-slate-50 p-2 rounded-2xl bg-slate-50/30">
              {students.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  학생이 없습니다. '학생 추가' 버튼을 눌러주세요.
                </div>
              ) : (
                students.map((student, idx) => (
                  <div 
                    key={student.id} 
                    className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-100 shadow-sm"
                  >
                    <span className="text-xs font-mono font-bold text-slate-400 w-6 text-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={student.name}
                      maxLength={10}
                      onChange={(e) => onUpdateStudentName(student.id, e.target.value)}
                      placeholder="이름 입력"
                      className="flex-1 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none transition-all"
                    />
                    <button
                      onClick={() => onDeleteStudent(student.id)}
                      title="학생 삭제"
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Student Actions Footer */}
            <div className="flex-shrink-0 pt-2 space-y-3">
              <button
                id="btn-add-student"
                onClick={onAddStudent}
                disabled={students.length >= 20}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>학생 추가 ({students.length}/20)</span>
              </button>

              <button
                id="btn-save-students"
                onClick={onSaveStudents}
                disabled={isSavingStudents || students.length === 0}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-sm shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingStudents ? '데이터베이스 저장 중...' : '학생 명단 저장 (DB)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SEATING ACTIONS & ARRANGEMENTS */}
        {activeTab === 'seating' && (
          <div className="flex flex-col h-full justify-between space-y-4">
            <div className="space-y-4 overflow-y-auto pr-1">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">🎲 자리 배치 & 파일 관리</h3>
                <p className="text-xs text-slate-500">
                  자리 배정을 실행하고 현재 자리를 데이터베이스에 안전하게 기록합니다.
                </p>
              </div>

              {/* Status / Warnings */}
              {cannotAssign ? (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start space-x-3 text-rose-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">배치 불가능 (공간 부족)</p>
                    <p className="leading-relaxed">
                      학생 수({students.length}명)가 배치 가능 좌석({stats.availableCount}석)보다 많습니다. 교실에서 제외석(X) 지정을 해제하거나 학생 수를 줄여주세요.
                    </p>
                  </div>
                </div>
              ) : isExcludedCountInvalid ? (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start space-x-3 text-rose-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">제외석이 너무 많습니다!</p>
                    <p className="leading-relaxed">
                      현재 학생 수({students.length}명)를 모두 배치하려면 제외석(X)은 최대 {maxAllowedExcluded}개까지만 지정할 수 있습니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start space-x-3 text-emerald-800">
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600 animate-bounce" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">자리 배정 준비 완료</p>
                    <p className="leading-relaxed">
                      현재 고정석 {stats.fixedCount}석과 제외석 {stats.excludedCount}석을 반영하여 나머지 {students.length - stats.fixedCount}명의 학생을 배치합니다.
                    </p>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                id="btn-assign"
                onClick={onAssign}
                disabled={cannotAssign || isExcludedCountInvalid}
                className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
                  cannotAssign || isExcludedCountInvalid
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 hover:shadow-emerald-200'
                }`}
              >
                <Play className="w-5 h-5" />
                <span>{isAssigned ? '다시 자리 배정 (섞기)' : '무작위 자리 배정'}</span>
              </button>

              <button
                id="btn-reset"
                onClick={onReset}
                className="w-full py-2.5 px-6 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 hover:bg-slate-50 font-semibold flex items-center justify-center space-x-2 text-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>제외석 및 고정석 전체 초기화</span>
              </button>
            </div>

            {/* Firestore Arrangement Save / Load Area */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                💾 자리 배치 DB 보관소
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-save-seating"
                  onClick={onSaveSeating}
                  disabled={isSavingSeating || !isAssigned}
                  className="py-3 px-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm shadow-violet-100 hover:shadow-violet-200 transition-all cursor-pointer"
                  title="현재 자리 상태를 DB에 영구 저장합니다."
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingSeating ? '저장 중...' : '현재 자리 저장'}</span>
                </button>

                <button
                  id="btn-load-seating"
                  onClick={onLoadSeating}
                  disabled={isLoadingSeating}
                  className="py-3 px-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm shadow-amber-100 hover:shadow-amber-200 transition-all cursor-pointer"
                  title="DB에 저장되어 있던 자리 배치를 불러옵니다."
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isLoadingSeating ? '불러오는 중...' : '저장 자리 불러오기'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                * 자리 정보(학생 위치, 제외석, 고정석)를 클라우드에 영구 백업합니다.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: FIXED SEATS DESIGNATION */}
        {activeTab === 'fixed' && (
          <div className="flex flex-col h-full overflow-hidden space-y-4">
            <div className="flex-shrink-0">
              <h3 className="text-sm font-bold text-slate-800 mb-1">🔒 고정석 지정 기능</h3>
              <p className="text-xs text-slate-500">
                원하는 자리에 특정 학생을 배치하고 섞기 대상에서 제외할 수 있습니다.
              </p>
            </div>

            {/* Toggle Fixed Mode Switch */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between flex-shrink-0">
              <div>
                <span className="text-xs font-bold text-slate-800 block">고정석 지정 모드</span>
                <span className="text-[10px] text-slate-500">모드를 켜면 좌석을 클릭해 지정 가능</span>
              </div>
              <button
                id="btn-toggle-fixed-mode"
                onClick={() => onToggleFixedMode(!isFixedMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  isFixedMode
                    ? 'bg-amber-500 text-white shadow-amber-100'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {isFixedMode ? '모드 ON (활성)' : '모드 OFF (대기)'}
              </button>
            </div>

            {/* List of current locks */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-slate-700 mb-2">지정된 고정석 목록 ({fixedList.length}개)</span>
              
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 border border-slate-50 p-2 rounded-2xl bg-slate-50/30">
                {fixedList.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                    <Lock className="w-6 h-6 text-slate-300" />
                    <span>지정된 고정석이 없습니다.</span>
                    <span className="text-[10px]">고정석 모드를 켜고 우측 배치도에서 자리를 클릭하세요!</span>
                  </div>
                ) : (
                  fixedList.map((item) => (
                    <div 
                      key={item.seatIndex} 
                      className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-100 shadow-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center space-x-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>{item.seatNumber}번 자리</span>
                        </span>
                        <span className="text-xs font-bold text-slate-800">{item.studentName}</span>
                      </div>
                      
                      <button
                        onClick={() => onUnlockSeat(item.seatIndex)}
                        className="text-[10px] font-bold text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-100 rounded-lg px-2 py-1 transition-all cursor-pointer"
                      >
                        고정 해제
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick action: Save everything after change */}
            <div className="flex-shrink-0 pt-2">
              <p className="text-[10px] text-slate-400 leading-relaxed mb-1">
                * 고정석 지정 정보도 '학생 명단 저장' 또는 '현재 자리 저장' 시 Firebase Firestore에 함께 안전하게 동기화됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
