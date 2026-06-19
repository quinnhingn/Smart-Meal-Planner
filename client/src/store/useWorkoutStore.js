import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useWorkoutStore = create(
  persist(
    (set, get) => ({
      activeWorkout: null, // Holds routine data if a workout is in progress
      flatExercises: [], // Flattened list of exercises
      currentExerciseIndex: 0,
      currentExerciseTimeRemaining: 0, // Track time remaining for specific exercise
      timeElapsed: 0, // Total seconds
      status: 'IDLE', // 'IDLE' | 'IN_PROGRESS' | 'PAUSED' | 'REST' | 'DONE'
      savedVideoTimestamp: 0,
      completedIndexes: [],
      exerciseProgressMap: {},

      startWorkout: (routineData, startIndex = 0, startVideoTimestamp = 0, startTimer = undefined, existingCompleted = [], existingProgressMap = {}) => {
        const flatExercises = routineData.sections.flatMap(s => s.data);
        const currentExercise = flatExercises[startIndex] || flatExercises[0];
        set({
          activeWorkout: routineData,
          flatExercises,
          currentExerciseIndex: startIndex,
          currentExerciseTimeRemaining: startTimer !== undefined ? startTimer : (currentExercise.duration_seconds || 60),
          timeElapsed: 0,
          status: 'IN_PROGRESS',
          savedVideoTimestamp: startVideoTimestamp,
          completedIndexes: existingCompleted,
          exerciseProgressMap: existingProgressMap
        });
      },

      resumeWorkout: () => set({ status: 'IN_PROGRESS' }),
      pauseWorkout: () => set({ status: 'PAUSED' }),

      updateTimer: () => set((state) => {
        if (state.status !== 'IN_PROGRESS') return state;
        
        // Timer for current exercise
        let newRemaining = state.currentExerciseTimeRemaining - 1;
        if (newRemaining <= 0) newRemaining = 0; // Prevent negative
        
        return {
          currentExerciseTimeRemaining: newRemaining,
          timeElapsed: state.timeElapsed + 1
        };
      }),

      nextExercise: () => set((state) => {
        const nextIndex = state.currentExerciseIndex + 1;
        const newCompleted = [...state.completedIndexes];
        if (!newCompleted.includes(state.currentExerciseIndex)) {
            newCompleted.push(state.currentExerciseIndex);
        }
        
        const newProgressMap = { ...state.exerciseProgressMap };
        delete newProgressMap[state.currentExerciseIndex];

        // Tìm bài tập CHƯA hoàn thành tiếp theo
        let targetIndex = -1;
        for (let i = nextIndex; i < state.flatExercises.length; i++) {
          if (!newCompleted.includes(i)) {
            targetIndex = i;
            break;
          }
        }
        
        // Nếu không có ở phía sau, vòng lại từ đầu để tìm bài CHƯA hoàn thành
        if (targetIndex === -1) {
          for (let i = 0; i < state.currentExerciseIndex; i++) {
            if (!newCompleted.includes(i)) {
              targetIndex = i;
              break;
            }
          }
        }

        // Nếu vẫn không tìm thấy, nghĩa là TẤT CẢ đã hoàn thành!
        if (targetIndex === -1) {
          return { status: 'DONE', completedIndexes: newCompleted, exerciseProgressMap: newProgressMap };
        }
        
        const nextEx = state.flatExercises[targetIndex];
        return {
          currentExerciseIndex: targetIndex,
          currentExerciseTimeRemaining: nextEx.duration_seconds || 60,
          savedVideoTimestamp: 0,
          status: 'REST', // Put into rest mode before starting next
          completedIndexes: newCompleted,
          exerciseProgressMap: newProgressMap
        };
      }),

      skipExercise: () => set((state) => {
        const nextIndex = state.currentExerciseIndex + 1;
        const newCompleted = [...state.completedIndexes]; // Không add current index
        const newProgressMap = { ...state.exerciseProgressMap };
        delete newProgressMap[state.currentExerciseIndex];

        // Tìm bài tập CHƯA hoàn thành tiếp theo
        let targetIndex = -1;
        for (let i = nextIndex; i < state.flatExercises.length; i++) {
          if (!newCompleted.includes(i)) {
            targetIndex = i;
            break;
          }
        }
        
        // Vòng lại từ đầu
        if (targetIndex === -1) {
          for (let i = 0; i < state.currentExerciseIndex; i++) {
            if (!newCompleted.includes(i)) {
              targetIndex = i;
              break;
            }
          }
        }

        // Nếu chỉ còn 1 bài này là chưa hoàn thành và ta skip nó luôn -> xem như xong
        if (targetIndex === -1) {
          return { status: 'DONE', completedIndexes: newCompleted, exerciseProgressMap: newProgressMap };
        }
        
        const nextEx = state.flatExercises[targetIndex];
        return {
          currentExerciseIndex: targetIndex,
          currentExerciseTimeRemaining: nextEx.duration_seconds || 60,
          savedVideoTimestamp: 0,
          status: 'REST',
          completedIndexes: newCompleted,
          exerciseProgressMap: newProgressMap
        };
      }),

      prevExercise: () => set((state) => {
        const prevIndex = Math.max(0, state.currentExerciseIndex - 1);
        const prevEx = state.flatExercises[prevIndex];
        return {
          currentExerciseIndex: prevIndex,
          currentExerciseTimeRemaining: prevEx.duration_seconds || 60,
          savedVideoTimestamp: 0,
        };
      }),

      finishWorkout: () => set({
        activeWorkout: null,
        flatExercises: [],
        currentExerciseIndex: 0,
        currentExerciseTimeRemaining: 0,
        timeElapsed: 0,
        status: 'IDLE'
      }),

      quitEarly: () => {
        // Calculate calories burned so far based on timeElapsed
        const { timeElapsed, activeWorkout } = get();
        // Estimate burned cal: (actual time / total time) * total calories
        let burned = 0;
        if (activeWorkout && activeWorkout.duration_minutes > 0) {
          const totalSeconds = activeWorkout.duration_minutes * 60;
          burned = Math.round((timeElapsed / totalSeconds) * activeWorkout.calories);
        }
        
        set({
          activeWorkout: null,
          flatExercises: [],
          currentExerciseIndex: 0,
          currentExerciseTimeRemaining: 0,
          timeElapsed: 0,
          status: 'IDLE'
        });

        return { timeElapsed, burned };
      }
    }),
    {
      name: 'workout-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage to persist data
    }
  )
);
