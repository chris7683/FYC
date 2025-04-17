import React, { createContext, useContext, useState } from 'react';

type Task = {
  text: string;
  status: string;
  date: string;
};

type TasksContextType = {
  tasks: { [key: string]: Task[] };
  setTasks: React.Dispatch<React.SetStateAction<{ [key: string]: Task[] }>>;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({});

  return (
    <TasksContext.Provider value={{ tasks, setTasks }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) throw new Error('useTasks must be used within TasksProvider');
  return context;
};
