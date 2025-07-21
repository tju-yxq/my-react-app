import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import GlobalStyles from '../styles/GlobalStyles';

// 深色主题
const darkTheme = {
  primary: '#4FD1C5',
  secondary: '#805AD5',
  background: '#1E1E2F',
  surface: '#27293D',
  text: '#F8F8F8',
  textSecondary: '#A0AEC0',
  border: '#2D3748',
  error: '#FC8181',
  success: '#68D391',
  warning: '#F6E05E',
  dialogBackground: '#27293D',
  dialogOverlay: 'rgba(0, 0, 0, 0.75)',
  buttonBackground: '#4FD1C5',
  buttonText: '#1A202C',
  shadowColor: 'rgba(0, 0, 0, 0.5)',
  cardBackground: '#2D3748',
  navBackground: '#1E1E2F',
  recorderBackground: '#2D3748',
  isDark: true
};

// 浅色主题
const lightTheme = {
  primary: '#4FD1C5',
  secondary: '#805AD5',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#1A202C',
  textSecondary: '#4A5568',
  border: '#E2E8F0',
  error: '#FC8181',
  success: '#68D391',
  warning: '#F6E05E',
  dialogBackground: '#FFFFFF',
  dialogOverlay: 'rgba(0, 0, 0, 0.4)',
  buttonBackground: '#4FD1C5',
  buttonText: '#FFFFFF',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  cardBackground: '#FFFFFF',
  navBackground: '#EDF2F7',
  recorderBackground: '#EDF2F7',
  isDark: false
};

// 创建主题上下文
export const ThemeContext = createContext({
  theme: darkTheme,
  toggleTheme: () => {},
  updateThemeVariable: () => {}
});

/**
 * 主题上下文提供者组件
 */
export const ThemeProvider = ({ children, overrideValue }) => {
  // 初始化状态 - 总是在组件顶层调用hooks
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 尝试从本地存储中恢复主题设置
    if (typeof localStorage !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;  // 默认使用浅色主题
    }
    return false; // 默认浅色主题
  });
  
  // 立即设置初始主题（在组件挂载前）
  useLayoutEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      console.log('立即设置主题:', theme);
    }
  }, [isDarkMode]);
  
  // 存储自定义主题变量
  const [customTheme, setCustomTheme] = useState(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const savedCustomTheme = localStorage.getItem('customTheme');
        return savedCustomTheme ? JSON.parse(savedCustomTheme) : {};
      }
      return {};
    } catch (e) {
      console.error('Failed to parse custom theme from localStorage:', e);
      return {};
    }
  });
  
  // 初始化主题设置 - 确保在组件挂载时就设置正确的主题
  useEffect(() => {
    const applyTheme = (theme) => {
      if (typeof document !== 'undefined') {
        // 强制设置data-theme属性
        document.documentElement.setAttribute('data-theme', theme);
        
        // 获取当前主题对象
        const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
        
        // 直接应用主题对象中的值到CSS变量
        const themeVariables = {
          '--background': currentTheme.background,
          '--surface': currentTheme.surface,
          '--text': currentTheme.text,
          '--text-secondary': currentTheme.textSecondary,
          '--border': currentTheme.border,
          '--shadow': currentTheme.shadowColor,
          '--nav-background': currentTheme.navBackground,
          '--nav-text': currentTheme.text,
          '--text-color': currentTheme.text,
          '--link-color': currentTheme.text,
          '--button-background': currentTheme.buttonBackground,
          '--button-text': currentTheme.buttonText,
          '--recorder-background': currentTheme.recorderBackground
        };
        
        // 应用主题变量
        Object.entries(themeVariables).forEach(([key, value]) => {
          document.documentElement.style.setProperty(key, value);
          console.log(`设置CSS变量: ${key} = ${value}`);
        });
        
        // 强制设置页面背景色 - 绕过所有CSS冲突
        const forceSetPageBackground = () => {
          // 设置body背景色
          document.body.style.backgroundColor = currentTheme.background;
          document.body.style.color = currentTheme.text;
          
          // 设置html背景色
          document.documentElement.style.backgroundColor = currentTheme.background;
          document.documentElement.style.color = currentTheme.text;
          
          // 查找并强制设置.main-page元素
          const mainPageElement = document.querySelector('.main-page');
          if (mainPageElement) {
            mainPageElement.style.backgroundColor = currentTheme.background + ' !important';
            mainPageElement.style.color = currentTheme.text + ' !important';
            console.log('强制设置.main-page背景色:', currentTheme.background);
          }
          
          // 查找并强制设置.content-area元素
          const contentAreaElement = document.querySelector('.content-area');
          if (contentAreaElement) {
            contentAreaElement.style.backgroundColor = currentTheme.background + ' !important';
            contentAreaElement.style.color = currentTheme.text + ' !important';
            console.log('强制设置.content-area背景色:', currentTheme.background);
          }
          
          console.log('强制设置页面背景色完成:', currentTheme.background);
        };
        
        // 立即执行强制设置
        forceSetPageBackground();
        
        // 延迟再次执行，确保元素已渲染
        setTimeout(forceSetPageBackground, 100);
        setTimeout(forceSetPageBackground, 500);
        
        console.log(`主题已切换到: ${theme}，data-theme属性:`, document.documentElement.getAttribute('data-theme'));
        console.log('当前主题对象:', currentTheme);
        console.log('所有设置的CSS变量:', themeVariables);
      }
    };
    
    const theme = isDarkMode ? 'dark' : 'light';
    
    // 保存到本地存储
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    
    // 应用主题
    applyTheme(theme);
    
    // 应用自定义主题变量（覆盖默认主题变量）
    if (typeof document !== 'undefined') {
      Object.entries(customTheme).forEach(([key, value]) => {
        if (key !== 'isDark') {
          document.documentElement.style.setProperty(`--${key}`, value);
        }
      });
    }
  }, [isDarkMode, customTheme]);
  
  // 切换主题
  const toggleTheme = () => {
    // 清除自定义主题的本地存储
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('customTheme');
    }
    // 清除当前的自定义主题状态
    setCustomTheme({});
    // 切换主题
    setIsDarkMode(!isDarkMode);
  };
  
  // 更新主题变量
  const updateThemeVariable = (varName, value) => {
    // 更新CSS变量
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(varName, value);
    }
    
    // 更新自定义主题状态
    setCustomTheme(prev => {
      const newCustomTheme = { 
        ...prev,
        [varName.replace('--', '')]: value 
      };
      
      // 保存到本地存储
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('customTheme', JSON.stringify(newCustomTheme));
      }
      
      return newCustomTheme;
    });
  };
  
  // 如果提供了overrideValue，使用这个值作为上下文值（用于测试）
  // 但仍然确保所有hooks都在顶层调用
  if (overrideValue) {
    return (
      <ThemeContext.Provider value={overrideValue}>
        <GlobalStyles theme={overrideValue.theme} />
        {children}
      </ThemeContext.Provider>
    );
    }
  
  // 合并基础主题和自定义主题变量
  const theme = {
    ...(isDarkMode ? darkTheme : lightTheme),
    ...customTheme
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, updateThemeVariable }}>
      <GlobalStyles theme={theme} />
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * 使用主题上下文的自定义hook
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeContext;