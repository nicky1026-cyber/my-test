/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration using values from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyAfnX7EKCu4XyzPHsawhRNfXUAlTFZgUjk",
  authDomain: "gen-lang-client-0283658521.firebaseapp.com",
  projectId: "gen-lang-client-0283658521",
  storageBucket: "gen-lang-client-0283658521.firebasestorage.app",
  messagingSenderId: "504819722128",
  appId: "1:504819722128:web:1c3d40be9e43a59f66f515"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);
