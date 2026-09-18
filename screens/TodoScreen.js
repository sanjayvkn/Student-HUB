
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// imports
import { useAuth } from '../context/AuthContext';
import {
  createUserTask,
  deleteUserTask,
  fetchUserTasks,
  setUserTaskDone,
} from '../services/taskStorage';
import { colors } from '../styles/common';

const TASK_FILTERS = ['All', 'To Do', 'Done'];

// helper - get today's date for section title
// honestly this could be in utils but whatever
function getTodaySectionTitle() {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear();
  return `Today-${day} ${month} ${year}`;
}

// get current time for task creation
function getCurrentTimeLabel() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TasksScreen() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // load tasks from storage
  // i could use react-query here but this is fine
  const loadTasks = useCallback(async (showLoading = false) => {
    if (!user?.uid) return;
    if (showLoading) setIsLoading(true);
    try {
      const savedTasks = await fetchUserTasks(user.uid);
      setTasks(savedTasks);
      setErrorMessage('');
    } catch (taskError) {
      setErrorMessage(taskError.message || 'Could not load tasks.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // initial load
  useEffect(() => {
    loadTasks(true);
  }, [loadTasks]);

  // filter logic - pretty basic but works
  function taskMatchesFilter(task) {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Done') return task.done;
    return !task.done;
  }

  // group tasks into sections (pending + completed)
  const sections = useMemo(() => {
    const visibleTasks = tasks.filter(taskMatchesFilter);
    const pendingTasks = visibleTasks.filter((task) => !task.done);
    const completedTasks = visibleTasks.filter((task) => task.done);

    return [
      { title: getTodaySectionTitle(), tasks: pendingTasks },
      { title: 'Completed', tasks: completedTasks },
    ].filter((section) => section.tasks.length > 0);
  }, [selectedFilter, tasks]);

  // add new task
  async function addTask() {
    const title = newTaskTitle.trim();
    if (!title || !user?.uid || isSaving) return;

    setIsSaving(true);
    setErrorMessage('');

    try {
      await createUserTask(user.uid, title, getCurrentTimeLabel());
      setNewTaskTitle('');
      await loadTasks();
    } catch (taskError) {
      setErrorMessage(taskError.message || 'Could not add task.');
    } finally {
      setIsSaving(false);
    }
  }

  // toggle task done status
  async function toggleTask(taskId, isDone) {
    if (!user?.uid) return;

    setErrorMessage('');
    try {
      await setUserTaskDone(user.uid, taskId, !isDone);
      await loadTasks();
    } catch (taskError) {
      setErrorMessage(taskError.message || 'Could not update task.');
    }
  }

  // delete task
  async function removeTask(taskId) {
    if (!user?.uid) return;

    setErrorMessage('');
    try {
      await deleteUserTask(user.uid, taskId);
      await loadTasks();
    } catch (taskError) {
      setErrorMessage(taskError.message || 'Could not delete task.');
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* page header */}
      <Text style={styles.pageTitle}>My Tasks</Text>

      {/* add task row */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.taskInput}
          placeholder="Add a new task"
          placeholderTextColor={colors.textLight}
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <Pressable
          style={[styles.addButton, isSaving && styles.buttonDisabled]}
          onPress={addTask}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.addButtonText}>Add</Text>
          )}
        </Pressable>
      </View>

      {/* error message */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {/* filter tabs */}
      <View style={styles.tabRow}>
        {TASK_FILTERS.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={styles.tabItem}
          >
            <Text
              style={[
                styles.tabText,
                selectedFilter === filter && styles.tabTextActive,
              ]}
            >
              {filter}
            </Text>
            {selectedFilter === filter ? <View style={styles.tabUnderline} /> : null}
          </Pressable>
        ))}
      </View>

      {/* task list */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {!isLoading && sections.length === 0 ? (
          <Text style={styles.emptyText}>No tasks found.</Text>
        ) : null}

        {sections.map((section) => {
          return (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.tasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <Pressable
                    style={[styles.checkbox, task.done && styles.checkboxDone]}
                    onPress={() => toggleTask(task.id, task.done)}
                  >
                    {task.done ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
                  </Pressable>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, task.done && styles.taskDone]}>{task.title}</Text>
                    <Text style={styles.taskTime}>{task.time}</Text>
                  </View>
                  <Pressable onPress={() => removeTask(task.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.textLight} />
                  </Pressable>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// styles - same pattern as before
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 14,
    color: colors.text,
  },
  addRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  taskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    paddingHorizontal: 16,
    paddingBottom: 8,
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 13,
    color: colors.textLight,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabUnderline: {
    marginTop: 6,
    height: 2,
    width: '80%',
    backgroundColor: colors.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyText: {
    color: colors.textLight,
    paddingVertical: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    color: colors.text,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  taskDone: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  taskTime: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
});