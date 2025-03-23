import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker'; // Correct Picker import

import moment from 'moment';

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [tasks, setTasks] = useState<{ [key: string]: { text: string; status: string }[] }>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment());

  const addTask = () => {
    if (!newTask.trim() || !selectedDay) return;
    setTasks((prevTasks) => ({
      ...prevTasks,
      [selectedDay]: [...(prevTasks[selectedDay] || []), { text: newTask, status: 'Pending' }],
    }));
    setNewTask('');
  };

  const updateTaskStatus = (date: string, index: number, newStatus: string) => {
    setTasks((prevTasks) => ({
      ...prevTasks,
      [date]: prevTasks[date].map((task, i) => (i === index ? { ...task, status: newStatus } : task)),
    }));
  };

  const changeWeek = (direction: number) => {
    setSelectedDate((prevDate) => moment(prevDate).add(direction * 7, 'days'));
    setSelectedDay(null);
  };

  return (
    <View style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.title}>
          Welcome, <Text style={styles.username}>[User Name]</Text>!
        </Text>

        {/* Week Navigation */}
        <View style={styles.weekNav}>
          <TouchableOpacity onPress={() => changeWeek(-1)} style={styles.navButton}>
            <Text style={styles.navText}>← Previous</Text>
          </TouchableOpacity>
          <Text style={styles.currentWeek}>
            {selectedDate.clone().startOf('week').format('MMM D')} -{' '}
            {selectedDate.clone().endOf('week').format('MMM D')}
          </Text>
          <TouchableOpacity onPress={() => changeWeek(1)} style={styles.navButton}>
            <Text style={styles.navText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* To-Do List Section */}
      <View style={styles.todoSection}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {[...Array(7)].map((_, i) => {
            const currentDate = selectedDate.clone().startOf('week').add(i, 'days');
            const dateKey = currentDate.format('YYYY-MM-DD');

            return (
              <TouchableOpacity key={i} onPress={() => setSelectedDay(dateKey)} style={styles.dayContainer}>
                <Text style={styles.dayTitle}>{currentDate.format('dddd, MMM D')}</Text>
                {tasks[dateKey]?.length ? (
                  tasks[dateKey].map((task, index) => (
                    <View key={index} style={styles.taskRow}>
                      <Text style={styles.taskItem}>• {task.text}</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={task.status}
                          onValueChange={(value) => updateTaskStatus(dateKey, index, value)}
                          mode="dropdown" // Ensures proper dropdown behavior on Android & iOS
                        >
                          <Picker.Item label="Pending" value="Pending" />
                          <Picker.Item label="Completed" value="Completed" />
                          <Picker.Item label="Late" value="Late" />
                        </Picker>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noTaskText}>No tasks for today</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Task Input Section */}
      {selectedDay && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={`Add task for ${moment(selectedDay).format('ddd, MMM D')}`}
            value={newTask}
            onChangeText={setNewTask}
          />
          <TouchableOpacity onPress={addTask} style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// 🖌 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  welcomeSection: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  username: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  navText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  currentWeek: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  todoSection: {
    flex: 2,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  dayContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 3,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskItem: {
    fontSize: 16,
    paddingVertical: 4,
    color: '#495057',
    flex: 1,
  },
  pickerWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    backgroundColor: '#e9ecef',
    overflow: 'hidden',
    width: 120,
  },
  noTaskText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#6c757d',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'ghostwhite',
    paddingHorizontal: 10,
    paddingVertical: 10,
    elevation: 5,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
