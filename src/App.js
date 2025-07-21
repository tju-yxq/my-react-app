import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage/MainPage';
import AuthPage from './pages/AuthPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import Settings from './pages/Settings/index';
import AboutPage from './pages/AboutPage'; // 步骤 1: 在这里导入新创建的 "关于" 页面
import { ToastService } from './components/common/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import UserCenter from './pages/user/UserCenter';
import TestPage from './tests/TestPage';
import DeveloperConsole from './pages/DeveloperConsolePage/DeveloperConsolePage';
import './App.css';


function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastService />
          <div className="App">
            <NavBar />
            <div className="content-wrapper">
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:id" element={<ServiceDetailPage />} />
                <Route path="/settings/*" element={<Settings />} />
                
                {/* 步骤 2: 在这里添加新的路由规则。我把它放在了 "settings" 路由的下面 */}
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
                <Route path="*" element={<div>页面不存在</div>} />
              </Routes>
            </div>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
