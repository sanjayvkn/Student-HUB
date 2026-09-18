import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  initializeFirestore,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { app } from './firebase';

// initialize firestore with long polling for better connectivity
// falls back to default if there's an issue
let db = null;

if (app) {
  try {
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch (error) {
    // fallback to default config
    db = getFirestore(app);
  }
}

// get reference to user's tasks collection
// throws if user is not valid
function getTasksCollection(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('A signed-in user is required to access tasks.');
  }
  if (!db) throw new Error('Firestore is not configured.');
  return collection(db, 'users', userId, 'tasks');
}

// get specific task document reference
// i could combine this with the above but it's cleaner this way
function getTaskDocument(userId, taskId) {
  if (typeof taskId !== 'string' || !taskId.trim()) {
    throw new Error('A valid task ID is required.');
  }
  return doc(getTasksCollection(userId), taskId);
}

// map firestore document to task object
// handles missing fields with defaults
function mapTask(taskDocument) {
  const data = taskDocument.data();

  return {
    id: taskDocument.id,
    title: data.title,
    time: data.time || '', // default empty string if missing
    done: Boolean(data.done),
  };
}

// fetch all tasks for a user - ordered by creation date
export async function fetchUserTasks(userId) {
  const tasksQuery = query(
    getTasksCollection(userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(tasksQuery);
  return snapshot.docs.map(mapTask);
}

// create a new task for a user
export async function createUserTask(userId, title, time) {
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  if (!cleanTitle) throw new Error('Task title is required.');

  return addDoc(getTasksCollection(userId), {
    title: cleanTitle,
    time: typeof time === 'string' ? time : '',
    done: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// update task completion status
export async function setUserTaskDone(userId, taskId, done) {
  return updateDoc(getTaskDocument(userId, taskId), {
    done: Boolean(done),
    updatedAt: serverTimestamp(),
  });
}

// delete a task - permanent removal
export async function deleteUserTask(userId, taskId) {
  return deleteDoc(getTaskDocument(userId, taskId));
}