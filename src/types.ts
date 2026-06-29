/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SeatInfo {
  index: number; // 0 ~ 19
  seatNumber: number; // 1 ~ 20
  row: number; // 1 ~ 4
  col: number; // 1 ~ 5
  isExcluded: boolean; // X mark state
  studentName: string | null; // Student name if assigned, otherwise null
}

export interface ArrangementStats {
  totalSeats: number; // 20
  studentCount: number; // 1 ~ 20
  excludedCount: number; // count of X
  availableCount: number; // 20 - excludedCount
  autoEmptyCount: number; // 20 - excludedCount - studentCount
}
