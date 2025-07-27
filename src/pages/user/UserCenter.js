import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    User, Settings, Bell, Shield, Lock, LogOut, Sun, Moon,
    ChevronRight, Award, Star, BarChart2, MessageSquare, Globe, Volume2, Crown, Edit2
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';


// ===================================================================================
// 主组件 UserCenter (保留所有数据连接)
// ===================================================================================

const UserCenter = () => {
    // 从上下文中获取数据和函数（保持原样）
    const { user, logout, isAuthenticated, loading } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    // 合并真实数据和模拟数据（保持原样）
    const displayUser = {
        id: user?.id || 'N/A',
        username: user?.username || '访客',
        role: user?.role || 'user',
        avatar: `https://placehold.co/128x128/${theme?.isDark ? '4FD1C5/1A202C' : '319795/FFFFFF'}?text=${user?.username?.charAt(0).toUpperCase() || 'U'}`,
        email: user?.username ? `${user.username.toLowerCase().replace(/\s/g, '')}@echo-ai.com` : 'email@example.com',
        joinDate: '2023-10-26',
        stats: {
            commands: 128,
            skillsUsed: 42,
            loginStreak: 15,
        },
        badges: ['Pioneer', 'Power User', 'Contributor'],
    };

    // 退出登录逻辑（保持原样）
    const handleLogout = () => {
        if (window.confirm('确定要退出登录吗？')) {
            navigate('/');
            setTimeout(() => {
                logout();
            }, 100);
        }
    };

    // 认证状态检查（保持原样）
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/auth');
        }
    }, [loading, isAuthenticated, navigate]);

    // 加载状态（保持原样）
    if (loading) {
        return (
            <UserCenterContainer>
                <LoadingState>
                    <p>正在验证身份...</p>
                </LoadingState>
            </UserCenterContainer>
        );
    }

    // 未认证状态（保持原样）
    if (!isAuthenticated || !user) {
        return (
            <UserCenterContainer>
                <LoadingState>
                    <p>正在跳转到登录页面...</p>
                </LoadingState>
            </UserCenterContainer>
        );
    }

    // 设置项分组
    const settingGroups = [
        {
            title: "账户管理",
            items: [
                { icon: User, title: "个人资料", description: "修改姓名、头像等个人信息", path: "/settings/profile" },
                { icon: Shield, title: "账户安全", description: "修改密码、绑定手机", path: "/settings/security" },
            ]
        },
        {
            title: "系统偏好",
            items: [
                { icon: Bell, title: "消息通知", description: "设置消息提醒方式", path: "/settings/notifications" },
                { icon: Volume2, title: "语音设置", description: "调整语音识别和合成参数", path: "/settings/voice" },
                { icon: Globe, title: "语言设置", description: "切换应用界面语言", path: "/settings/language" },
            ]
        },
        {
            title: "数据与隐私",
            items: [
                { icon: BarChart2, title: "数据统计", description: "查看您的使用数据统计", path: "/settings/stats" },
                { icon: Lock, title: "隐私设置", description: "管理数据共享和权限", path: "/settings/privacy" },
            ]
        }
    ];
    
    return (
        <UserCenterContainer>
            <PageStyles />
            <Container>
                {/* 顶部用户信息栏 - 小屏幕显示 */}
                <MobileUserHeader>
                    <div className="avatar-wrapper">
                        <img src={displayUser.avatar} alt={displayUser.username} className="avatar" />
                        <div className="online-indicator"></div>
                    </div>
                    <div className="user-info">
                        <h1 className="username">{displayUser.username}</h1>
                        <p className="role"><Crown size={14} /> {displayUser.role}</p>
                    </div>
                    <button className="edit-btn">
                        <Edit2 size={18} />
                    </button>
                </MobileUserHeader>

                <MainLayout>
                    {/* 侧边栏 - 大屏幕显示 */}
                    <UserSidebar>
                        <ProfileCard>
                            <div className="avatar-wrapper">
                                <img src={displayUser.avatar} alt={displayUser.username} className="avatar" />
                                <div className="online-indicator"></div>
                            </div>
                            <h1 className="username">{displayUser.username}</h1>
                            <p className="email">{displayUser.email}</p>
                            <div className="role-badge">
                                <Crown size={14} />
                                <span>{displayUser.role}</span>
                            </div>
                            <button className="edit-profile-btn">编辑个人资料</button>
                        </ProfileCard>

                        <StatsCard>
                            <h3 className="card-title">账户统计</h3>
                            <div className="stats-grid">
                                <StatItem>
                                    <BarChart2 size={20} className="stat-icon" />
                                    <span className="stat-value">{displayUser.stats.commands}</span>
                                    <span className="stat-label">总指令</span>
                                </StatItem>
                                <StatItem>
                                    <Star size={20} className="stat-icon" />
                                    <span className="stat-value">{displayUser.stats.skillsUsed}</span>
                                    <span className="stat-label">使用技能</span>
                                </StatItem>
                                <StatItem>
                                    <LogOut size={20} className="stat-icon" />
                                    <span className="stat-value">{displayUser.stats.loginStreak}</span>
                                    <span className="stat-label">连续登录</span>
                                </StatItem>
                            </div>
                        </StatsCard>

                        <BadgesCard>
                            <h3 className="card-title">我的徽章</h3>
                            <div className="badges-container">
                                {displayUser.badges.map(badge => (
                                    <Badge key={badge}>
                                        <Award size={16} className="badge-icon" />
                                        <span>{badge}</span>
                                    </Badge>
                                ))}
                            </div>
                        </BadgesCard>

                        <JoinDateCard>
                            <h3 className="card-title">账户信息</h3>
                            <div className="info-item">
                                <span className="label">注册日期</span>
                                <span className="value">{displayUser.joinDate}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">账户ID</span>
                                <span className="value">{displayUser.id}</span>
                            </div>
                        </JoinDateCard>
                    </UserSidebar>

                    {/* 主内容区 */}
                    <SettingsContent>
                        <PageHeader>
                            <h1 className="page-title">账户设置</h1>
                            <p className="page-description">管理您的账户偏好和设置</p>
                        </PageHeader>

                        {/* 主题切换卡片 */}
                        <ThemeToggleCard>
                            <div className="card-content">
                                <div className="icon-wrapper">
                                    <Settings size={24} />
                                </div>
                                <div className="text-content">
                                    <h3 className="card-title">主题模式</h3>
                                    <p className="card-description">切换浅色或深色界面</p>
                                </div>
                            </div>
                            <div className="toggle-container">
                                <Sun size={18} className={!theme?.isDark ? 'active' : ''} />
                                <ToggleSwitch onClick={toggleTheme}>
                                    <div className="toggle-handle"></div>
                                </ToggleSwitch>
                                <Moon size={18} className={theme?.isDark ? 'active' : ''} />
                            </div>
                        </ThemeToggleCard>

                        {/* 设置项分组展示 */}
                        {settingGroups.map((group, index) => (
                            <SettingsGroup key={index}>
                                <h2 className="group-title">{group.title}</h2>
                                <div className="settings-grid">
                                    {group.items.map((item) => (
                                        <SettingCard 
                                            key={item.title}
                                            onClick={() => navigate(item.path)}
                                        >
                                            <div className="card-content">
                                                <div className="icon-wrapper">
                                                    <item.icon size={24} />
                                                </div>
                                                <div className="text-content">
                                                    <h3 className="card-title">{item.title}</h3>
                                                    <p className="card-description">{item.description}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="arrow-icon" />
                                        </SettingCard>
                                    ))}
                                </div>
                            </SettingsGroup>
                        ))}

                        {/* 危险区域 */}
                        <DangerZone>
                            <h2 className="zone-title">危险操作</h2>
                            <DangerCard>
                                <div className="danger-content">
                                    <h3 className="danger-title">退出登录</h3>
                                    <p className="danger-description">点击后将退出当前账户并返回登录页面</p>
                                </div>
                                <button className="logout-btn" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>退出登录</span>
                                </button>
                            </DangerCard>
                        </DangerZone>
                    </SettingsContent>
                </MainLayout>
            </Container>
        </UserCenterContainer>
    );
};

// ===================================================================================
// 样式组件
// ===================================================================================

const UserCenterContainer = styled.div`
    min-height: 100vh;
    background-color: var(--c-bg);
    color: var(--c-text-primary);
    font-family: 'Inter', system-ui, sans-serif;
    transition: background-color 0.3s ease;
    padding: 1rem 0;
`;

const Container = styled.div`
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
`;

const MainLayout = styled.div`
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    margin-top: 1rem;

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
    }
`;

// 移动端用户头部
const MobileUserHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--c-surface);
    border-radius: 16px;
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--c-border);

    .avatar-wrapper {
        position: relative;
        width: 56px;
        height: 56px;
    }

    .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--c-primary);
    }

    .online-indicator {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 16px;
        height: 16px;
        background-color: #48BB78;
        border-radius: 50%;
        border: 2px solid var(--c-surface);
    }

    .user-info {
        margin-left: 1rem;
        flex: 1;
    }

    .username {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 0.25rem 0;
    }

    .role {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.85rem;
        color: var(--c-text-secondary);
        margin: 0;
    }

    .edit-btn {
        background-color: var(--c-bg);
        border: none;
        border-radius: 8px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--c-primary);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background-color: var(--c-primary);
            color: var(--c-text-on-primary);
        }
    }

    @media (min-width: 993px) {
        display: none;
    }
`;

// 侧边栏
const UserSidebar = styled.aside`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    @media (max-width: 992px) {
        display: none;
    }
`;

const ProfileCard = styled.div`
    background-color: var(--c-surface);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    border: 1px solid var(--c-border);
    box-shadow: var(--shadow-sm);

    .avatar-wrapper {
        position: relative;
        width: 120px;
        height: 120px;
        margin: 0 auto 1.25rem;
    }

    .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid var(--c-primary);
    }

    .online-indicator {
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        background-color: #48BB78;
        border-radius: 50%;
        border: 2px solid var(--c-surface);
    }

    .username {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        color: var(--c-text-primary);
    }

    .email {
        font-size: 0.9rem;
        color: var(--c-text-secondary);
        margin: 0 0 1rem 0;
    }

    .role-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background-color: var(--c-primary);
        color: var(--c-text-on-primary);
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
        margin-bottom: 1.5rem;
    }

    .edit-profile-btn {
        width: 100%;
        padding: 0.8rem;
        border-radius: 10px;
        background-color: var(--c-primary);
        color: var(--c-text-on-primary);
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background-color: var(--c-primary-hover);
            transform: translateY(-2px);
        }
    }
`;

const StatsCard = styled.div`
    background-color: var(--c-surface);
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid var(--c-border);
    box-shadow: var(--shadow-sm);

    .card-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 1.25rem 0;
        color: var(--c-text-primary);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
    }
`;

const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .stat-icon {
        color: var(--c-primary);
        margin-bottom: 0.5rem;
    }

    .stat-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--c-text-primary);
        margin-bottom: 0.25rem;
    }

    .stat-label {
        font-size: 0.8rem;
        color: var(--c-text-secondary);
    }
`;

const BadgesCard = styled.div`
    background-color: var(--c-surface);
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid var(--c-border);
    box-shadow: var(--shadow-sm);

    .card-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 1.25rem 0;
        color: var(--c-text-primary);
    }

    .badges-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
    }
`;

const Badge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background-color: var(--c-bg);
    padding: 0.4rem 0.9rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--c-text-secondary);

    .badge-icon {
        color: var(--c-primary);
    }
`;

const JoinDateCard = styled.div`
    background-color: var(--c-surface);
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid var(--c-border);
    box-shadow: var(--shadow-sm);

    .card-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 1.25rem 0;
        color: var(--c-text-primary);
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--c-border);

        &:last-child {
            border-bottom: none;
        }

        .label {
            color: var(--c-text-secondary);
            font-size: 0.9rem;
        }

        .value {
            font-weight: 500;
            font-size: 0.9rem;
        }
    }
`;

// 主内容区
const SettingsContent = styled.main`
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

const PageHeader = styled.div`
    margin-bottom: 0.5rem;

    .page-title {
        font-size: 1.8rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        color: var(--c-text-primary);
    }

    .page-description {
        font-size: 1rem;
        color: var(--c-text-secondary);
        margin: 0;
    }

    @media (max-width: 768px) {
        .page-title {
            font-size: 1.5rem;
        }
    }
`;

const ThemeToggleCard = styled.div`
    background-color: var(--c-surface);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--c-border);
    box-shadow: var(--shadow-sm);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: var(--shadow-md);
    }

    .card-content {
        display: flex;
        align-items: center;
        gap: 1.25rem;
    }

    .icon-wrapper {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        background-color: var(--c-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--c-primary);
        flex-shrink: 0;
    }

    .text-content {
        min-width: 0;
    }

    .card-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 0.25rem 0;
        color: var(--c-text-primary);
    }

    .card-description {
        font-size: 0.9rem;
        color: var(--c-text-secondary);
        margin: 0;
    }

    .toggle-container {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: var(--c-text-tertiary);
    }

    .active {
        color: var(--c-primary);
    }
`;

const ToggleSwitch = styled.div`
    width: 50px;
    height: 26px;
    background-color: var(--c-bg);
    border-radius: 20px;
    position: relative;
    cursor: pointer;
    padding: 3px;

    .toggle-handle {
        width: 20px;
        height: 20px;
        background-color: var(--c-surface);
        border-radius: 50%;
        position: absolute;
        left: 3px;
        top: 3px;
        transition: transform 0.3s ease;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    [data-theme="dark"] & .toggle-handle {
        transform: translateX(24px);
    }
`;

const SettingsGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .group-title {
        font-size: 1.3rem;
        font-weight: 600;
        margin: 0;
        color: var(--c-text-primary);
        position: relative;
        padding-bottom: 0.75rem;

        &::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            width: 50px;
            height: 3px;
            background-color: var(--c-primary);
            border-radius: 3px;
        }
    }

    .settings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.25rem;
    }
`;

const SettingCard = styled.div`
    background-color: var(--c-surface);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    border: 1px solid var(--c-border);
    box-shadow: var(--shadow-sm);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-3px);
    }

    .card-content {
        display: flex;
        align-items: center;
        gap: 1.25rem;
    }

    .icon-wrapper {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        background-color: var(--c-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--c-primary);
        flex-shrink: 0;
    }

    .text-content {
        min-width: 0;
    }

    .card-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 0.25rem 0;
        color: var(--c-text-primary);
    }

    .card-description {
        font-size: 0.9rem;
        color: var(--c-text-secondary);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .arrow-icon {
        color: var(--c-text-tertiary);
        transition: transform 0.2s ease;
    }

    &:hover .arrow-icon {
        transform: translateX(5px);
    }
`;

const DangerZone = styled.div`
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .zone-title {
        font-size: 1.3rem;
        font-weight: 600;
        margin: 0;
        color: var(--c-danger);
    }
`;

const DangerCard = styled.div`
    background-color: var(--c-surface);
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid var(--c-danger);
    box-shadow: var(--shadow-sm);
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
    }

    .danger-content {
        flex: 1;
    }

    .danger-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 0.25rem 0;
        color: var(--c-text-primary);
    }

    .danger-description {
        font-size: 0.9rem;
        color: var(--c-text-secondary);
        margin: 0;
        max-width: 600px;
    }

    .logout-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem 1.5rem;
        border-radius: 10px;
        background-color: var(--c-danger);
        color: var(--c-text-on-primary);
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background-color: var(--c-danger-hover);
            transform: translateY(-2px);
        }
    }
`;

// 样式组件
const PageStyles = () => (
    <style>{`
        /* 主题变量 - 保持原有主题切换功能 */
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

        /* 加载状态 */
        .loading-state {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            color: var(--c-text-secondary);
            font-size: 1.1rem;
        }
    `}</style>
);

// 加载状态组件
const LoadingState = ({ children }) => (
    <div className="loading-state">
        {children}
    </div>
);

export default UserCenter;