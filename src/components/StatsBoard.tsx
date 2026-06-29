/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users, Ban, Check, HelpCircle } from 'lucide-react';
import { ArrangementStats } from '../types';

interface StatsBoardProps {
  stats: ArrangementStats;
}

export default function StatsBoard({ stats }: StatsBoardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Student Count Card */}
      <div 
        id="stat-students"
        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3 transition-all hover:shadow-md"
      >
        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">배정 학생 수</p>
          <p className="text-xl font-bold text-slate-800">
            {stats.studentCount}명
          </p>
        </div>
      </div>

      {/* Excluded Seats Card */}
      <div 
        id="stat-excluded"
        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3 transition-all hover:shadow-md"
      >
        <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
          <Ban className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">지정 제외석 (X)</p>
          <p className="text-xl font-bold text-slate-800">
            {stats.excludedCount}석
          </p>
        </div>
      </div>

      {/* Available Seats Card */}
      <div 
        id="stat-available"
        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3 transition-all hover:shadow-md"
      >
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
          <Check className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">실제 배치 가능</p>
          <p className="text-xl font-bold text-slate-800">
            {stats.availableCount}석
          </p>
        </div>
      </div>

      {/* Auto Empty Seats Card */}
      <div 
        id="stat-empty"
        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3 transition-all hover:shadow-md"
      >
        <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">자동 빈자리</p>
          <p className="text-xl font-bold text-slate-800">
            {stats.autoEmptyCount}석
          </p>
        </div>
      </div>
    </div>
  );
}
