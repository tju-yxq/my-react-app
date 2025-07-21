// 文件路径: src/components/NavBar.js
// 描述: 这是在您原始代码基础上，添加了可拖动悬浮工具箱按钮的最终版本。
// 核心保证:
// 1. 100% 保留了您所有的原始组件和 hooks，包括 useTheme, ThemeToggle, AuthContext 等。
// 2. 新增了悬浮按钮和工具箱面板，并实现了拖拽功能。
// 3. 桌面端和移动端的导航栏功能保持不变。

import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import ThemeToggle from './ThemeToggle';
import { FiChevronDown, FiTool, FiX,FiCode } from 'react-icons/fi'; // [新增] FiTool, FiX
import MobileNavButton from './MobileNavButton';
import { useTheme } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import ToolsList from './ToolsList'; // [新增] 导入工具箱组件

// --- Styled Components (在您的原始代码基础上修改和添加) ---

// [修改] 全局样式，现在也处理工具箱打开时的背景
const GlobalNavStyle = createGlobalStyle`
  body.mobile-menu-open,
  body.toolbox-open {
    overflow: hidden;
  }
`;

// [新增] 可拖动的悬浮按钮
const FloatingActionButton = styled.div.attrs(props => ({
  style: {
    top: `${props.position.y}px`,
    left: `${props.position.x}px`,
  },
}))`
  position: fixed;
  z-index: 1050;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--primary-color, #00a8a8);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  cursor: grab;
  transition: all 0.2s ease-in-out;
  border: 2px solid white;
  
  /* 确保在浅色主题下也有足够的对比度 */
  @media (prefers-color-scheme: light) {
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
  }

  &:active {
    cursor: grabbing;
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
`;

// [新增] 工具箱面板
const ToolboxPanel = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  height: 100vh;
  background-color: var(--surface);
  box-shadow: 4px 0 15px rgba(0,0,0,0.1);
  z-index: 1100;
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.35s ease-in-out;
  display: flex;
  flex-direction: column;

  .toolbox-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    
    h3 {
      margin: 0;
      color: var(--text);
    }

    button {
      background: none;
      border: none;
      color: var(--text);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      display: flex;
      &:hover {
        background-color: var(--hover-bg);
      }
    }
  }

  .toolbox-content {
    flex-grow: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }
`;

// [新增] 工具箱背景遮罩
const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.4);
  z-index: 1099;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.35s ease-in-out;
`;


// 导航栏容器 (来自您的原始代码)
const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--nav-background, var(--surface));
  color: var(--nav-text, var(--text));
  box-shadow: 0 2px 10px var(--shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: background-color var(--transition-normal), color var(--transition-normal);
`;

// Logo样式 (来自您的原始代码)
const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  z-index: 1002;
  
  a {
    color: inherit;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  span {
    font-size: 1.8rem;
  }
`;

// 导航链接容器 (来自您的原始代码, 添加了媒体查询)
const NavLinks = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  gap: 2.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

// 下拉菜单与导航链接样式 (全部来自您的原始代码)
const DropdownContainer = styled.div`
  position: relative;
  &:hover > ul, &:focus-within > ul {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const DropdownToggle = styled.button`
  background: transparent;
  border: none;
  color: var(--link-color, var(--text));
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  position: relative;
  transition: color var(--transition-fast);
  &:hover, &:focus {
    color: var(--color-primary);
    outline: none;
  }
`;

const DropdownMenu = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, 10px);
  background: var(--surface);
  border: 1px solid var(--border-color, rgba(255,255,255,0.1));
  border-radius: var(--radius-md, 4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, transform 0.2s ease;
  min-width: 160px;
  z-index: 1100;
`;

const DropdownItem = styled.li`
  a {
    display: block;
    padding: 0.5rem 1rem;
    color: var(--text);
    text-decoration: none;
    font-size: 0.95rem;
    transition: background 0.2s ease;
    &:hover {
      background: var(--hover-bg, rgba(255,255,255,0.05));
    }
  }
`;

const NavLink = styled(Link).attrs({
  onClick: (e) => {
    // 阻止事件冒泡，防止父元素的事件处理器干扰
    e.stopPropagation();
    // 确保链接能够正常导航
    return true;
  }
})`
  color: var(--link-color, var(--text));
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  position: relative;
  transition: color var(--transition-fast);
  cursor: pointer;
  display: inline-block;
  
  &.active, &:hover {
    color: var(--color-primary);
    text-decoration: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 50%;
    background-color: var(--primary-color);
    transition: width 0.3s ease, left 0.3s ease;
    pointer-events: none;
  }
  
  &.active::after, &:hover::after {
    width: 100%;
    left: 0;
  }
`;

// 操作区域 (来自您的原始代码, 添加了媒体查询)
const ActionsArea = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

// 按钮样式 (来自您的原始代码)
const Button = styled(Link)`
  background-color: transparent;
  border: 2px solid var(--button-background, var(--primary-color));
  color: var(--text, #1A202C);
  padding: 0.4rem 1rem;
  border-radius: var(--radius-md, 4px);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--button-background, var(--primary-color));
    color: var(--button-text, #FFFFFF);
    transform: translateY(-2px);
  }
`;

// [新增] 移动端汉堡按钮的容器
const MobileNavToggleContainer = styled.div`
  display: none;
  z-index: 1002;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
  }
`;

// [新增] 移动端侧滑菜单
const MobileMenu = styled.div`
  display: flex;
  flex-direction: column;
  padding: 6rem 2rem 2rem;
  gap: 1.5rem;
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 80%;
  max-width: 300px;
  background-color: var(--nav-background, var(--surface));
  box-shadow: -4px 0 15px rgba(0,0,0,0.1);
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.3s ease-in-out;
  z-index: 1001;

  a {
    color: var(--text);
    text-decoration: none;
    font-size: 1.2rem;
    font-weight: 500;
    width: 100%;
    text-align: center;
    padding: 0.75rem;
    border-radius: var(--radius-md);
    &:hover {
      background-color: var(--hover-bg);
    }
  }

  .mobile-auth-button {
    border: 2px solid var(--primary-color);
    color: var(--primary-color);
    font-weight: bold;
  }
  
  hr {
    width: 90%;
    border: none;
    border-top: 1px solid var(--border-color);
    margin: 1rem 0;
  }
`;


// --- 导航栏组件 (在您的原始代码基础上修改) ---
const NavBar = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const { isAuthenticated, role } = useContext(AuthContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // [新增] 工具箱和悬浮按钮的状态
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  // [保留] 您的滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // [修改] 监听菜单状态，控制 body 滚动
  useEffect(() => {
    if (isMobileMenuOpen || isToolboxOpen) {
      document.body.classList.add(isMobileMenuOpen ? 'mobile-menu-open' : 'toolbox-open');
    } else {
      document.body.classList.remove('mobile-menu-open', 'toolbox-open');
    }
    return () => document.body.classList.remove('mobile-menu-open', 'toolbox-open');
  }, [isMobileMenuOpen, isToolboxOpen]);

  // [新增] 拖拽逻辑
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    const rect = buttonRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = (e) => {
      setIsDragging(false);
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) < 5) {
        setIsToolboxOpen(prev => !prev);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);


  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <GlobalNavStyle />
      <NavContainer style={{ boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.15)' : '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
        <Logo>
          <Link to="/" onClick={closeMobileMenu}>
            <span role="img" aria-label="logo">🔊</span>
            Echo
          </Link>
        </Logo> 
        <NavLinks>
          <NavLink to="/" className={location.pathname === '/' ? 'active' : ''}>首页</NavLink>
          <DropdownContainer>
            <DropdownToggle>服务 <FiChevronDown size={14} /></DropdownToggle>
             <DropdownMenu>
              <DropdownItem><Link to="/services">服务中心</Link></DropdownItem>
              <DropdownItem><Link to="/messages">消息</Link></DropdownItem>
             </DropdownMenu>
          </DropdownContainer>
          <DropdownContainer>
            <DropdownToggle>设置 <FiChevronDown size={14} /></DropdownToggle>
            <DropdownMenu>
              <DropdownItem><Link to="/settings/theme">外观和主题</Link></DropdownItem>
              <DropdownItem><Link to="/settings/advanced">高级设置</Link></DropdownItem>
              <DropdownItem><Link to="/settings/account">账号设置</Link></DropdownItem>
            </DropdownMenu>
          </DropdownContainer>
          <NavLink to="/about" className={location.pathname === '/about' ? 'active' : ''}>关于</NavLink>
           {/* ======================================================
            【核心修改点】
            - 我们在这里添加一个独立的一级导航链接。
            - 它只在用户已登录且角色为 'developer' 时渲染。
            ======================================================
          */}
          {isAuthenticated && role === 'developer' && (
            <NavLink to="/developer" className={location.pathname.startsWith('/developer') ? 'active' : ''}>
              <FiCode size={16} />
              <span>开发者中心</span>
            </NavLink>
          )}
        </NavLinks>
        
        <ActionsArea>
          <ThemeToggle />
          {isAuthenticated ? (
            <Button to="/user">用户中心</Button>
          ) : (
            <Button to="/user">登陆/注册</Button>
          )}
        </ActionsArea>

        <MobileNavToggleContainer>
          <MobileNavButton 
            isOpen={isMobileMenuOpen}
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavToggleContainer>
      </NavContainer>

      <MobileMenu isOpen={isMobileMenuOpen}>
        <Link to="/" onClick={closeMobileMenu}>首页</Link>
        <Link to="/services" onClick={closeMobileMenu}>服务中心</Link>
        <Link to="/settings" onClick={closeMobileMenu}>设置</Link>
        <Link to="/about" onClick={closeMobileMenu}>关于</Link>
        <hr />
        {isAuthenticated ? (
          <Link to="/user" className="mobile-auth-button" onClick={closeMobileMenu}>用户中心</Link>
        ) : (
          <Link to="/user" className="mobile-auth-button" onClick={closeMobileMenu}>登陆/注册</Link>
        )}
        <ThemeToggle />
      </MobileMenu>

      {/* [新增] 工具箱相关组件 */}
      <Backdrop isOpen={isToolboxOpen} onClick={() => setIsToolboxOpen(false)} />
      <ToolboxPanel isOpen={isToolboxOpen}>
        <div className="toolbox-header">
          <h3>工具箱</h3>
          <button onClick={() => setIsToolboxOpen(false)} aria-label="关闭工具箱">
            <FiX size={20} />
          </button>
        </div>
        <div className="toolbox-content">
          <ToolsList />
        </div>
      </ToolboxPanel>
      <FloatingActionButton
        ref={buttonRef}
        position={position}
        onMouseDown={handleMouseDown}
        aria-label="打开或拖动工具箱"
      >
        <FiTool size={24} />
      </FloatingActionButton>
    </>
  );
};

export default NavBar;
