import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { saveThemeSettings, loadThemeSettings, resetThemeSettings } from '../services/themeService';
import { toast } from 'react-toastify';

// 样式编辑器容器
const EditorContainer = styled.div`
  padding: 0.5rem;
  max-width: 100%;
  overflow-x: hidden;
`;

// 变量组
const VariableGroup = styled.div`
  margin-bottom: 1.5rem;
`;

// 标题
const GroupTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--text-color);
`;

// 变量行
const VariableRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--border-radius, 4px);
  background-color: ${props => props.theme?.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
`;

// 变量名
const VariableName = styled.div`
  flex: 1;
  font-size: 0.95rem;
  color: var(--text-color);
  font-weight: 500;
`;

// 颜色输入
const ColorInput = styled.input`
  width: 200px;
  border: 1px solid var(--border-color);
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius, 4px);
  background-color: var(--surface);
  color: var(--text);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
  outline: none;
  
  &:focus {
    border-color: var(--color-primary);
  }
`;

// 按钮
const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius, 4px);
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: 0.9rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

// 重置按钮
const ResetButton = styled(Button)`
  background-color: ${props => props.theme?.isDark ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme?.isDark ? 'white' : '#1a202c'};
`;

// 按钮组
const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 1rem;
  gap: 0.5rem;
`;

// 获取CSS变量的值
const getCssVar = (varName, defaultValue = '') => {
  if (typeof window !== 'undefined') {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
  }
  return defaultValue;
};

const StyleEditor = () => {
  const { theme, updateThemeVariable } = useTheme();
  const [variables, setVariables] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 加载主题设置
  useEffect(() => {
    const loadTheme = async () => {
      try {
        setIsLoading(true);
        // 首先尝试从后端加载保存的主题设置
        const savedTheme = await loadThemeSettings();
        
        // 如果没有保存的主题设置，使用当前CSS变量值
        const defaultColors = {
          '--primary-color': getCssVar('--primary-color', '#4FD1C5'),
          '--secondary-color': getCssVar('--secondary-color', '#805AD5'),
          '--text-color': getCssVar('--text-color', theme.isDark ? '#F8F8F8' : '#1A202C'),
          '--background': getCssVar('--background', theme.isDark ? '#1E1E2F' : '#FFFFFF'),
          '--surface': getCssVar('--surface', theme.isDark ? '#27293D' : '#F7FAFC'),
          '--border-color': getCssVar('--border-color', theme.isDark ? '#2D3748' : '#E2E8F0'),
        };
        
        // 合并默认值和保存的主题设置
        const themeColors = savedTheme ? {
          ...defaultColors,
          ...Object.fromEntries(
            Object.entries(savedTheme)
              .filter(([key]) => key in defaultColors)
              .map(([key, value]) => [`--${key}`, value])
          )
        } : defaultColors;
        
        setVariables(themeColors);
        
        // 应用加载的主题设置
        Object.entries(themeColors).forEach(([key, value]) => {
          updateThemeVariable(key, value);
        });
        
      } catch (error) {
        console.error('加载主题设置失败:', error);
        toast.error('加载主题设置失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTheme();
  }, [theme.isDark]);
  
  // 处理变量值变化
  const handleVarChange = async (varName, value) => {
    const updatedVars = {
      ...variables,
      [varName]: value
    };
    
    setVariables(updatedVars);
    
    // 更新文档中的CSS变量
    updateThemeVariable(varName, value);
    
    // 保存主题设置到后端
    try {
      setIsSaving(true);
      // 转换变量名为不带--前缀的格式
      const themeSettings = Object.entries(updatedVars).reduce((acc, [key, value]) => {
        acc[key.replace('--', '')] = value;
        return acc;
      }, {});
      
      await saveThemeSettings(themeSettings);
      toast.success('主题设置已保存');
    } catch (error) {
      console.error('保存主题设置失败:', error);
      toast.error('保存主题设置失败');
    } finally {
      setIsSaving(false);
    }
  };
  
  // 导出为JSON
  const exportVarsAsJson = () => {
    try {
      // 添加主题模式信息
      const exportData = {
        ...Object.entries(variables).reduce((acc, [key, value]) => {
          acc[key.replace('--', '')] = value;
          return acc;
        }, {}),
        _metadata: {
          exportedAt: new Date().toISOString(),
          themeMode: theme.isDark ? 'dark' : 'light',
          version: '1.0'
        }
      };
      
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      toast.success('主题配置导出成功');
    } catch (error) {
      console.error('导出主题配置失败:', error);
      toast.error('导出主题配置失败');
    }
  };
  
  // 重置为默认值
  const resetToDefault = async () => {
    if (!window.confirm('确定要重置主题设置为默认值吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 重置后端主题设置
      await resetThemeSettings();
      
      // 设置默认变量
      const defaultVariables = {
        '--primary-color': theme.isDark ? '#4FD1C5' : '#38B2AC',
        '--secondary-color': theme.isDark ? '#805AD5' : '#6B46C1',
        '--text-color': theme.isDark ? '#F8F8F8' : '#1A202C',
        '--background': theme.isDark ? '#1E1E2F' : '#FFFFFF',
        '--surface': theme.isDark ? '#27293D' : '#F7FAFC',
        '--border-color': theme.isDark ? '#2D3748' : '#E2E8F0',
      };
      
      // 更新所有变量
      Object.entries(defaultVariables).forEach(([varName, value]) => {
        updateThemeVariable(varName, value);
      });
      
      // 更新状态
      setVariables(defaultVariables);
      
      toast.success('主题设置已重置为默认值');
    } catch (error) {
      console.error('重置主题设置失败:', error);
      toast.error('重置主题设置失败');
    } finally {
      setIsLoading(false);
    }
  };
  
  // CSS变量名称到中文描述的映射
  const varNameMap = {
    '--primary-color': '主色',
    '--secondary-color': '次要色',
    '--text-color': '文字颜色',
    '--background': '背景色',
    '--surface': '表面色',
    '--border-color': '边框颜色'
  };

  return (
    <EditorContainer>
      <VariableGroup>
        {Object.entries(variables).map(([varName, value]) => (
          <VariableRow key={varName}>
            <VariableName>{varNameMap[varName] || varName}</VariableName>
            <ColorInput
              type="text"
              value={value}
              onChange={(e) => handleVarChange(varName, e.target.value)}
            />
          </VariableRow>
        ))}
      </VariableGroup>
      
      <ButtonGroup>
        <ResetButton onClick={resetToDefault} theme={theme}>
          重置为默认值
        </ResetButton>
        <Button onClick={exportVarsAsJson}>
          导出主题配置
        </Button>
      </ButtonGroup>
    </EditorContainer>
  );
};

export default StyleEditor; 