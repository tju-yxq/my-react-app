import axios from 'axios';

// [修复] 在Create React App中，使用 process.env 来访问环境变量
// 并且变量名必须以 REACT_APP_ 开头
const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://rqoufedpoguc.sealosgzg.site';

const api = axios.create({
    baseURL: `${baseURL}`,
    timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // 如果是 401 错误且不是刷新 token 的请求
        if (error.response?.status === 401 && !originalRequest._retry && 
            !originalRequest.url.includes('/auth/refresh')) {
            originalRequest._retry = true;
            
            try {
                // 尝试刷新 token
                const refreshResponse = await refreshToken();
                if (refreshResponse?.token) {
                    // 更新请求头中的 token
                    originalRequest.headers.Authorization = `Bearer ${refreshResponse.token}`;
                    // 重新发送原始请求
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('刷新 token 失败:', refreshError);
                // 如果刷新 token 失败，清除认证信息
                localStorage.removeItem('token');
                // 只有在当前不是登录页面时才重定向
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        
        // 其他错误处理
        console.error("API Error Interceptor:", error);
        let errorMsg = '请求失败，发生未知错误。';
        
        if (error.response) {
            const { status, data } = error.response;
            console.error(`API Error: Status ${status}`, data);
            
            if (status === 401) {
                localStorage.removeItem('token');
                errorMsg = '身份验证失败，请重新登录';
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            } else if (data?.detail) {
                errorMsg = Array.isArray(data.detail) 
                    ? data.detail.map(err => `${err.loc ? err.loc.join('.')+': ' : ''}${err.msg}`).join('; ')
                    : data.detail;
            } else {
                errorMsg = data?.error?.message || `请求失败，状态码: ${status}`;
            }
        } else if (error.request) {
            console.error('API Error: No response received', error.request);
            errorMsg = '无法连接到服务器，请检查网络连接或后端服务是否运行。';
        } else {
            console.error('API Error: Request setup error', error.message);
            errorMsg = `请求设置错误: ${error.message}`;
        }
        
        return Promise.reject({ message: errorMsg, originalError: error });
    }
);

// 认证相关方法

// 设置认证令牌
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
// 用户登录
const login = async (username, password) => {
    const loginUrl = `${baseURL}/api/v1/auth/token`;
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
        const response = await axios.post(loginUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        
        // 确保返回的数据结构符合 AuthContext 的期望
        return {
            success: true,
            token: response.data.access_token,
            user: {
                username: username,
                role: response.data.role || 'user'
            },
            role: response.data.role || 'user'  // 添加 role 到顶层
        };
    } catch (error) {
        console.error('登录失败:', error);
        const message = error.response?.data?.detail || '登录失败，请检查用户名和密码';
        return {
            success: false,
            message: message
        };
    }
};

// 用户注册
const register = async (username, password, email) => {
  try {
    const response = await api.post('api/v1/auth/register', {
      username,
      password,
      email
    });

    // 确保返回成功状态和处理用户角色
    return {
      success: true,
      user: {
        id: response.data.id,
        username: response.data.username,
        role: response.data.role || 'user' // 确保获取角色信息，默认为user
      }
    };
  } catch (error) {
    console.error('注册失败:', error);
    return {
      success: false,
      message: error.message || '注册失败，请稍后再试'
    };
  }
};

// 获取用户信息
const getUserInfo = async () => {
  try {
    const response = await api.get('api/v1/auth/me');
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

// 刷新令牌
const refreshToken = async () => {
    try {
        const response = await api.post('/api/v1/auth/refresh');
        if (response.data && response.data.access_token) {
            return {
                success: true,
                token: response.data.access_token,
                user: response.data.user || { username: 'user' },
                role: response.data.role || 'user'
            };
        }
        throw new Error('刷新令牌失败：无效的响应');
    } catch (error) {
        console.error('刷新令牌失败:', error);
        // 清除无效的 token
        localStorage.removeItem('token');
        throw error;
    }
};

// 原有的API方法

const interpret = async (transcript, sessionId, userId) => {
    try {
        console.log(`发送interpret请求，携带sessionId: ${sessionId}`);
        const response = await api.post('/api/v1/interpret', {
            query: transcript,
            sessionId: sessionId,
            userId: userId,
        });
        console.log(`收到interpret响应:`, response.data);

        // 检查响应中是否返回了sessionId，并记录
        if (response.data && response.data.sessionId) {
            console.log(`响应中包含sessionId: ${response.data.sessionId}`);
        } else {
            console.warn(`⚠️ 警告: 响应中未找到sessionId! 响应数据:`, response.data);
        }

        return response.data; // Extract data from successful response
    } catch (error) {
         console.error('API call to interpret failed in function:', error);
         // Re-throw the processed error object from the interceptor
         throw error;
    }
};

const execute = async (toolId, params, sessionId, userId) => {
    try {
        // 参数验证
        if (!toolId) {
            throw new Error('工具ID不能为空');
        }
        if (!params || typeof params !== 'object') {
            throw new Error('参数必须是一个对象');
        }

        // 确保userId是字符串类型
        const userIdStr = userId ? String(userId) : null;

        console.log(`发送execute请求，携带sessionId: ${sessionId}`);

        // 确保后端请求参数严格符合后端ExecuteRequest模型
        const requestData = {
            tool_id: toolId,
            params: params,
            sessionId: sessionId, // 使用sessionId作为会话ID字段
        };

        // 只有在有userId值的情况下才添加此字段，并使用user_id字段名
        if (userIdStr) {
            requestData.user_id = userIdStr;
        }

        console.log("准备发送execute请求数据:", requestData);

        const response = await api.post('/api/v1/execute', requestData);

        console.log("Execute API Response:", response);

        // 检查响应中是否返回了sessionId，并记录
        if (response.data && response.data.sessionId) {
            console.log(`Execute响应中包含sessionId: ${response.data.sessionId}`);
        } else {
            console.warn(`⚠️ 警告: Execute响应中未找到sessionId! 响应数据:`, response.data);
        }

        return response.data;
    } catch (error) {
        console.error('API call to execute failed in function:', error);
        // Re-throw the processed error object from the interceptor
         throw error;
    }
};

const getTools = async () => {
    try {
        console.log("获取工具列表...");
        const response = await api.get('/api/v1/tools');
        console.log("工具列表响应:", response.data);
        return response.data.tools; // 直接返回工具数组
    } catch (error) {
        console.error('获取工具列表失败:', error);
        throw error;
    }
};

// 获取单个工具（服务）详情
const getToolById = async (toolId) => {
  try {
    console.log(`获取工具ID: ${toolId} 的详情`);
    const response = await api.get(`/api/v1/tools/${toolId}`);
    console.log("工具详情响应:", response.data);
    return response.data;
  } catch (error) {
    console.error(`获取工具ID: ${toolId} 的详情失败:`, error);
    throw error;
  }
};

// [新增] 一个支持分页的函数，以满足 ToolsList 的需求
const getItems = async (page = 1, size = 10) => {
  try {
    console.log(`获取工具列表 - 页面: ${page}, 大小: ${size}`);
    // 注意: 后端端点是 /api/v1/tools，我们假设它接受 page 和 size 参数
    const response = await api.get('/api/v1/tools', {
      params: {
        page: page,
        size: size,
      }
    });
    console.log("分页工具列表响应:", response.data);
    // 假设后端返回的数据结构是 { items: [...], pagination: {...} }
    // 如果后端直接返回数组，需要在这里进行包装
    if (Array.isArray(response.data)) {
        return {
            items: response.data,
            pagination: { has_next: false, current_page: 1, total_pages: 1, total_items: response.data.length }
        };
    }
    return response.data;
  } catch (error) {
    console.error('获取分页工具列表失败:', error);
    throw error;
  }
};
// 开发者API接口

// 获取开发者服务列表
const getDeveloperServices = async () => {
  try {
    console.log("获取开发者服务列表...");
    const response = await api.get('/api/dev/tools');
    console.log("开发者服务列表响应:", response.data);
    return response.data.services;
  } catch (error) {
    console.error('获取开发者服务列表失败:', error);
    throw error;
  }
};

// 创建新服务
const createDeveloperService = async (serviceData) => {
  try {
    console.log("创建新服务...", serviceData);
    const response = await api.post('/api/dev/tools', serviceData);
    console.log("创建服务响应:", response.data);
    return response.data;
  } catch (error) {
    console.error('创建服务失败:', error);
    throw error;
  }
};

// 获取单个开发者服务详情
const getDeveloperServiceById = async (serviceId) => {
  try {
    console.log(`获取开发者服务ID: ${serviceId} 的详情`);
    const response = await api.get(`/api/dev/tools/${serviceId}`);
    console.log("开发者服务详情响应:", response.data);
    return response.data;
  } catch (error) {
    console.error(`获取开发者服务ID: ${serviceId} 的详情失败:`, error);
    throw error;
  }
};

// 更新服务
const updateDeveloperService = async (serviceId, updateData) => {
  try {
    console.log(`更新开发者服务ID: ${serviceId}`, updateData);
    const response = await api.put(`/api/dev/tools/${serviceId}`, updateData);
    console.log("更新服务响应:", response.data);
    return response.data;
  } catch (error) {
    console.error(`更新开发者服务ID: ${serviceId} 失败:`, error);
    throw error;
  }
};

// 删除服务
const deleteDeveloperService = async (serviceId) => {
  try {
    console.log(`删除开发者服务ID: ${serviceId}`);
    const response = await api.delete(`/api/dev/tools/${serviceId}`);
    console.log("删除服务响应:", response.data);
    return response.data;
  } catch (error) {
    console.error(`删除开发者服务ID: ${serviceId} 失败:`, error);
    throw error;
  }
};

// 上传API包
const uploadApiPackage = async (formData) => {
  try {
    console.log("上传API包...");
    const response = await api.post('/api/dev/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("上传API包响应:", response.data);
    return response.data;
  } catch (error) {
    console.error('上传API包失败:', error);
    throw error;
  }
};

// 获取开发者应用列表
const getDeveloperApplications = async () => {
  try {
    console.log("获取开发者应用列表...");
    const response = await api.get('/api/dev/apps');
    console.log("开发者应用列表响应:", response.data);
    return response.data.applications;
  } catch (error) {
    console.error('获取开发者应用列表失败:', error);
    throw error;
  }
};

// 创建新应用
const createDeveloperApplication = async (applicationData) => {
  try {
    console.log("创建新应用...", applicationData);
    const response = await api.post('/api/dev/apps', applicationData);
    console.log("创建应用响应:", response.data);
    return response.data;
  } catch (error) {
    console.error('创建应用失败:', error);
    throw error;
  }
};

// 测试已保存的API服务 (原 testApiService)
const testSavedApiService = async (serviceId, testData) => {
  try {
    console.log(`测试已保存的开发者服务ID: ${serviceId}`, testData);
    const response = await api.post(`/api/dev/tools/${serviceId}/test`, testData);
    console.log("测试服务响应:", response.data);
    return response.data;
  } catch (error) {
    console.error(`测试已保存的开发者服务ID: ${serviceId} 失败:`, error);
    throw error;
  }
};

// 新增: 测试未保存的API服务配置
const testUnsavedDeveloperTool = async (toolConfiguration) => {
  // toolConfiguration should include all form fields + the testInput value
  // Example: { serviceName: 'Test', platformType: 'dify', ..., testInput: 'hello' }
  try {
    console.log("测试未保存的服务配置:", toolConfiguration);
    // This endpoint /api/dev/tools/test is NEW and needs to be implemented in the backend
    // and mocked in MSW. It receives the full tool config and test input.
    const response = await api.post('/api/dev/tools/test', toolConfiguration);
    console.log("测试未保存的服务响应:", response.data);
    return response.data; // Expected: { success: boolean, raw_response?: any, error?: string }
  } catch (error) {
    console.error('测试未保存的服务配置失败:', error);
    throw error; // Let the interceptor handle formatting the error
  }
};

// Generic methods for direct use by components if they import the default export
const apiClientInstance = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
  patch: (url, data, config) => api.patch(url, data, config), // Added patch for completeness

  // You can also choose to expose specific, named functions through this default export if preferred by components
  setAuthToken,
  login,
  register,
  getUserInfo,
  // refreshToken,
  interpret,
  execute,
  getItems, // [修复] 使用新的 getItems 函数
  getTools,
  getToolById,
  // If there are specific developer tool functions that components might use via `apiClient.someFunc()`,
  // they could be added here too. For now, DeveloperConsolePage uses the generic get, put, delete.
  // 开发者API接口
  getDeveloperServices,
  createDeveloperService,
  getDeveloperServiceById,
  updateDeveloperService,
  deleteDeveloperService,
  uploadApiPackage,
  getDeveloperApplications,
  createDeveloperApplication,
  testSavedApiService,          // Renamed original testApiService
  testUnsavedDeveloperTool,     // Added new method
};

export default apiClientInstance;