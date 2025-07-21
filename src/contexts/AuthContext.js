import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { toast } from '../components/common/Toast';

// 创建认证上下文
export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
  role: null,
  login: () => {},
  register: () => {},
  logout: () => {},
  clearError: () => {}
});

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'user');

  // 清除错误
  const clearError = () => setError(null);

  // 清除认证状态
  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setToken(null);
    setUser(null);
    setRole('user');
    setIsAuthenticated(false);
    apiClient.setAuthToken(null);
  }, []);

  // 设置认证状态
  const setAuth = useCallback((userData, authToken, userRole) => {
    if (!authToken) {
      clearAuth();
      return;
    }
    
    localStorage.setItem('token', authToken);
    localStorage.setItem('userRole', userRole || 'user');
    
    setToken(authToken);
    setUser(userData || { username: 'user' }); // 确保 user 不为 null
    setRole(userRole || 'user');
    setIsAuthenticated(true);
    setLoading(false);
    apiClient.setAuthToken(authToken);
  }, [clearAuth]);

  // 登录
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.login(username, password);
      
      if (response && response.success) {
        // 确保使用正确的数据结构
        const userData = response.user || { username, role: response.role || 'user' };
        const role = response.role || response.user?.role || 'user';
        
        setAuth(userData, response.token, role);
        toast.success('登录成功');
        return {
          success: true,
          user: userData,
          token: response.token,
          role: role
        };
      } else {
        const errorMsg = response?.message || '登录失败';
        setError(errorMsg);
        setLoading(false);
        toast.error(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || '登录失败，请稍后再试';
      console.error('登录过程中出错:', err);
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // 注册
  const register = async (username, password, email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.register(username, password, email);
      
      if (response.success) {
        setAuth(response.user, response.token, response.user?.role);
        toast.success('注册成功');
        return true;
      } else {
        setError(response.message || '注册失败');
        setLoading(false);
        toast.error(response.message || '注册失败');
        return false;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || '注册失败，请稍后再试';
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
      return false;
    }
  };

  // 注销
  const logout = () => {
    clearAuth();
    toast.success('已退出登录');
  };

  // 检查并刷新token
  const checkAuth = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      clearAuth();
      return;
    }
    
    try {
      // 设置API客户端的token
      apiClient.setAuthToken(currentToken);
      
      // 获取用户信息
      const userData = await apiClient.getUserInfo();
      
      if (userData && userData.id) {  // 检查用户数据是否有效
        setUser(userData);
        setRole(userData.role || 'user');
        setIsAuthenticated(true);
        setToken(currentToken);
        setLoading(false);
      } else {
        // 如果获取用户信息失败，尝试刷新token
        try {
          const refreshResult = await apiClient.refreshToken();
          if (refreshResult?.success && refreshResult.token) {
            setAuth(refreshResult.user, refreshResult.token, refreshResult.role);
          } else {
            clearAuth();
          }
        } catch (refreshErr) {
          console.error('刷新token失败:', refreshErr);
          clearAuth();
        }
      }
    } catch (err) {
      console.error('检查认证状态失败:', err);
      clearAuth();
    }
  }, [clearAuth, setAuth, setUser, setRole, setToken, setLoading]);

  // 初始化加载用户信息
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 提供上下文值
  const authContextValue = {
    isAuthenticated,
    user,
    token,
    loading,
    error,
    role,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 