import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import StyleEditor from '../../components/StyleEditor';

// 设置页面容器
const SettingsContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

// 标题样式
// (保留但隐藏，可用于SEO)
const Title = styled.h1`
  position: absolute;
  left: -9999px;
  top: -9999px;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
`;

// 设置卡片容器
const SettingsCardContainer = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(720px, 1fr));
  justify-content: center;
  grid-auto-rows: auto;
  align-items: start; /* 确保卡片从顶部对齐 */
  margin-bottom: 2rem;

  /* 桌面端 >1024px 显示 2~3 列 */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(720px, 1fr));
    gap: 2rem;
  }

  @media (min-width: 1440px) {
    grid-template-columns: repeat(auto-fill, minmax(720px, 1fr));
  }
`;

// 设置卡片
const SettingsCard = styled.div`
  background-color: var(--card-bg);
  width: 100%;
  max-width: 100%;
  min-width: 0; /* 允许卡片在flex/grid布局中缩小 */
  border: 1px solid var(--border-color);
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  padding: 1.5rem;
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--card-shadow, 0 2px 5px rgba(0, 0, 0, 0.1));
  height: auto; /* 确保高度自适应 */
  display: flex;
  flex-direction: column;
  
  h2 {
    font-size: 1.375rem;
    text-align: left;
    margin-bottom: 1rem;
    font-weight: 500;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    text-align: left;
    margin-bottom: 1rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
  
  hr {
    margin: 1rem 0;
    border: none;
    border-top: 1px solid var(--border-color);
  }
  
  /* 表单字段统一样式 */
  input,
  select {
    background-color: var(--surface);
    color: var(--text);
    border: 1px solid var(--border-color, rgba(255,255,255,0.1));
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    transition: border-color 0.2s ease;
    outline: none;
  }

  input:focus,
  select:focus {
    border-color: var(--color-primary);
  }
  
  label {
    text-align: center;
    justify-self: center;
    display: block;
    color: var(--text-color);
    font-weight: 500;
  }
  
  .description {
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }
`;

// 使用styled-components分组样式
const SettingsGroup = styled.div`
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
  
  &:last-child {
    border-bottom: none;
  }
  
  h3 {
    font-size: 1.0625rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    text-align: center;
    margin-bottom: 0.75rem;
    color: var(--primary-color);
    font-weight: 500;
    position: relative;
    
    &::before {
      display: none;
    }
  
    text-transform: uppercase;
    letter-spacing: 0.02em;
    position: relative;
    padding-left: 0.75rem;
    font-size: 1.0625rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    position: relative;
    padding-left: 0;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.25rem;
      width: 4px;
      height: calc(100% - 0.5rem);
      display: none;
      border-radius: 2px;
    }
    margin-bottom: 0.75rem;
    color: var(--text-color);
    font-weight: 500;
  }
`;

// 带边框的设置组（用于美化特定部分）
const BorderedSettingsGroup = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius, 8px);
  background-color: var(--surface);
`;

// 美化后的标题组件
const SectionTitle = styled.h3`
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
  margin: -0.5rem -0.5rem 1.5rem -0.5rem;
  padding: 0.75rem 1rem;
  color: var(--primary-color);
  background: linear-gradient(90deg, transparent, var(--primary-color-10), transparent);
  border-radius: var(--border-radius, 8px) var(--border-radius, 8px) 0 0;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    background: var(--primary-color);
    border-radius: 2px 0 0 2px;
  }
  
  span {
    position: relative;
    z-index: 1;
  }
`;

// 选项卡容器
const TabsContainer = styled.div`
  display: none;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
`;

// 选项卡
const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--primary-color);
  }
`;

// 设置行
const SettingRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 200px;
  
  /* 让右侧控件填满 200px 列 */
  > input,
  > select {
    width: 100%;
  }
  
  input,
  select {
    width: 100%;
  }
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);

  
  &:last-child {
    border-bottom: none;
  }
  
  label {
    text-align: center;
    text-align: center;
    text-align: center;
    text-align: left;
    display: block;
    color: var(--text-color);
    font-weight: 500;
  }
  
  .description {
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }
`;

// 设置页面主要内容
const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  // 根据URL确定初始选项卡
  const getInitialTab = () => {
    const path = location.pathname.replace('/settings', '').replace(/^\//, '');
    if (['theme', 'appearance'].includes(path)) return 'appearance';
    if (path === 'advanced') return 'advanced';
    if (path === 'account') return 'account';
    return 'appearance';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);

  // 当路由变化时同步选项卡
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  return (
    <SettingsContainer>
      <Title>
        <span aria-hidden="true">⚙️</span>
        设置
      </Title>
      
      {/* 选项卡导航 */}
      <TabsContainer role="tablist" aria-label="设置类别">
        <Tab 
          role="tab"
          id="tab-appearance"
          aria-controls="tabpanel-appearance"
          aria-selected={activeTab === 'appearance'} 
          onClick={() => { setActiveTab('appearance'); navigate('/settings/theme'); }}
        >
          外观和主题
        </Tab>
        <Tab 
          role="tab"
          id="tab-advanced"
          aria-controls="tabpanel-advanced"
          aria-selected={activeTab === 'advanced'} 
          onClick={() => { setActiveTab('advanced'); navigate('/settings/advanced'); }}
        >
          高级设置
        </Tab>
        <Tab 
          role="tab"
          id="tab-account"
          aria-controls="tabpanel-account"
          aria-selected={activeTab === 'account'} 
          onClick={() => { setActiveTab('account'); navigate('/settings/account'); }}
        >
          账户设置
        </Tab>
      </TabsContainer>

      {/* 外观设置选项卡面板 */}
      {activeTab === 'appearance' && (
        <div role="tabpanel" id="tabpanel-appearance" aria-labelledby="tab-appearance">
          <SettingsCardContainer>
            {/* 主题模式设置卡片 */}
            <SettingsCard>
              <h2>
                <span aria-hidden="true">🎨</span>
                主题模式
              </h2>
              <p>切换应用的亮色或暗色主题模式。</p>
              
              <SettingsGroup>
                <SettingRow>
                  <div>
                    <label htmlFor="theme-toggle-button-instance">当前主题</label>
                    <div className="description">
                      {theme.isDark ? '暗色主题' : '亮色主题'}
                    </div>
                  </div>
                  <ThemeToggle id="theme-toggle-button-instance" />
                </SettingRow>
              </SettingsGroup>
            </SettingsCard>
            
            {/* 字体设置卡片 */}
            <SettingsCard>
              <h2>
                <span aria-hidden="true">📝</span>
                字体设置
              </h2>
              <p>自定义应用中使用的字体和字体大小。</p>
              
              <SettingsGroup>
                <SettingRow>
                  <div>
                    <label htmlFor="font-family-select">应用字体</label>
                    <div className="description">
                      修改整个应用的默认字体
                    </div>
                  </div>
                  <select id="font-family-select" defaultValue="system">
                    <option value="system">系统默认</option>
                    <option value="sans-serif">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">等宽字体</option>
                  </select>
                </SettingRow>
                
                <SettingRow>
                  <div>
                    <label htmlFor="font-size-select">字体大小</label>
                    <div className="description">
                      调整应用的整体字体大小
                    </div>
                  </div>
                  <select id="font-size-select" defaultValue="medium">
                    <option value="small">小</option>
                    <option value="medium">中</option>
                    <option value="large">大</option>
                  </select>
                </SettingRow>
              </SettingsGroup>
            </SettingsCard>
          </SettingsCardContainer>
          
          {/* 主题样式自定义 */}
          <SettingsCard>
            <h2>
              <span aria-hidden="true">🎭</span>
              主题样式自定义
            </h2>
            <p>自定义应用的颜色、样式和外观。</p>
            <hr />
            <StyleEditor />
          </SettingsCard>
        </div>
      )}
      
      {/* 高级设置选项卡面板 */}
      {activeTab === 'advanced' && (
        <div role="tabpanel" id="tabpanel-advanced" aria-labelledby="tab-advanced">
          <SettingsCardContainer>
            <SettingsCard>
              <h2>
                <span aria-hidden="true">⚙️</span>
                高级功能
              </h2>
              <p>配置应用的高级功能和行为。</p>
              
              <SettingsGroup>
                <SectionTitle>性能选项</SectionTitle>
                <SettingRow>
                  <div>
                    <label htmlFor="developer-mode-checkbox">开发者模式</label>
                    <div className="description">
                      启用额外的调试功能和控制台输出
                    </div>
                  </div>
                  <input type="checkbox" id="developer-mode-checkbox" />
                </SettingRow>
                
                <SettingRow>
                  <div>
                    <label htmlFor="performance-mode-checkbox">性能模式</label>
                    <div className="description">
                      优化应用性能，但可能会减少某些视觉效果
                    </div>
                  </div>
                  <input type="checkbox" id="performance-mode-checkbox" />
                </SettingRow>
              </SettingsGroup>
              
              <SettingsGroup>
              <SectionTitle>数据管理</SectionTitle>
                <SettingRow>
                  <div>
                    <label>缓存数据</label>
                    <div className="description">
                      清除应用缓存的数据和设置
                    </div>
                  </div>
                  <button>清除缓存</button>
                </SettingRow>
              </SettingsGroup>
            </SettingsCard>
            
            <SettingsCard>
              <h2>
                <span aria-hidden="true">🔌</span>
                API 设置
              </h2>
              <p>配置API连接和认证设置。</p>
              
              <SettingsGroup>
                <SettingRow>
                  <div>
                    <label htmlFor="api-endpoint-input">API端点</label>
                    <div className="description">
                      设置默认API服务器地址
                    </div>
                  </div>
                  <input 
                    type="text" 
                    id="api-endpoint-input"
                    defaultValue="https://api.example.com" 
                  />
                </SettingRow>
                
                <SettingRow>
                  <div>
                    <label htmlFor="api-timeout-input">请求超时</label>
                    <div className="description">
                      API请求超时时间（秒）
                    </div>
                  </div>
                  <input 
                    type="number" 
                    id="api-timeout-input"
                    defaultValue={30} 
                    min={5} 
                    max={120}
                  />
                </SettingRow>
              </SettingsGroup>
            </SettingsCard>
          </SettingsCardContainer>
        </div>
      )}
      
      {/* 账户设置选项卡面板 */}
      {activeTab === 'account' && (
        <div role="tabpanel" id="tabpanel-account" aria-labelledby="tab-account">
          <SettingsCardContainer>
            <SettingsCard>
              <h2>
                <span aria-hidden="true">👤</span>
                账户详情
              </h2>
              <p>管理您的账户信息和偏好。</p>
              
              <SettingsGroup>
                <SettingRow>
                  <div>
                    <label htmlFor="username-input">用户名</label>
                    <div className="description">
                      您的账户显示名称
                    </div>
                  </div>
                  <input 
                    type="text" 
                    id="username-input"
                    defaultValue="用户名" 
                  />
                </SettingRow>
                
                <SettingRow>
                  <div>
                    <label htmlFor="email-input">邮箱地址</label>
                    <div className="description">
                      用于通知和账户恢复
                    </div>
                  </div>
                  <input 
                    type="email" 
                    id="email-input"
                    defaultValue="user@example.com" 
                  />
                </SettingRow>
                
                <SettingRow>
                  <div>
                    <label>更改密码</label>
                    <div className="description">
                      修改您的账户密码
                    </div>
                  </div>
                  <button>更改密码</button>
                </SettingRow>
              </SettingsGroup>
            </SettingsCard>
            
            <SettingsCard>
              <h2>
                <span aria-hidden="true">🔔</span>
                通知设置
              </h2>
              <p>管理您接收通知的方式和频率。</p>
              
              <SettingsGroup>
                <SettingRow>
                  <div>
                    <label htmlFor="email-notifications-checkbox">电子邮件通知</label>
                    <div className="description">
                      通过电子邮件接收通知
                    </div>
                  </div>
                  <input type="checkbox" id="email-notifications-checkbox" defaultChecked />
                </SettingRow>
                
                <SettingRow>
                  <div>
                    <label htmlFor="system-notifications-checkbox">系统通知</label>
                    <div className="description">
                      显示浏览器或桌面通知
                    </div>
                  </div>
                  <input type="checkbox" id="system-notifications-checkbox" defaultChecked />
                </SettingRow>
                
                <SettingRow>
                  <div>
                    <label htmlFor="notification-frequency-select">通知频率</label>
                    <div className="description">
                      设置通知发送频率
                    </div>
                  </div>
                  <select id="notification-frequency-select" defaultValue="immediate">
                    <option value="immediate">实时</option>
                    <option value="daily">每日摘要</option>
                    <option value="weekly">每周摘要</option>
                  </select>
                </SettingRow>
              </SettingsGroup>
            </SettingsCard>
          </SettingsCardContainer>
        </div>
      )}
    </SettingsContainer>
  );
};

export default Settings; 