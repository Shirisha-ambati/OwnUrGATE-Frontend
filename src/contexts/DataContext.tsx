import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { questionsApi, subjectsApi, quizzesApi, attemptsApi, isBackendAvailable } from "@/lib/api";
import { getQuestions as lsGetQuestions, getSubjects as lsGetSubjects, getAttempts as lsGetAttempts, getQuizzes as lsGetQuizzes } from "@/lib/storage";
import type { Question, Subject, Quiz, QuizAttempt } from "@/types";

interface DataContextType {
  questions: Question[];
  subjects: Subject[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  loading: boolean;
  // CRUD
  addQuestion: (data: any) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  updateQuestion: (id: string, data: any) => Promise<void>;
  addSubject: (data: any) => Promise<void>;
  updateSubject: (id: string, data: any) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addQuiz: (data: any) => Promise<void>;
  addAttempt: (data: any) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  questions: [],
  subjects: [],
  quizzes: [],
  attempts: [],
  loading: true,
  addQuestion: async () => {},
  deleteQuestion: async () => {},
  updateQuestion: async () => {},
  addSubject: async () => {},
  updateSubject: async () => {},
  deleteSubject: async () => {},
  addQuiz: async () => {},
  addAttempt: async () => {},
  refreshAll: async () => {},
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setQuestions([]);
      setSubjects([]);
      setQuizzes([]);
      setAttempts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const backendUp = await isBackendAvailable();
      setOnline(backendUp);

      if (backendUp) {
        const [qs, subs, qzs, atts] = await Promise.all([
          questionsApi.list(),
          subjectsApi.list(),
          quizzesApi.list(),
          attemptsApi.list(),
        ]);
        setQuestions(qs);
        setSubjects(subs);
        setQuizzes(qzs);
        setAttempts(atts);
      } else {
        // Offline fallback — read from localStorage
        setQuestions(lsGetQuestions());
        setSubjects(lsGetSubjects());
        setQuizzes(lsGetQuizzes());
        setAttempts(lsGetAttempts());
      }
    } catch (err) {
      console.error("DataContext fetch error:", err);
      // Fallback to localStorage
      setQuestions(lsGetQuestions());
      setSubjects(lsGetSubjects());
      setQuizzes(lsGetQuizzes());
      setAttempts(lsGetAttempts());
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // --- CRUD: Questions ---
  const addQuestion = useCallback(async (data: any) => {
    try {
      const created = await questionsApi.create(data);
      setQuestions(prev => [created, ...prev]);
    } catch {
      // offline fallback: not adding to localStorage since we want server-first
      console.error("Failed to save question to server");
      throw new Error("Failed to save question. Is the backend running?");
    }
  }, []);

  const deleteQuestion = useCallback(async (id: string) => {
    try {
      await questionsApi.remove(id);
      setQuestions(prev => prev.filter(q => q.id !== id && (q as any)._id !== id));
    } catch {
      console.error("Failed to delete question from server");
    }
  }, []);

  const updateQuestion = useCallback(async (id: string, data: any) => {
    try {
      const updated = await questionsApi.update(id, data);
      setQuestions(prev => prev.map(q => (q.id === id || (q as any)._id === id) ? updated : q));
    } catch {
      console.error("Failed to update question on server");
    }
  }, []);

  // --- CRUD: Subjects ---
  const addSubject = useCallback(async (data: any) => {
    try {
      const created = await subjectsApi.create(data);
      setSubjects(prev => [...prev, created]);
    } catch {
      console.error("Failed to save subject to server");
      throw new Error("Failed to save subject. Is the backend running?");
    }
  }, []);

  const updateSubjectFn = useCallback(async (id: string, data: any) => {
    try {
      const updated = await subjectsApi.update(id, data);
      setSubjects(prev => prev.map(s => (s.id === id || (s as any)._id === id) ? updated : s));
    } catch {
      console.error("Failed to update subject on server");
    }
  }, []);

  const deleteSubjectFn = useCallback(async (id: string) => {
    try {
      await subjectsApi.remove(id);
      setSubjects(prev => prev.filter(s => s.id !== id && (s as any)._id !== id));
    } catch {
      console.error("Failed to delete subject from server");
    }
  }, []);

  // --- CRUD: Quizzes ---
  const addQuiz = useCallback(async (data: any) => {
    try {
      const created = await quizzesApi.create(data);
      setQuizzes(prev => [created, ...prev]);
    } catch {
      console.error("Failed to save quiz to server");
    }
  }, []);

  // --- CRUD: Attempts ---
  const addAttempt = useCallback(async (data: any) => {
    try {
      const created = await attemptsApi.create(data);
      setAttempts(prev => [created, ...prev]);
    } catch {
      console.error("Failed to save attempt to server");
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        questions,
        subjects,
        quizzes,
        attempts,
        loading,
        addQuestion,
        deleteQuestion,
        updateQuestion,
        addSubject,
        updateSubject: updateSubjectFn,
        deleteSubject: deleteSubjectFn,
        addQuiz,
        addAttempt,
        refreshAll: fetchAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
