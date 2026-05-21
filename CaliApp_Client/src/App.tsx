import { QueryClientProvider } from '@tanstack/react-query';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import { ProtectedRoute } from './components/auth/ProtectedRoute/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout/AuthLayout';
import { LoginPage } from './pages/auth/LoginPage/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage/ForgotPasswordPage';
import { DashboardPage } from './pages/dashboard/DashboardPage/DashboardPage';
import { ExercisesPage } from './pages/exercises/ExercisesPage/ExercisesPage';
import { ExerciseDetailPage } from './pages/exercises/ExerciseDetailPage/ExerciseDetailPage';
import { WorkoutTablesPage } from './pages/workout-tables/WorkoutTablesPage/WorkoutTablesPage';
import { WorkoutTableDetailPage } from './pages/workout-tables/WorkoutTableDetailPage/WorkoutTableDetailPage';
import { WorkoutTableEditPage } from './pages/workout-tables/WorkoutTableEditPage/WorkoutTableEditPage';
import { ActiveWorkoutPage } from './pages/workout-sessions/ActiveWorkoutPage/ActiveWorkoutPage';
import { WorkoutSessionsPage } from './pages/workout-sessions/WorkoutSessionsPage/WorkoutSessionsPage';
import { WorkoutSessionDetailPage } from './pages/workout-sessions/WorkoutSessionDetailPage/WorkoutSessionDetailPage';
import { SharedWithMePage } from './pages/sharing/SharedWithMePage/SharedWithMePage';
import { StatsPage } from './pages/stats/StatsPage/StatsPage';
import { ProfilePage } from './pages/profile/ProfilePage/ProfilePage';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
          <Route path="/workout-tables" element={<WorkoutTablesPage />} />
          <Route path="/workout-tables/:id" element={<WorkoutTableDetailPage />} />
          <Route path="/workout-tables/:id/edit" element={<WorkoutTableEditPage />} />
          <Route path="/workout" element={<ActiveWorkoutPage />} />
          <Route path="/workout-sessions" element={<WorkoutSessionsPage />} />
          <Route path="/workout-sessions/:id" element={<WorkoutSessionDetailPage />} />
          <Route path="/shared-with-me" element={<SharedWithMePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
