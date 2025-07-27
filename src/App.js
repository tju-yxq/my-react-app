// App.js
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'; // 修改导入
import MainPage from './pages/MainPage/MainPage';
import AuthPage from './pages/AuthPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import Settings from './pages/Settings/index';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import { ToastService } from './components/common/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import UserCenter from './pages/user/UserCenter';
import TestPage from './tests/TestPage';
import DeveloperConsole from './pages/DeveloperConsolePage/DeveloperConsolePage';
import './App.css';

// 路由重定向组件
const RouteHandler = () => {
  const location = useLocation();

  // 如果访问的是空路径或者只有 hash，重定向到首页
  useEffect(() => {
    if (location.pathname === '' || location.pathname === '/') {
      // 确保在首页
    }
  }, [location]);

  return null;
};

function App() {
  return (
    <Router> {/* 修改为HashRouter */}
      <ThemeProvider>
        <AuthProvider>
          <ToastService />
          <div className="App">
            <NavBar />
            <RouteHandler />
            <div className="content-wrapper">
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:id" element={<ServiceDetailPage />} />
                <Route path="/settings/*" element={<Settings />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/user" element={
                  <ProtectedRoute>
                    <UserCenter />
                  </ProtectedRoute>
                } />
                <Route path="/developer" element={
                  <ProtectedRoute requireRole="developer">
                    <DeveloperConsole />
                  </ProtectedRoute>
                } />
                <Route path="/developer/services/:id" element={
                  <ProtectedRoute requireRole="developer">
                    <DeveloperConsole />
                  </ProtectedRoute>
                } />
                <Route path="/developer/apps/:id" element={
                  <ProtectedRoute requireRole="developer">
                    <DeveloperConsole />
                  </ProtectedRoute>
                } />
                <Route path="/test" element={<TestPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;