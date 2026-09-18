import { useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import SearchBar from '../components/SearchBar';
import { getSubjects, removeNote, uploadNote } from '../services/notesService';
import { getPdfOpenUrl } from '../services/cloudinaryService';
import { colors } from '../styles/common';

const PICK_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export default function NotesScreen() {
  const [subjects, setSubjects] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes(refreshing = false) {
    refreshing ? setIsRefreshing(true) : setIsLoading(true);
    setMessage('');

    try {
      const loadedSubjects = await getSubjects();
      setSubjects(loadedSubjects);
      setCurrentSubject((selected) =>
        selected
          ? loadedSubjects.find((s) => s.id === selected.id) || null
          : null
      );
    } catch (error) {
      setMessage(error.message || 'Could not load notes.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  const visibleItems = useMemo(() => {
    const items = currentSubject ? currentSubject.notes : subjects;
    const term = searchText.trim().toLowerCase();

    if (!term) return items;
    return items.filter((item) => item.title.toLowerCase().includes(term));
  }, [currentSubject, searchText, subjects]);

  function openSubject(subject) {
    setCurrentSubject(subject);
    setSearchText('');
    setMessage('');
  }

  function showAllSubjects() {
    setCurrentSubject(null);
    setSearchText('');
    setMessage('');
  }

  async function pickAndUpload() {
    if (!currentSubject || isUploading) return;

    const result = await DocumentPicker.getDocumentAsync({
      type: PICK_TYPES,
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const file = result.assets[0];
    setIsUploading(true);
    setMessage('');

    try {
      await uploadNote(
        currentSubject.path,
        file.uri,
        file.name,
        file.mimeType || 'application/pdf'
      );
      await loadNotes(true);
    } catch (error) {
      setMessage(error.message || 'Could not upload this file.');
    } finally {
      setIsUploading(false);
    }
  }

  function confirmDelete(note) {
    Alert.alert(
      'Delete PDF',
      `Delete "${note.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePdf(note),
        },
      ]
    );
  }

  async function deletePdf(note) {
    setMessage('');
    setDeletingId(note.id);

    try {
      await removeNote(note.publicId, note.resourceType);
      await loadNotes(true);
    } catch (error) {
      setMessage(error.message || 'Could not delete this PDF.');
    } finally {
      setDeletingId(null);
    }
  }

  async function openPdf(note) {
    setMessage('');
    try {
      const url = getPdfOpenUrl(note);
      await Linking.openURL(url);
    } catch (error) {
      setMessage(error.message || 'Could not open this PDF.');
    }
  }

  function renderSubject({ item }) {
    const noteLabel = item.notes.length === 1 ? '1 note' : `${item.notes.length} notes`;

    return (
      <Pressable style={styles.listCard} onPress={() => openSubject(item)}>
        <Ionicons name="folder" size={36} color={item.color} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDetails}>{noteLabel}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </Pressable>
    );
  }

  function renderPdf({ item }) {
    const isDeleting = deletingId === item.id;

    return (
      <View style={styles.listCard}>
        <Pressable style={styles.pdfMain} onPress={() => openPdf(item)}>
          <Ionicons name="document-text" size={34} color={currentSubject.color} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDetails}>PDF note</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.textLight} />
        </Pressable>
        <Pressable
          style={styles.deleteButton}
          onPress={() => confirmDelete(item)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#c62828" />
          ) : (
            <Ionicons name="trash-outline" size={18} color="#c62828" />
          )}
        </Pressable>
      </View>
    );
  }

  function renderUploadButton() {
    if (!currentSubject) return null;

    return (
      <Pressable
        style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
        onPress={pickAndUpload}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Ionicons name="cloud-upload-outline" size={18} color={colors.white} />
        )}
        <Text style={styles.uploadButtonText}>
          {isUploading ? 'Uploading...' : 'Upload PDF or Doc'}
        </Text>
      </Pressable>
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>
          {currentSubject ? 'No notes in this subject' : 'No subjects found'}
        </Text>
        {searchText.trim() ? (
          <Text style={styles.emptyText}>Try a different search term.</Text>
        ) : currentSubject ? (
          <Text style={styles.emptyText}>Upload a PDF or Word doc from your phone.</Text>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        {currentSubject ? (
          <Pressable style={styles.headerButton} onPress={showAllSubjects}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.headerButton} />
        )}
        <Text style={styles.pageTitle}>
          {currentSubject ? currentSubject.title : 'STUDY NOTES'}
        </Text>
        <View style={styles.headerButton} />
      </View>

      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder={currentSubject ? 'Search PDF notes...' : 'Search subjects...'}
        containerStyle={styles.searchBar}
      />

      {message ? <Text style={styles.errorText}>{message}</Text> : null}

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => item.id}
          renderItem={currentSubject ? renderPdf : renderSubject}
          contentContainerStyle={styles.list}
          ListHeaderComponent={renderUploadButton}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadNotes(true)}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  pageTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  searchBar: { marginHorizontal: 16, marginBottom: 12 },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    marginHorizontal: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  loader: { marginTop: 36 },
  list: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  pdfMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  itemDetails: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  emptyCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 16,
    marginTop: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 13, color: colors.textLight, marginTop: 6 },
});
