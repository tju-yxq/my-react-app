import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiArrowRight, FiRefreshCw, FiArrowDown, FiAlertTriangle } from 'react-icons/fi';
import apiClient from '../services/apiClient'; // [修复] 使用正确的默认导入
import './ToolsList.css';

const ToolsList = ({ onToolSelect }) => {
    const [tools, setTools] = useState([]);
    const [pagination, setPagination] = useState(() => ({
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        page_size: 10,
        has_next: false,
    }));
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [pullDistance, setPullDistance] = useState(0);
    const [isPulling, setIsPulling] = useState(false);
    const [startY, setStartY] = useState(0);
    const PULL_THRESHOLD = 70;

    const fetchTools = useCallback(async (page = 1, isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            // 确保使用最新的 pagination 状态
            const currentPageSize = pagination?.page_size || 10;
            const result = await apiClient.getItems(page, currentPageSize);
            
            if (result && result.items && result.pagination) {
                setTools(prev => (page === 1 || isRefresh ? result.items : [...prev, ...result.items]));
                setPagination(result.pagination);
            } else {
                throw new Error('Invalid API response format');
            }
        } catch (err) {
            const errorMessage = err.message || '获取工具列表失败';
            setError(errorMessage);
            console.error('获取工具列表失败:', err);

            if (page === 1) {
                const fallbackTools = [
                    { tool_id: 'maps_weather', name: '天气查询', description: '查询指定城市的天气情况', type: 'http', tags: ['weather', 'system'] },
                    { tool_id: 'calendar', name: '日程管理', description: '查看和管理日程安排', type: 'http', tags: ['calendar', 'system'] }
                ];
                setTools(fallbackTools);
                setPagination(prev => ({
                    ...prev,
                    current_page: 1, 
                    total_pages: 1, 
                    total_items: fallbackTools.length, 
                    page_size: 10, 
                    has_next: false 
                }));
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [pagination.page_size, tools.length]);

    const handlePullStart = useCallback((clientY) => {
        setStartY(clientY);
        setIsPulling(false);
    }, []);

    const handlePullMove = useCallback((clientY, listElement) => {
        if (listElement.scrollTop === 0 && clientY > startY) {
            const diff = clientY - startY;
            setIsPulling(true);
            const newPullDistance = Math.min(diff * 0.4, PULL_THRESHOLD + 40);
            setPullDistance(newPullDistance);
            return true;
        }
        return false;
    }, [startY]);

    const handlePullEnd = useCallback(() => {
        if (isPulling) {
            if (pullDistance >= PULL_THRESHOLD) {
                fetchTools(1, true);
            }
            setPullDistance(0);
            setIsPulling(false);
        }
    }, [isPulling, pullDistance, PULL_THRESHOLD, fetchTools]);

    useEffect(() => {
        fetchTools(1);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const filteredTools = useMemo(() =>
        tools.filter(tool =>
            tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchTerm.toLowerCase())
        ), [tools, searchTerm]);

    return (
        <div className="modern-tools-container">
            <div className="tools-search-bar">
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="搜索工具..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {error && !loading && (
                <motion.div className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <FiAlertTriangle /> <span>{error}</span>
                    <button onClick={() => fetchTools(1, true)} className="retry-btn">重试</button>
                </motion.div>
            )}

            <div
                className="tools-list-scroll-area"
                onTouchStart={e => handlePullStart(e.touches[0].clientY)}
                onTouchMove={e => { if(handlePullMove(e.touches[0].clientY, e.currentTarget)) e.preventDefault() }}
                onTouchEnd={handlePullEnd}
                onMouseDown={e => handlePullStart(e.clientY)}
                onMouseMove={e => { if (e.buttons === 1) handlePullMove(e.clientY, e.currentTarget) }}
                onMouseUp={handlePullEnd}
                onMouseLeave={handlePullEnd}
            >
                <AnimatePresence>
                    {(isPulling || refreshing) && (
                        <motion.div
                            className="pull-indicator"
                            initial={{ height: 0 }}
                            animate={{ height: refreshing ? 50 : pullDistance }}
                            exit={{ height: 0 }}
                        >
                            {refreshing ? (
                                <><FiRefreshCw className="loading-spinner" /> 正在刷新</>
                            ) : (
                                <><FiArrowDown style={{ transform: `rotate(${pullDistance >= PULL_THRESHOLD ? '180deg' : '0deg'})` }} /> {pullDistance >= PULL_THRESHOLD ? "释放以刷新" : "下拉刷新"}</>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {filteredTools.map((tool, index) => (
                        <motion.div
                            key={tool.tool_id}
                            className="tool-card"
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            onClick={() => onToolSelect && onToolSelect(tool.tool_id)}
                            whileHover={{ y: -5, boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.1)' }}
                        >
                            <div className="tool-card-content">
                                <h3 className="tool-card-name">{tool.name}</h3>
                                <p className="tool-card-description">{tool.description}</p>
                                <div className="tool-card-meta">
                                    <span className={`tool-type-badge ${tool.type}`}>
                                        {tool.type === 'mcp' ? 'MCP' : 'HTTP'}
                                    </span>
                                    {tool.tags && tool.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="tool-tag-badge">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <FiArrowRight className="tool-card-action-icon" />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {pagination.has_next && !loading && (
                    <button className="load-more-button" onClick={() => fetchTools(pagination.current_page + 1)}>
                        加载更多
                    </button>
                )}

                {loading && !refreshing && <div className="feedback-indicator"><FiRefreshCw className="loading-spinner"/></div>}
                {!loading && filteredTools.length === 0 && (
                    <div className="feedback-indicator empty">
                        {searchTerm ? "没有匹配的工具" : "暂无可用工具"}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolsList;