import React, { useState, useContext, createContext, useEffect, useLayoutEffect } from 'react';
import { 
    User, Settings, Bell, Shield, Lock, LogOut, Sun, Moon,
    ChevronRight, Award, Star, BarChart2, MessageSquare, Globe, Volume2, Crown
} from 'lucide-react';

// ===================================================================================
// 1. 上下文定义 (Context Definitions)
// 注意：以下是您提供的 AuthContext 和 ThemeContext 的核心逻辑。
// 在您的实际项目中，您应该从各自的文件中导入它们，而不是在这里重新定义。
// 我将它们包含在这里是为了让这个组件可以独立运行以供预览。
// ===================================================================================

// --- 从您的 AuthContext.js ---
const AuthContext = createContext(null);

// --- 从您的 ThemeContext.js ---
const ThemeContext = createContext(null);


// ===================================================================================
// 2. 主组件 UserCenter (已集成真实数据)
// ===================================================================================

const UserCenter = () => {
    // 从真实的上下文中获取数据和函数
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    // const navigate = useNavigate(); // 在您的项目中请取消此行注释

    // 创建一个用于展示的用户对象，合并真实数据和模拟数据
    // 这样既能使用 API 返回的真实信息，又能保持 UI 的完整性
    const displayUser = {
        // --- 真实数据 ---
        id: user?.id || 'N/A',
        username: user?.username || '访客',
        role: user?.role || 'user',

        // --- 基于真实数据生成的占位数据 ---
        avatar: `https://placehold.co/128x128/${theme?.isDark ? '4FD1C5/1A202C' : '319795/FFFFFF'}?text=${user?.username?.charAt(0).toUpperCase() || 'U'}`,
        email: user?.username ? `${user.username.toLowerCase().replace(/\s/g, '')}@echo-ai.com` : 'email@example.com',

        // --- 纯模拟占位数据 (未来可以替换为真实数据) ---
        joinDate: '2023-10-26',
        stats: {
            commands: 128,
            skillsUsed: 42,
            loginStreak: 15,
        },
        badges: ['Pioneer', 'Power User', 'Contributor'],
    };

    const handleLogout = () => {
        // 在您的项目中，这里会使用 antd-mobile 的 Dialog
        if (window.confirm('确定要退出登录吗？')) {
            logout();
            // navigate('/');
        }
    };

    // 如果用户不存在或正在加载，可以显示一个加载状态
    if (!user) {
        return (
            <div className="user-center-page">
                <div className="container">
                    <p>正在加载用户信息...</p>
                </div>
            </div>
        );
    }

    // 定义设置项
    const mainSettings = [
        { icon: Volume2, title: "语音设置", description: "调整语音识别和合成参数", path: "/settings/voice" },
        { icon: Shield, title: "账户安全", description: "修改密码、绑定手机", path: "/settings/security" },
        { icon: Bell, title: "消息通知", description: "设置消息提醒方式", path: "/settings/notifications" },
        { icon: Globe, title: "语言设置", description: "切换应用界面语言", path: "/settings/language" },
    ];
    
    return (
        <div className="user-center-page">
            <div className="container">
                <div className="main-layout">
                    
                    <aside className="user-profile-sidebar">
                        <div className="profile-card card">
                            <div className="avatar-wrapper">
                                <img src={displayUser.avatar} alt={displayUser.username} className="avatar-image" />
                                <div className="online-indicator"></div>
                            </div>
                            <h1 className="username">{displayUser.username}</h1>
                            <p className="email">{displayUser.email}</p>
                            <div className="role-badge">
                                <Crown size={14} />
                                <span>{displayUser.role}</span>
                            </div>
                            <button className="edit-profile-btn">编辑个人资料</button>
                        </div>

                        <div className="stats-card card">
                            <h3 className="card-header">用户统计 (模拟)</h3>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <BarChart2 size={20} className="stat-icon" />
                                    <span className="stat-value">{displayUser.stats.commands}</span>
                                    <span className="stat-label">总指令</span>
                                </div>
                                <div className="stat-item">
                                    <Star size={20} className="stat-icon" />
                                    <span className="stat-value">{displayUser.stats.skillsUsed}</span>
                                    <span className="stat-label">使用技能</span>
                                </div>
                                <div className="stat-item">
                                    <LogOut size={20} className="stat-icon" />
                                    <span className="stat-value">{displayUser.stats.loginStreak}</span>
                                    <span className="stat-label">连续登录</span>
                                </div>
                            </div>
                        </div>

                        <div className="badges-card card">
                            <h3 className="card-header">我的徽章 (模拟)</h3>
                            <div className="badges-container">
                                {displayUser.badges.map(badge => (
                                    <div key={badge} className="badge">
                                        <Award size={16} className="badge-icon" />
                                        <span>{badge}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <main className="settings-main-content">
                        <h2 className="main-content-title">账户设置</h2>
                        <div className="settings-grid">
                            <div className="card settings-card theme-toggle-card">
                                <div className="card-content">
                                    <div className="card-icon-wrapper">
                                        <Settings />
                                    </div>
                                    <div className="text-content">
                                        <h3 className="card-title">主题模式</h3>
                                        <p className="card-description">切换浅色或深色界面</p>
                                    </div>
                                </div>
                                <div className="theme-toggle-control">
                                    <Sun size={18} className={!theme?.isDark ? 'active' : ''} />
                                    <div className="toggle-switch" onClick={toggleTheme}>
                                        <div className="toggle-handle"></div>
                                    </div>
                                    <Moon size={18} className={theme?.isDark ? 'active' : ''} />
                                </div>
                            </div>

                            {mainSettings.map(item => (
                                <div key={item.title} className="card settings-card" onClick={() => console.log(`Navigating to ${item.path}`)}>
                                    <div className="card-content">
                                        <div className="card-icon-wrapper">
                                            <item.icon />
                                        </div>
                                        <div className="text-content">
                                            <h3 className="card-title">{item.title}</h3>
                                            <p className="card-description">{item.description}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="arrow-icon" />
                                </div>
                            ))}
                        </div>

                        <div className="danger-zone">
                            <h3 className="danger-zone-title">危险区域</h3>
                            <div className="danger-zone-card card">
                                <div className="danger-content">
                                    <h4 className="danger-title">退出登录</h4>
                                    <p className="danger-description">点击后将退出当前账户并返回登录页面。</p>
                                </div>
                                <button className="logout-button" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>立即退出</span>
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};


// ===================================================================================
// 3. 页面样式 (CSS-in-JS) - 无需修改，保持原样
// ===================================================================================

const PageStyles = () => (
    <style>{`
        /* ------------------------- */
        /* 1. 主题和全局变量         */
        /* ------------------------- */
        :root {
            --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
            --ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);

            /* 浅色主题 */
            --c-primary: #319795;
            --c-primary-hover: #2C7A7B;
            --c-danger: #E53E3E;
            --c-danger-hover: #C53030;
            --c-bg: #F0F2F5;
            --c-surface: #FFFFFF;
            --c-border: #E2E8F0;
            --c-text-primary: #1A202C;
            --c-text-secondary: #4A5568;
            --c-text-tertiary: #718096;
            --c-text-on-primary: #FFFFFF;
            --c-icon: #718096;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        [data-theme="dark"] {
            /* 深色主题 */
            --c-primary: #4FD1C5;
            --c-primary-hover: #81E6D9;
            --c-danger: #FC8181;
            --c-danger-hover: #F68787;
            --c-bg: #1A202C;
            --c-surface: #2D3748;
            --c-border: rgba(255, 255, 255, 0.1);
            --c-text-primary: #F7FAFC;
            --c-text-secondary: #A0AEC0;
            --c-text-tertiary: #718096;
            --c-text-on-primary: #1A202C;
            --c-icon: #A0AEC0;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
        }

        /* ------------------------- */
        /* 2. 基础布局和容器         */
        /* ------------------------- */
        .user-center-page {
            background-color: var(--c-bg);
            min-height: 100vh;
            padding: 2rem 0;
            transition: background-color 0.3s var(--ease-in-out-cubic);
            font-family: 'Inter', sans-serif;
        }

        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }

        .main-layout {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 2rem;
        }

        /* ------------------------- */
        /* 3. 通用卡片样式           */
        /* ------------------------- */
        .card {
            background-color: var(--c-surface);
            border-radius: 12px;
            border: 1px solid var(--c-border);
            box-shadow: var(--shadow-sm);
            transition: all 0.3s var(--ease-in-out-cubic);
            padding: 1.5rem;
        }
        .card:hover {
            box-shadow: var(--shadow-lg);
            transform: translateY(-4px);
        }
        .card-header {
            font-size: 1rem;
            font-weight: 600;
            color: var(--c-text-primary);
            margin: 0 0 1rem 0;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--c-border);
        }

        /* ------------------------- */
        /* 4. 左侧栏 - 用户信息      */
        /* ------------------------- */
        .user-profile-sidebar {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .profile-card {
            text-align: center;
        }

        .avatar-wrapper {
            position: relative;
            width: 100px;
            height: 100px;
            margin: 0 auto 1rem;
        }
        .avatar-image {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 4px solid var(--c-primary);
            box-shadow: var(--shadow-md);
            object-fit: cover;
        }
        .online-indicator {
            position: absolute;
            bottom: 4px;
            right: 4px;
            width: 16px;
            height: 16px;
            background-color: #48BB78;
            border-radius: 50%;
            border: 2px solid var(--c-surface);
        }

        .username {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--c-text-primary);
            margin: 0;
        }
        .email {
            font-size: 0.9rem;
            color: var(--c-text-secondary);
            margin-top: 0.25rem;
            margin-bottom: 1rem;
        }
        .role-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background-color: var(--c-primary);
            color: var(--c-text-on-primary);
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.8rem;
            font-weight: 500;
            margin-bottom: 1.5rem;
        }

        .edit-profile-btn {
            width: 100%;
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
            font-weight: 600;
            border-radius: 8px;
            background-color: var(--c-primary);
            color: var(--c-text-on-primary);
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .edit-profile-btn:hover {
            opacity: 0.85;
            transform: translateY(-2px);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            text-align: center;
        }
        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .stat-icon {
            color: var(--c-primary);
            margin-bottom: 0.5rem;
        }
        .stat-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--c-text-primary);
        }
        .stat-label {
            font-size: 0.75rem;
            color: var(--c-text-secondary);
        }

        .badges-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            background-color: var(--c-bg);
            color: var(--c-text-secondary);
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.8rem;
            font-weight: 500;
        }
        .badge-icon {
            color: var(--c-primary);
        }

        /* ------------------------- */
        /* 5. 右侧主内容区 - 设置     */
        /* ------------------------- */
        .settings-main-content {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        .main-content-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--c-text-primary);
            margin: 0;
        }
        
        .settings-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
        }

        .settings-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
        }
        .card-content {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .card-icon-wrapper {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background-color: var(--c-bg);
            color: var(--c-primary);
            flex-shrink: 0;
        }
        .card-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--c-text-primary);
            margin: 0;
        }
        .card-description {
            font-size: 0.85rem;
            color: var(--c-text-secondary);
            margin: 0.25rem 0 0 0;
        }
        .arrow-icon {
            color: var(--c-text-tertiary);
            transition: transform 0.2s ease;
        }
        .settings-card:hover .arrow-icon {
            transform: translateX(4px);
        }

        /* 主题切换卡片 */
        .theme-toggle-card {
            grid-column: 1 / -1;
        }
        .theme-toggle-control {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: var(--c-text-tertiary);
        }
        .theme-toggle-control .active {
            color: var(--c-primary);
        }
        .toggle-switch {
            width: 44px;
            height: 24px;
            background-color: var(--c-bg);
            border-radius: 12px;
            padding: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
        }
        .toggle-handle {
            width: 16px;
            height: 16px;
            background-color: var(--c-surface);
            border-radius: 50%;
            box-shadow: var(--shadow-sm);
            transition: transform 0.3s var(--ease-in-out-cubic);
        }
        [data-theme="dark"] .toggle-switch .toggle-handle {
            transform: translateX(20px);
        }

        /* 危险区域 */
        .danger-zone {
            margin-top: 1rem;
        }
        .danger-zone-title {
            font-size: 1.25rem;
            color: var(--c-danger);
            font-weight: 600;
            margin-bottom: 1rem;
        }
        .danger-zone-card {
            border-color: var(--c-danger);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .danger-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--c-text-primary);
            margin: 0 0 0.25rem 0;
        }
        .danger-description {
            font-size: 0.85rem;
            color: var(--c-text-secondary);
            margin: 0;
        }
        .logout-button {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
            font-weight: 600;
            border-radius: 8px;
            background-color: var(--c-danger);
            color: var(--c-text-on-primary);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s ease;
        }
        .logout-button:hover {
            background-color: var(--c-danger-hover);
        }

        /* ------------------------- */
        /* 6. 响应式设计             */
        /* ------------------------- */
        @media (max-width: 992px) {
            .main-layout {
                grid-template-columns: 1fr;
            }
        }
        @media (max-width: 768px) {
            .settings-grid {
                grid-template-columns: 1fr;
            }
            .user-center-page {
                padding: 1rem 0;
            }
            .danger-zone-card {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
        }
    `}</style>
);


// ===================================================================================
// 4. 主应用入口 (用于演示)
// ===================================================================================

// 在您的真实项目中，您会从您的文件中导入这些 Provider
// 这里我们只是为了演示而模拟它们
const MockAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        // 模拟从 api/v1/auth/me 获取数据
        const fetchUser = () => {
            const mockApiResponse = {
                id: 'user-12345',
                username: 'EchoExplorer',
                role: 'Administrator'
            };
            setUser(mockApiResponse);
        };
        fetchUser();
    }, []);

    const logout = () => setUser(null);

    return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
};

const MockThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState({ isDark: true });
    const toggleTheme = () => {
        setTheme(prev => ({ isDark: !prev.isDark }));
    };
    
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme.isDark ? 'dark' : 'light');
    }, [theme]);

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};


export default function App() {
    return (
        // 在您的真实应用中，您会在这里使用您自己的 AuthProvider 和 ThemeProvider
        <MockAuthProvider>
            <MockThemeProvider>
                <PageStyles />
                <UserCenter />
            </MockThemeProvider>
        </MockAuthProvider>
    );
}
