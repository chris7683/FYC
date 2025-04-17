"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"
import { useTheme } from "../context/ThemeContext"

const DashboardScreen = () => {
  const navigation = useNavigation()
  const { theme } = useTheme()

  const [tasks, setTasks] = useState<{ [key: string]: { text: string; status: string }[] }>({})
  const [selectedDate, setSelectedDate] = useState(moment())
  const [selectedDay, setSelectedDay] = useState<string | null>(moment().format("YYYY-MM-DD"))
  const [newTask, setNewTask] = useState("")
  const [displayName, setDisplayName] = useState<string | null>(null)

  // Load user display name
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setDisplayName(user ? user.displayName || "User" : null)
    })
    return () => unsubscribe()
  }, [])

  // Navigate between weeks
  const changeWeek = (direction: number) => {
    setSelectedDate((prevDate) => moment(prevDate).add(direction * 7, "days"))
    setSelectedDay(null)
  }

  // Add a new task
  const addTask = () => {
    if (!selectedDay || newTask.trim() === "") return
    setTasks((prevTasks) => ({
      ...prevTasks,
      [selectedDay]: [...(prevTasks[selectedDay] || []), { text: newTask.trim(), status: "Pending" }],
    }))
    setNewTask("")
  }

  // Complete a task and save to Firestore
  const completeTask = async (dateKey: string, index: number) => {
    setTasks((prevTasks) => {
      const dayTasks = prevTasks[dateKey] || []
      const taskToUpdate = { ...dayTasks[index] }

      if (taskToUpdate.status === "Completed") return prevTasks // Already completed

      taskToUpdate.status = "Completed"
      const updatedTasks = [...dayTasks]
      updatedTasks[index] = taskToUpdate

      const user = auth().currentUser
      if (user) {
        firestore()
          .collection("completedTasks")
          .add({
            userId: user.uid,
            date: dateKey,
            name: taskToUpdate.text,
            timestamp: firestore.FieldValue.serverTimestamp(),
          })
          .then(() => console.log("Task saved to Firestore"))
          .catch((error) => console.error("Error saving task:", error))
      }

      return { ...prevTasks, [dateKey]: updatedTasks }
    })
  }

  const goToCompletedTasks = () => {
    navigation.navigate("CompletedTasksScreen")
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.safeArea, theme === "dark" && styles.darkContainer]}>
        {/* Header */}
        <View style={[styles.header, theme === "dark" && styles.darkHeader]}>
          <Text style={[styles.welcomeText, theme === "dark" && styles.darkText]}>
            Welcome, <Text style={styles.username}>{displayName || "Loading..."}</Text>!
          </Text>
          <TouchableOpacity onPress={goToCompletedTasks} style={styles.completedTasksButton}>
            <Text style={styles.completedTasksButtonText}>Completed Tasks</Text>
          </TouchableOpacity>
        </View>

        {/* Week Navigation */}
        <View style={[styles.weekNav, theme === "dark" && styles.darkWeekNav]}>
          <TouchableOpacity onPress={() => changeWeek(-1)} style={styles.navButton}>
            <Text style={styles.navText}>← Previous</Text>
          </TouchableOpacity>
          <Text style={[styles.currentWeek, theme === "dark" && styles.darkText]}>
            {selectedDate.clone().startOf("week").format("MMM D")} -{" "}
            {selectedDate.clone().endOf("week").format("MMM D")}
          </Text>
          <TouchableOpacity onPress={() => changeWeek(1)} style={styles.navButton}>
            <Text style={styles.navText}>Next →</Text>
          </TouchableOpacity>
        </View>

        {/* Day and Task List */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {Array.from({ length: 7 }).map((_, i) => {
            const currentDate = selectedDate.clone().startOf("week").add(i, "days")
            const dateKey = currentDate.format("YYYY-MM-DD")
            const dayTasks = tasks[dateKey] || []

            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedDay(dateKey)}
                style={[styles.dayContainer, theme === "dark" && styles.darkDayContainer]}
              >
                <Text style={[styles.dayTitle, theme === "dark" && styles.darkText]}>
                  {currentDate.format("dddd, MMM D")}
                </Text>

                {dayTasks.length > 0 ? (
                  dayTasks.map((task, index) => (
                    <View key={index} style={styles.taskRow}>
                      <Text
                        style={[
                          styles.taskText,
                          theme === "dark" && styles.darkText,
                          task.status === "Completed" && styles.completedTask,
                        ]}
                      >
                        {task.text} - <Text style={styles.status}>{task.status}</Text>
                      </Text>
                      {task.status !== "Completed" && (
                        <TouchableOpacity onPress={() => completeTask(dateKey, index)} style={styles.completeButton}>
                          <Text style={styles.completeButtonText}>✔</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={[styles.noTaskText, theme === "dark" && styles.darkText]}>No tasks for today</Text>
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Add Task Input */}
        {selectedDay && (
          <View style={[styles.inputContainer, theme === "dark" && styles.darkInputContainer]}>
            <TextInput
              style={[styles.input, theme === "dark" && styles.darkInput]}
              placeholder={`Add task for ${moment(selectedDay).format("ddd, MMM D")}`}
              placeholderTextColor={theme === "dark" ? "#aaa" : "#666"}
              value={newTask}
              onChangeText={setNewTask}
            />
            <TouchableOpacity onPress={addTask} style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  darkContainer: { backgroundColor: "#121212" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  darkHeader: { backgroundColor: "#333", borderColor: "#444" },
  welcomeText: { fontSize: 24, fontWeight: "bold" },
  darkText: { color: "#f8f9fa" },
  username: { color: "#007bff" },
  completedTasksButton: {
    backgroundColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  completedTasksButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  weekNav: { flexDirection: "row", justifyContent: "space-between", padding: 10, backgroundColor: "#fff" },
  darkWeekNav: { backgroundColor: "#444" },
  navButton: { paddingVertical: 8, paddingHorizontal: 15, backgroundColor: "#007bff", borderRadius: 8 },
  navText: { color: "white", fontWeight: "bold" },
  currentWeek: { fontSize: 16, fontWeight: "bold" },

  scrollContainer: { flexGrow: 1, paddingTop: 20 },
  dayContainer: { backgroundColor: "#ffffff", padding: 20, marginBottom: 10, borderRadius: 12 },
  darkDayContainer: { backgroundColor: "#222" },
  dayTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  taskText: { fontSize: 16, marginTop: 5 },
  completedTask: { textDecorationLine: "line-through", color: "#28a745" },
  status: { fontWeight: "bold", color: "#28a745" },
  noTaskText: { fontSize: 16, fontStyle: "italic", color: "#6c757d" },

  taskRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  completeButton: { marginLeft: 10, backgroundColor: "#28a745", padding: 5, borderRadius: 6 },
  completeButtonText: { color: "white", fontWeight: "bold", fontSize: 14 },

  inputContainer: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#fff" },
  darkInputContainer: { backgroundColor: "#333" },
  input: { flex: 1, padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginRight: 10 },
  darkInput: { borderColor: "#555", color: "#fff" },
  addButton: { padding: 10, backgroundColor: "#28a745", borderRadius: 8 },
  addButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
})

export default DashboardScreen
