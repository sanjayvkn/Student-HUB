import { deleteNote, listNotesInFolder, uploadNote as uploadToCloudinary } from './cloudinaryService';

const subjectFolders = [
  {
    id: 'web-development',
    title: 'Web Development',
    color: '#8e24aa',
    path: 'notes/web-development',
  },
  {
    id: 'database-systems',
    title: 'Database Systems',
    color: '#1e88e5',
    path: 'notes/database-systems',
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design',
    color: '#43a047',
    path: 'notes/ui-ux-design',
  },
  {
    id: 'software-engineering',
    title: 'Software Engineering',
    color: '#f9a825',
    path: 'notes/software-engineering',
  },
];

async function loadSubject(folder) {
  const notes = await listNotesInFolder(folder.path);
  return { ...folder, notes };
}

export async function getSubjects() {
  return Promise.all(subjectFolders.map(loadSubject));
}

export async function removeNote(publicId, resourceType) {
  await deleteNote(publicId, resourceType);
}

export async function uploadNote(folderPath, fileUri, fileName, mimeType) {
  return uploadToCloudinary(folderPath, fileUri, fileName, mimeType);
}
