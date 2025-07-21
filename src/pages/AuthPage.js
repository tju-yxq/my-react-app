import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import LoginForm from '../components/LoginForm';
// [核心修复] 将错误的导入路径 ../components-v2/RegisterForm 修正为正确的路径
import RegisterForm from '../components/RegisterForm';
import { AuthContext } from '../contexts/AuthContext';
import {
  MessageOutline,
  AppstoreOutline,
  TeamOutline,
  UnorderedListOutline,
  AlipayCircleFill,
  TeamFill,
} from 'antd-mobile-icons';

// --- 动画定义 (Animations) ---

const backgroundShine = keyframes`
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const featureFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// --- 基础样式组件 (Base Styled Components) ---

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #1a1a2e;
  position: relative;
  overflow: hidden;

  /* 动态光晕背景效果 */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 150vmax;
    height: 150vmax;
    background-image: conic-gradient(
      from 90deg at 50% 50%,
      #4FD1C5 -15.14deg,
      #805AD5 50.51deg,
      #1a1a2e 150.02deg,
      #805AD5 250.51deg,
      #4FD1C5 344.86deg,
      #1a1a2e 360deg
    );
    filter: blur(150px);
    opacity: 0.15;
    animation: ${backgroundShine} 25s linear infinite;
  }

  @media (max-width: 992px) {
    padding: 1rem;
    align-items: flex-start; // 移动端顶部对齐
    padding-top: 5vh;
  }
`;

const AuthContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 1200px;
  min-height: 700px;
  background-color: rgba(20, 20, 35, 0.7);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  overflow: hidden;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;

  @media (max-width: 992px) {
    flex-direction: column;
    min-height: auto;
    max-width: 500px;
  }
`;

const IntroPanel = styled.div`
  flex: 1.1;
  padding: 4rem;
  color: #f8f8f8;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  text-align: center;

  /* 面板内的装饰性辉光效果 */
  &::after {
    content: '';
    position: absolute;
    top: -10%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(79, 209, 197, 0.15) 0%, transparent, 40%);
    pointer-events: none;
  }

  @media (max-width: 992px) {
    padding: 2.5rem;
    flex: 1;
  }
`;

const AuthPanel = styled.div`
  flex: 0.9;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: rgba(42, 42, 62, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;

  @media (max-width: 992px) {
    padding: 2.5rem;
    flex: 1;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

// --- 内容元素样式 (Content Element Styles) ---

const PlatformTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  line-height: 1.2;
  background: linear-gradient(90deg, #FFFFFF, #a0aec0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
`;

const PlatformHighlight = styled.span`
  background: linear-gradient(90deg, #4FD1C5, #a29bfe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const PlatformDescription = styled.p`
  font-size: 1.1rem;
  color: #a0aec0;
  line-height: 1.7;
  margin-bottom: 3rem;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: inline-block;
  text-align: left;
`;

const createFeatureAnimation = () => {
  let styles = '';
  for (let i = 1; i <= 4; i++) {
    styles += `
      &:nth-child(${i}) {
        animation-delay: ${0.2 + i * 0.1}s;
      }
    `;
  }
  return css`${styles}`;
};

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.8rem;
  font-size: 1rem;
  opacity: 0;
  animation: ${featureFadeIn} 0.6s ease-out forwards;
  transition: transform 0.3s ease;
  ${createFeatureAnimation()}

  &:hover {
    transform: translateX(5px);
  }

  .icon-wrapper {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background-color: rgba(79, 209, 197, 0.1);
    margin-right: 1rem;
  }

  .icon {
    font-size: 1.5rem;
    color: var(--color-primary, #4FD1C5);
  }
  
  .text-content strong {
    display: block;
    color: #ffffff;
    margin-bottom: 0.25rem;
  }
  
  .text-content span {
    color: #a0aec0;
    line-height: 1.5;
  }
`;

const AuthHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const AuthTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
`;

const SocialLoginDivider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  color: #a0aec0;
  font-size: 0.8rem;
  margin: 2rem 0;

  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  &:not(:empty)::before {
    margin-right: .5em;
  }

  &:not(:empty)::after {
    margin-left: .5em;
  }
`;

const SocialLoginContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
`;

const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  color: #a0aec0;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(79, 209, 197, 0.2);
    color: #4FD1C5;
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
  }
`;

// --- 主组件 (Main Component) ---

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <PageContainer>
      <AuthContainer>
        {/* 左侧介绍面板 */}
        <IntroPanel>
          <PlatformTitle>
            全语音 <PlatformHighlight>AI-Agent</PlatformHighlight> 平台
          </PlatformTitle>
          <PlatformDescription>
            一个端到端、以语音为唯一交互手段的智能代理系统。
            释放双手的力量，让智能触手可及。
          </PlatformDescription>
          <FeatureList>
            <FeatureItem>
              <div className="icon-wrapper"><MessageOutline className="icon" /></div>
              <div className="text-content">
                <strong>自然语言理解</strong>
                <span>精准识别您的意图，无惧复杂指令。</span>
              </div>
            </FeatureItem>
            <FeatureItem>
              <div className="icon-wrapper"><AppstoreOutline className="icon" /></div>
              <div className="text-content">
                <strong>智能工具调度</strong>
                <span>自动调用海量技能，完成您的多样需求。</span>
              </div>
            </FeatureItem>
            <FeatureItem>
              <div className="icon-wrapper"><TeamOutline className="icon" /></div>
              <div className="text-content">
                <strong>多轮对话交互</strong>
                <span>通过确认与追问，确保任务准确执行。</span>
              </div>
            </FeatureItem>
            <FeatureItem>
              <div className="icon-wrapper"><UnorderedListOutline className="icon" /></div>
              <div className="text-content">
                <strong>开放平台接入</strong>
                <span>允许开发者轻松扩展平台能力。</span>
              </div>
            </FeatureItem>
          </FeatureList>
        </IntroPanel>

        {/* 右侧认证面板 */}
        <AuthPanel>
          <AuthHeader>
            <AuthTitle>{isLogin ? '欢迎回来' : '创建您的账户'}</AuthTitle>
          </AuthHeader>
          
          {isLogin ? (
            <LoginForm onRegisterClick={toggleAuthMode} />
          ) : (
            <RegisterForm onLoginClick={toggleAuthMode} />
          )}

          <SocialLoginDivider>或</SocialLoginDivider>
          
          <SocialLoginContainer>
            <SocialButton title="使用支付宝登录">
              <AlipayCircleFill />
            </SocialButton>
            <SocialButton title="使用其他社交账号登录">
              <TeamFill />
            </SocialButton>
          </SocialLoginContainer>
        </AuthPanel>
      </AuthContainer>
    </PageContainer>
  );
};

export default AuthPage;
