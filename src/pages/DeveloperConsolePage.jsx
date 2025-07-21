// 文件路径: src/pages/DeveloperConsolePage.jsx
// 描述: 这是美化后的开发者控制台页面。

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiChevronRight, FiCheckCircle, FiAlertTriangle, FiClock } from 'react-icons/fi';
// import apiClient from '../services/apiClient'; // 在您的项目中取消注释
// import { toast } from '../components/common/Toast'; // 在您的项目中取消注释

// --- 样式组件 ---
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  animation: fadeIn 0.5s ease-in-out;
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;
const PageHeader = styled.header`
  margin-bottom: 2rem;
  h1 { font-size: 2.25rem; margin: 0 0 0.5rem 0; color: var(--c-text-primary); }
  p { font-size: 1.1rem; color: var(--c-text-secondary); margin: 0; }
`;
const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 2rem;
`;
const TabButton = styled.button`
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  font-size: 1rem;
  font-weight: 500;
  color: var(--c-text-secondary);
  cursor: pointer;
  position: relative;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  &:hover { color: var(--c-primary); }
  &.active { color: var(--c-primary); border-bottom-color: var(--c-primary); }
`;
const Card = styled.div`
  background-color: var(--c-surface);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--c-border); }
  th { font-weight: 600; color: var(--c-text-secondary); font-size: 0.9rem; }
  tr:hover { background-color: var(--c-bg); }
`;
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => props.status === 'active' ? 'rgba(79, 209, 197, 0.1)' : 'rgba(246, 224, 94, 0.1)'};
  color: ${props => props.status === 'active' ? 'var(--c-primary)' : '#F6E05E'};
`;

const DeveloperConsolePage = () => {
    const [activeTab, setActiveTab] = useState('services');
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // 模拟从 API 获取数据
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setServices([
                { id: 'dev-svc-1', name: '股票查询服务', type: 'http', status: 'active', created: '2025-04-30', usage: 1243 },
                { id: 'dev-svc-2', name: '新闻资讯API', type: 'mcp', status: 'active', created: '2025-05-01', usage: 532 },
                { id: 'dev-svc-3', name: '智能翻译工具', type: 'http', status: 'pending', created: '2025-05-10', usage: 0 },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'active': return <Badge status="active"><FiCheckCircle size={14} /> 已上线</Badge>;
            case 'pending': return <Badge status="pending"><FiClock size={14} /> 审核中</Badge>;
            default: return <Badge status="rejected"><FiAlertTriangle size={14} /> 已拒绝</Badge>;
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <h1>开发者控制台</h1>
                <p>在这里管理您的服务、应用和API密钥。</p>
            </PageHeader>
            <TabContainer>
                <TabButton className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>我的服务</TabButton>
                <TabButton className={activeTab === 'apps' ? 'active' : ''} onClick={() => setActiveTab('apps')}>我的应用</TabButton>
                <TabButton className={activeTab === 'docs' ? 'active' : ''} onClick={() => setActiveTab('docs')}>开发文档</TabButton>
            </TabContainer>
            <Card>
                {activeTab === 'services' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>服务列表</h2>
                            <button className="primary-button"><FiPlus size={16} /> 创建新服务</button>
                        </div>
                        {loading ? <p>正在加载服务...</p> : (
                            <Table>
                                <thead>
                                    <tr><th>服务名称</th><th>类型</th><th>状态</th><th>创建日期</th><th>使用次数</th><th>操作</th></tr>
                                </thead>
                                <tbody>
                                    {services.map(service => (
                                        <tr key={service.id}>
                                            <td>{service.name}</td>
                                            <td>{service.type.toUpperCase()}</td>
                                            <td>{renderStatusBadge(service.status)}</td>
                                            <td>{service.created}</td>
                                            <td>{service.usage.toLocaleString()}</td>
                                            <td><button className="icon-button"><FiChevronRight /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </>
                )}
                {activeTab === 'apps' && <div>应用管理界面内容...</div>}
                {activeTab === 'docs' && <div>开发文档内容...</div>}
            </Card>
        </PageContainer>
    );
};

export default DeveloperConsolePage;
