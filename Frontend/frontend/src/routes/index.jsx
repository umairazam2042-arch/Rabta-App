import { createBrowserRouter } from 'react-router'
import GuestRoute from './GuestRoute'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import AuthLayout from '../layouts/AuthLayout'
import MainLayout from '../layouts/MainLayout'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import HomePage from '../pages/HomePage'
import ProfilePage from '../pages/ProfilePage'
import NotFoundPage from '../pages/NotFoundPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminUserDetailPage from '../pages/admin/AdminUserDetailPage'
import ShotsPage from '../pages/ShotsPage'
import MessagesPage from '../pages/MessagesPage'
import PhotoPage from '../pages/PhotoPage'

const router = createBrowserRouter([
  // Sirf bina login walon ke liye: login / register
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
     
        ],
      },
    ],
  },
  // Sirf login walon ke liye: baqi app
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/profile/:username', element: <ProfilePage /> },
          { path: '/messages/:username?', element: <MessagesPage /> },
         { path: '/shots', element: <ShotsPage /> },
         { path: '/photo', element: <PhotoPage /> },

          // Sirf admin ke liye
          {
            path: '/admin',
            element: <AdminRoute />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'users/:id', element: <AdminUserDetailPage /> },
            ],
          },
        ],
      },
    ],
  },
  // Koi aur address
  { path: '*', element: <NotFoundPage /> },
])

export default router