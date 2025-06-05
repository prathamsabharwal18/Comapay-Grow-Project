import React from 'react';
import LoginPage from './pages/LoginPage';
import EmployeeCourses from './pages/Employee/CoursesPage';
import AdminCourses from './pages/Admin/Coursespage';
import AdminProjects from './pages/Admin/ProjectPage';
import { Routes, Route } from 'react-router-dom';
import MyCoursesPage from './pages/Employee/MyCoursesPage';
import ProjectsPage from './pages/Employee/ProjectsPage';
import ProfilePage from './pages/Employee/ProfilePage';
import AllEmployeesPage from './pages/Admin/Employeepage';
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/employee/courses" element={<EmployeeCourses />} />
      <Route path="/admin/courses" element={<AdminCourses />} />
      <Route path="/admin/projects" element={<AdminProjects />} />
      <Route path="/employee/projects" element={<ProjectsPage/>} />
      <Route path="/my-courses" element={<MyCoursesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin/employees" element={<AllEmployeesPage />} />
      <Route path="/employees/:userId" element={<ProfilePage/>} />
    </Routes>
  );
}

export default App;
