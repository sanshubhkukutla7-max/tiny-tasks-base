import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { addTask, getTasks, updateTask } from './src/api';
import type { Task } from './src/types';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remainingCount = tasks.filter((task) => !task.completed).length;

  const loadTasks = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      setTasks(await getTasks());
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  async function handleAdd() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Enter a task before tapping Add.');
      return;
    }

    setAdding(true);
    setError(null);
    try {
      const task = await addTask(trimmedTitle);
      setTasks((current) => [task, ...current]);
      setTitle('');
      Keyboard.dismiss();
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(task: Task) {
    setUpdatingId(task.id);
    setError(null);
    try {
      const updated = await updateTask(task.id, !task.completed);
      setTasks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>MOBILE APPLICATIONS & SERVICES</Text>
            <Text style={styles.heading}>Tiny Tasks</Text>
            <Text style={styles.subheading}>One small thing at a time.</Text>
          </View>
          <Pressable
            accessibilityLabel="Refresh saved tasks"
            disabled={refreshing || loading}
            onPress={() => void loadTasks(true)}
            style={({ pressed }) => [
              styles.refreshButton,
              pressed && styles.pressed,
              (refreshing || loading) && styles.disabled,
            ]}
          >
            {refreshing ? (
              <ActivityIndicator color="#16324f" size="small" />
            ) : (
              <Text style={styles.refreshText}>Refresh</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="New task"
            editable={!adding}
            maxLength={160}
            onChangeText={setTitle}
            onSubmitEditing={() => void handleAdd()}
            placeholder="What needs doing?"
            placeholderTextColor="#7a8793"
            returnKeyType="done"
            style={styles.input}
            testID="task-input"
            value={title}
          />
          <Pressable
            accessibilityLabel="Add task"
            disabled={adding}
            onPress={() => void handleAdd()}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
              adding && styles.disabled,
            ]}
            testID="add-task"
          >
            {adding ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.addText}>Add</Text>
            )}
          </Pressable>
        </View>

        {error ? (
          <Text accessibilityLiveRegion="polite" style={styles.error} testID="error-message">
            {error}
          </Text>
        ) : null}

        {!loading && (
          <Text accessibilityLiveRegion="polite" style={styles.remainingCount} testID="remaining-task-count">
            {remainingCount} {remainingCount === 1 ? 'task' : 'tasks'} remaining
          </Text>
        )}
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color="#2f6bff" size="large" />
            <Text style={styles.stateText}>Loading saved tasks…</Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={tasks.length === 0 ? styles.emptyList : styles.list}
            data={tasks}
            keyExtractor={(task) => task.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.centerState}>
                <Text style={styles.emptyIcon}>✓</Text>
                <Text style={styles.emptyTitle}>Nothing here yet</Text>
                <Text style={styles.stateText}>Add the first tiny task above.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isUpdating = updatingId === item.id;
              return (
                <Pressable
                  accessibilityLabel={`${item.title}, ${item.completed ? 'completed' : 'not completed'}`}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: item.completed, disabled: isUpdating }}
                  disabled={isUpdating}
                  onPress={() => void handleToggle(item)}
                  style={({ pressed }) => [
                    styles.task,
                    pressed && styles.taskPressed,
                    isUpdating && styles.disabled,
                  ]}
                  testID={`task-${item.id}`}
                >
                  <View style={[styles.checkbox, item.completed && styles.checkboxDone]}>
                    {isUpdating ? (
                      <ActivityIndicator color={item.completed ? '#ffffff' : '#2f6bff'} size="small" />
                    ) : item.completed ? (
                      <Text style={styles.checkmark}>✓</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.taskTitle, item.completed && styles.taskTitleDone]}>
                    {item.title}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7fb' },
  container: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 720,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: Platform.OS === 'web' ? 40 : 64,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  eyebrow: { color: '#2f6bff', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 6 },
  heading: { color: '#16324f', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  subheading: { color: '#607080', fontSize: 15, marginTop: 4 },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: '#e4ebf7',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 42,
    minWidth: 82,
    paddingHorizontal: 14,
  },
  refreshText: { color: '#16324f', fontSize: 14, fontWeight: '700' },
  composer: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2ec',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 6,
  },
  input: { color: '#16324f', flex: 1, fontSize: 16, minHeight: 48, paddingHorizontal: 12 },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#2f6bff',
    borderRadius: 10,
    justifyContent: 'center',
    minWidth: 70,
    paddingHorizontal: 18,
  },
  addText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  error: {
    backgroundColor: '#fff0f0',
    borderColor: '#f4b8b8',
    borderRadius: 10,
    borderWidth: 1,
    color: '#a33030',
    fontSize: 14,
    marginTop: 12,
    padding: 12,
  },
  remainingCount: { color: '#607080', fontSize: 14, fontWeight: '600', marginTop: 18 },
  list: { gap: 10, paddingBottom: 24, paddingTop: 18 },
  emptyList: { flexGrow: 1 },
  task: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  taskPressed: { backgroundColor: '#f8faff' },
  checkbox: {
    alignItems: 'center',
    borderColor: '#9aabc0',
    borderRadius: 8,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  checkboxDone: { backgroundColor: '#2f6bff', borderColor: '#2f6bff' },
  checkmark: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  taskTitle: { color: '#243b53', flex: 1, fontSize: 16, fontWeight: '600' },
  taskTitleDone: { color: '#8795a5', textDecorationLine: 'line-through' },
  centerState: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 36 },
  emptyIcon: { color: '#2f6bff', fontSize: 40, fontWeight: '900', marginBottom: 10 },
  emptyTitle: { color: '#16324f', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  stateText: { color: '#607080', marginTop: 10, textAlign: 'center' },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.6 },
});
