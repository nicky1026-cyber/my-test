/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Student } from '../types';

// We use a single document 'default' in collection 'classroom' for simplicity and reliability
const CLASSROOM_DOC_ID = 'default';

export interface ClassroomData {
  students: Student[];
  fixedSeats: { [seatIndex: string]: string }; // Map of seatIndex (as string) to student ID/Name
  excludedSeats: number[];
  assignedSeats: (string | null)[];
  isAssigned: boolean;
  
  // Seating arrangement saved separately for "Save Seating" / "Load Seating"
  savedAssignedSeats?: (string | null)[];
  savedExcludedSeats?: number[];
  savedFixedSeats?: { [seatIndex: string]: string };
  savedIsAssigned?: boolean;
}

/**
 * Fetch the classroom data from Firestore.
 * If the document doesn't exist, returns null.
 */
export async function fetchClassroomData(): Promise<ClassroomData | null> {
  try {
    const docRef = doc(db, 'classroom', CLASSROOM_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ClassroomData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching classroom data from Firestore:', error);
    throw error;
  }
}

/**
 * Save the entire classroom data to Firestore.
 */
export async function saveClassroomData(data: Partial<ClassroomData>): Promise<void> {
  try {
    const docRef = doc(db, 'classroom', CLASSROOM_DOC_ID);
    // Fetch existing data first to merge
    const docSnap = await getDoc(docRef);
    const existingData = docSnap.exists() ? docSnap.data() : {};
    
    await setDoc(docRef, {
      ...existingData,
      ...data,
    });
  } catch (error) {
    console.error('Error saving classroom data to Firestore:', error);
    throw error;
  }
}
