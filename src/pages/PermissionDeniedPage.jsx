// 文件路径: src/pages/PermissionDeniedPage.jsx
// 描述: 当用户权限不足时显示的页面。

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 70vh;
  color: var(--c-text-secondary);
`;

const ErrorIcon = styled(FiXCircle)`
  color: var(--c-error, #E53E3E);
  width: 64px;
  height: 64px;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--c-text-primary);
  margin: 0 0 0.5rem 0;
`;

const Description = styled.p`
  font-size: 1.1rem;
  max-width: 450px;
  margin-bottom: 2rem;
`;

const HomeButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  background-color: var(--c-primary);
  color: var(--c-text-on-primary);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.85;
  }
`;

const PermissionDeniedPage = () => {
    return (
        <PageContainer>
            <ErrorIcon />
            <Title>访问受限</Title>
            <Description>抱歉，此页面仅对开发者角色的用户开放。如果您认为这是一个错误，请联系管理员。</Description>
            <HomeButton to="/">返回首页</HomeButton>
        </PageContainer>
    );
};

export default PermissionDeniedPage;
