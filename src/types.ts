/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  name: string;
}

export interface SeatInfo {
  index: number; // 0 ~ 19
  seatNumber: number; // 1 ~ 20
  row: number; // 1 ~ 4
  col: number; // 1 ~ 5
  isExcluded: boolean; // X mark state
  isFixed: boolean; // Fixed state
  studentName: string | null; // Student name if assigned, otherwise null
}

export interface ArrangementStats {
  totalSeats: number; // 20
  studentCount: number; // number of students in the list
  excludedCount: number; // count of X
  fixedCount: number; // count of fixed seats
  availableCount: number; // 20 - excludedCount
  autoEmptyCount: number; // 20 - excludedCount - studentCount (if availableCount > studentCount)
}
