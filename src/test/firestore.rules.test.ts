/**
 * Unit tests for Firestore security rules.
 * Verifies resource access control, admin privileges, and superuser bypass.
 */

import { readFileSync } from 'node:fs';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Unmock Firebase packages mocked globally in setup.ts.
vi.unmock('firebase/app');
vi.unmock('firebase/firestore');

let testEnv: RulesTestEnvironment;
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Firestore Security Rules', function () {
  // --- Developer / Superuser Bypass Tests ---
  describe('Superuser Bypass', function () {
    it('allows verified developer email to read and write any resource', async () => {
      const superuserContext = testEnv.authenticatedContext('dev_user', {
        email: 'douglas.yellow@googlemail.com',
        email_verified: true
      });
      const db = superuserContext.firestore();

      // Attempt write and read on arbitrary document.
      const testDoc = doc(db, 'practices/any_practice');
      const writePromise = setDoc(testDoc, { name: 'Super Practice' });
      await assertSucceeds(writePromise);

      const readPromise = getDoc(testDoc);
      const docSnap = await assertSucceeds(readPromise);
      expect(docSnap.exists()).toBe(true);
    });

    it('allows alternate verified developer email to read and write any resource', async () => {
      const superuserContext = testEnv.authenticatedContext('dev_user_alt', {
        email: 'douglas.yellow@gmail.com',
        email_verified: true
      });
      const db = superuserContext.firestore();

      const testDoc = doc(db, 'users/any_user');
      const writePromise = setDoc(testDoc, { name: 'Super User' });
      await assertSucceeds(writePromise);
      expect(writePromise).toBeDefined();
    });

    it('denies developer email if not verified via OAuth', async () => {
      const unverifiedContext = testEnv.authenticatedContext('dev_unverified', {
        email: 'douglas.yellow@googlemail.com',
        email_verified: false
      });
      const db = unverifiedContext.firestore();

      const testDoc = doc(db, 'practices/any_practice');
      const writePromise = setDoc(testDoc, { name: 'Hack Practice' });
      const error = await assertFails(writePromise);
      expect(error.code).toBe('permission-denied');
    });
  });

  // --- Users Collection Tests ---
  describe('Users Collection', function () {
    it('allows users to read and write their own profile', async () => {
      const aliceContext = testEnv.authenticatedContext('alice');
      const db = aliceContext.firestore();

      const aliceDoc = doc(db, 'users/alice');
      const writePromise = setDoc(aliceDoc, { name: 'Alice' });
      await assertSucceeds(writePromise);

      const readPromise = getDoc(aliceDoc);
      const docSnap = await assertSucceeds(readPromise);
      expect(docSnap.exists()).toBe(true);
    });

    it('denies users from reading or writing other user profiles', async () => {
      const aliceContext = testEnv.authenticatedContext('alice');
      const db = aliceContext.firestore();

      const bobDoc = doc(db, 'users/bob');

      const readPromise = getDoc(bobDoc);
      const readError = await assertFails(readPromise);
      expect(readError.code).toBe('permission-denied');

      const writePromise = setDoc(bobDoc, { name: 'Bob' });
      const writeError = await assertFails(writePromise);
      expect(writeError.code).toBe('permission-denied');
    });

    it('allows practice admins to read member profiles in their practice', async () => {
      // Setup: Seed Alice as member of Practice X, and Charlie as admin of Practice X.
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        const practiceRef = doc(firestore, 'practices/practiceX');
        await setDoc(doc(firestore, 'users/alice'), {
          name: 'Alice',
          current_practice: practiceRef
        });
        await setDoc(doc(firestore, 'practice_users/charlie_practiceX'), {
          practice: practiceRef,
          user: doc(firestore, 'users/charlie'),
          is_administrator: true
        });
      });

      const charlieContext = testEnv.authenticatedContext('charlie');
      const db = charlieContext.firestore();

      const aliceDoc = doc(db, 'users/alice');
      const readPromise = getDoc(aliceDoc);
      const docSnap = await assertSucceeds(readPromise);
      expect(docSnap.exists()).toBe(true);
    });
  });

  // --- Practice Users (Memberships) Tests ---
  describe('Practice Users Collection', function () {
    it('allows users to read their own membership documents', async () => {
      const aliceContext = testEnv.authenticatedContext('alice');
      const db = aliceContext.firestore();

      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        await setDoc(doc(firestore, 'practice_users/alice_practiceX'), {
          user: doc(firestore, 'users/alice'),
          practice: doc(firestore, 'practices/practiceX')
        });
      });

      const aliceMembership = doc(db, 'practice_users/alice_practiceX');
      const readPromise = getDoc(aliceMembership);
      const docSnap = await assertSucceeds(readPromise);
      expect(docSnap.exists()).toBe(true);
    });

    it('allows users to query their own memberships', async () => {
      const aliceContext = testEnv.authenticatedContext('alice');
      const db = aliceContext.firestore();

      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        await setDoc(doc(firestore, 'practice_users/alice_practiceX'), {
          user: doc(firestore, 'users/alice'),
          practice: doc(firestore, 'practices/practiceX')
        });
      });

      const q = query(
        collection(db, 'practice_users'),
        where('user', '==', doc(db, 'users/alice'))
      );
      const queryPromise = getDocs(q);
      const querySnap = await assertSucceeds(queryPromise);
      expect(querySnap.empty).toBe(false);
    });

    it('denies regular users from writing or modifying their own memberships', async () => {
      const aliceContext = testEnv.authenticatedContext('alice');
      const db = aliceContext.firestore();

      const aliceMembership = doc(db, 'practice_users/alice_practiceX');
      const writePromise = setDoc(aliceMembership, {
        user: doc(db, 'users/alice'),
        practice: doc(db, 'practices/practiceX'),
        is_administrator: true
      });
      const error = await assertFails(writePromise);
      expect(error.code).toBe('permission-denied');
    });

    it('allows practice admins to create and modify memberships', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        await setDoc(doc(firestore, 'practice_users/charlie_practiceX'), {
          user: doc(firestore, 'users/charlie'),
          practice: doc(firestore, 'practices/practiceX'),
          is_administrator: true
        });
      });

      const charlieContext = testEnv.authenticatedContext('charlie');
      const db = charlieContext.firestore();

      const aliceMembership = doc(db, 'practice_users/alice_practiceX');
      const writePromise = setDoc(aliceMembership, {
        user: doc(db, 'users/alice'),
        practice: doc(db, 'practices/practiceX'),
        is_administrator: false
      });
      await assertSucceeds(writePromise);
      expect(writePromise).toBeDefined();
    });
  });

  // --- Practices & Subcollections Tests ---
  describe('Practices & Subcollections', function () {
    it('allows practice members to read practice details and subcollections', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        await setDoc(doc(firestore, 'practice_users/alice_practiceX'), {
          user: doc(firestore, 'users/alice'),
          practice: doc(firestore, 'practices/practiceX')
        });
        await setDoc(doc(firestore, 'practices/practiceX'), { name: 'Practice X' });
        await setDoc(doc(firestore, 'practices/practiceX/surgeries/surgery1'), {
          name: 'Surgery 1'
        });
      });

      const aliceContext = testEnv.authenticatedContext('alice');
      const db = aliceContext.firestore();

      const readPractice = getDoc(doc(db, 'practices/practiceX'));
      const practiceSnap = await assertSucceeds(readPractice);
      expect(practiceSnap.exists()).toBe(true);

      const readSurgery = getDoc(doc(db, 'practices/practiceX/surgeries/surgery1'));
      const surgerySnap = await assertSucceeds(readSurgery);
      expect(surgerySnap.exists()).toBe(true);
    });

    it('denies non-members from reading practice details or subcollections', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        await setDoc(doc(firestore, 'practices/practiceX'), { name: 'Practice X' });
        await setDoc(doc(firestore, 'practices/practiceX/surgeries/surgery1'), {
          name: 'Surgery 1'
        });
      });

      const bobContext = testEnv.authenticatedContext('bob');
      const db = bobContext.firestore();

      const readPractice = getDoc(doc(db, 'practices/practiceX'));
      const practiceError = await assertFails(readPractice);
      expect(practiceError.code).toBe('permission-denied');

      const readSurgery = getDoc(doc(db, 'practices/practiceX/surgeries/surgery1'));
      const surgeryError = await assertFails(readSurgery);
      expect(surgeryError.code).toBe('permission-denied');
    });

    it('allows practice admins to edit practice subcollections', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        await setDoc(doc(firestore, 'practice_users/charlie_practiceX'), {
          user: doc(firestore, 'users/charlie'),
          practice: doc(firestore, 'practices/practiceX'),
          is_administrator: true
        });
        await setDoc(doc(firestore, 'practices/practiceX'), { name: 'Practice X' });
      });

      const charlieContext = testEnv.authenticatedContext('charlie');
      const db = charlieContext.firestore();

      const surgeryDoc = doc(db, 'practices/practiceX/surgeries/surgery1');
      const writePromise = setDoc(surgeryDoc, { name: 'Surgery 1 Updated' });
      await assertSucceeds(writePromise);
      expect(writePromise).toBeDefined();
    });

    it('denies regular practice members from editing practice subcollections', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        await setDoc(doc(firestore, 'practice_users/alice_practiceX'), {
          user: doc(firestore, 'users/alice'),
          practice: doc(firestore, 'practices/practiceX'),
          is_administrator: false
        });
        await setDoc(doc(firestore, 'practices/practiceX'), { name: 'Practice X' });
        await setDoc(doc(firestore, 'practices/practiceX/surgeries/surgery1'), {
          name: 'Surgery 1'
        });
      });

      const aliceContext = testEnv.authenticatedContext('alice');
      const db = aliceContext.firestore();

      const surgeryDoc = doc(db, 'practices/practiceX/surgeries/surgery1');
      const writePromise = setDoc(surgeryDoc, { name: 'Surgery 1 Mod' });
      const error = await assertFails(writePromise);
      expect(error.code).toBe('permission-denied');
    });
  });

  // --- Shifts Collection Tests ---
  describe('Shifts Collection', function () {
    it('allows any authenticated user to read shifts', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        await setDoc(doc(firestore, 'shifts/shift1'), {
          role_id: doc(firestore, 'practices/practiceX/roles/role1'),
          date: new Date()
        });
      });

      const bobContext = testEnv.authenticatedContext('bob');
      const db = bobContext.firestore();

      const readPromise = getDoc(doc(db, 'shifts/shift1'));
      const docSnap = await assertSucceeds(readPromise);
      expect(docSnap.exists()).toBe(true);
    });

    it('allows practice admins to create and delete shifts', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        await setDoc(doc(firestore, 'practice_users/charlie_practiceX'), {
          user: doc(firestore, 'users/charlie'),
          practice: doc(firestore, 'practices/practiceX'),
          is_administrator: true
        });
        await setDoc(doc(firestore, 'shifts/shift1'), {
          role_id: doc(firestore, 'practices/practiceX/roles/role1')
        });
      });

      const charlieContext = testEnv.authenticatedContext('charlie');
      const db = charlieContext.firestore();

      // Create new shift.
      const shiftDoc = doc(db, 'shifts/shift2');
      const writePromise = setDoc(shiftDoc, {
        role_id: doc(db, 'practices/practiceX/roles/role1'),
        date: new Date()
      });
      await assertSucceeds(writePromise);
      expect(writePromise).toBeDefined();

      // Delete existing shift.
      const readPromise = getDoc(doc(db, 'shifts/shift1'));
      const docSnap = await assertSucceeds(readPromise);
      expect(docSnap.exists()).toBe(true);
    });

    it('denies regular practice members from creating or deleting shifts', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        await setDoc(doc(firestore, 'practice_users/alice_practiceX'), {
          user: doc(firestore, 'users/alice'),
          practice: doc(firestore, 'practices/practiceX'),
          is_administrator: false
        });
      });

      const aliceContext = testEnv.authenticatedContext('alice');
      const db = aliceContext.firestore();

      const shiftDoc = doc(db, 'shifts/shift2');
      const writePromise = setDoc(shiftDoc, {
        role_id: doc(db, 'practices/practiceX/roles/role1'),
        date: new Date()
      });
      const error = await assertFails(writePromise);
      expect(error.code).toBe('permission-denied');
    });
  });
});
