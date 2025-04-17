"use client"

import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import moment from "moment"
import { useTheme } from "../context/ThemeContext"

type Task = {
  id: string
  name: string
  date: string
  timestamp: any
}

const CompletedTasksScreen = () => {
  const [tasksByDate, setTasksByDate] = useState<{ [date: string]: Task[] }>({})
  const [selectedDate, setSelectedDate] = useState(moment())
  const { theme } = useTheme()

  useEffect(() => {
    const user = auth().currentUser
    if (!user) return

    const unsubscribe = firestore()
      .collection("completedTasks")
      .where("userId", "==", user.uid)
      .orderBy("timestamp", "desc")
      .onSnapshot(
        (snapshot) => {
          const groupedTasks: { [date: string]: Task[] } = {}

          snapshot.forEach((doc) => {
            const data = doc.data()
            const taskDate = data.date
            if (!groupedTasks[taskDate]) {
              groupedTasks[taskDate] = []
            }

            groupedTasks[taskDate].push({
              id: doc.id,
              name: data.name,
              date: data.date,
              timestamp: data.timestamp,
            })
          })

          setTasksByDate(groupedTasks)
        },
        (error) => {
          console.error("Error listening to completed tasks:", error)
        }
      )

    return () => unsubscribe()
  }, [])

  const goToPreviousDay = () => {
    setSelectedDate((prev) => moment(prev).subtract(1, "day"))
  }

  const goToNextDay = () => {
    setSelectedDate((prev) => moment(prev).add(1, "day"))
  }

  const currentDateKey = selectedDate.format("YYYY-MM-DD")
  const tasksForSelectedDate = tasksByDate[currentDateKey] || []

  return (
    <SafeAreaView style={[styles.container, theme === "dark" && styles.darkContainer]}>
      {/* Header Title */}
      <View style={[styles.headerContainer, theme === "dark" && styles.darkHeader]}>
        <Text style={[styles.headerText, theme === "dark" && styles.darkText]}>
          Completed Tasks
        </Text>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={goToPreviousDay} style={styles.navButton}>
          <Text style={styles.navText}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.dateText, theme === "dark" && styles.darkText]}>
          {selectedDate.format("dddd, MMM D")}
        </Text>

        <TouchableOpacity onPress={goToNextDay} style={styles.navButton}>
          <Text style={styles.navText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      {tasksForSelectedDate.length === 0 ? (
        <View style={styles.noTasks}>
          <Text style={[styles.noTasksText, theme === "dark" && styles.darkText]}>
            No completed tasks for this day.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasksForSelectedDate}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.taskList}
          renderItem={({ item }) => (
            <View style={[styles.taskItem, theme === "dark" && styles.darkTaskItem]}>
              <Text style={[styles.taskText, theme === "dark" && styles.darkText]}>
                ✅ {item.name}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  darkContainer: { backgroundColor: "#121212" },

  headerContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  darkHeader: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#212529",
  },

  dateNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  navButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
  },
  navText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  darkText: {
    color: "#f8f9fa",
  },

  noTasks: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTasksText: {
    fontSize: 16,
    color: "#6c757d",
  },

  taskList: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: "#e9ecef",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  darkTaskItem: {
    backgroundColor: "#333",
  },
  taskText: {
    fontSize: 16,
    fontWeight: "500",
  },
})

export default CompletedTasksScreen
