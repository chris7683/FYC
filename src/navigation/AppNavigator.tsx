import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import DashboardScreen from "../screens/DashboardScreen"
import CompletedTasksScreen from "../screens/CompletedTasksScreen"
import SettingsScreen from "../screens/SettingsScreen"
// Make sure this component exists or create it
import TasksScreen from "../screens/TasksScreen"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"

const Tab = createBottomTabNavigator()

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "white",
        tabBarStyle: {
          backgroundColor: "#007bff",
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={CompletedTasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="list-alt" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Completed"
        component={CompletedTasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="check-circle" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default AppNavigator
