import axios from 'axios';

const API_URL = '/api/theme';

// 保存主题设置
export const saveThemeSettings = async (themeSettings) => {
  try {
    const response = await axios.post(API_URL, themeSettings);
    return response.data;
  } catch (error) {
    console.error('保存主题设置失败:', error);
    throw error;
  }
};

// 加载主题设置
export const loadThemeSettings = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // 如果主题设置不存在，返回null
      return null;
    }
    console.error('加载主题设置失败:', error);
    throw error;
  }
};

// 重置主题设置为默认值
export const resetThemeSettings = async () => {
  try {
    const response = await axios.delete(API_URL);
    return response.data;
  } catch (error) {
    console.error('重置主题设置失败:', error);
    throw error;
  }
};
