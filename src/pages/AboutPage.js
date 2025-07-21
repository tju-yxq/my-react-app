// src/pages/AboutPage.js
import React from 'react';
import {
    Mic, Puzzle, Palette, Smartphone, Code, ShieldHalf,
    Compass, FileCode2, Github, TerminalSquare, ShieldCheck,
    BookOpen, Bot, Accessibility, MousePointerClick, KeyRound,
    Database, BrainCircuit, Braces, Box, Speech, Figma,
    User, ArrowRight
} from 'lucide-react';
// 引入修正后的 CSS 文件
import './AboutPage.css';

const AboutPage = () => {
    return (
        // 使用一个统一的容器类名，方便 CSS 控制
        <div className="about-page">
            <header className="about-hero">
                <div className="container">
                    <h1>关于 Echo AI</h1>
                    <p className="subtitle">让语音成为你的超能力 🎙️</p>
                </div>
            </header>

            <main className="about-main-content">
                {/* 每个 section 都有独立的容器，确保间距 */}
                <section className="about-section">
                    <div className="container">
                        <div className="vision-card">
                            <h2>我们的愿景：一句话，连接数字世界</h2>
                            <p>
                                欢迎来到 <strong>Echo AI</strong>，一个以语音为核心交互方式的次世代智能代理平台。我们相信，最自然、最直接的交互方式就是语言。在这个信息爆炸的时代，我们致力于打破人与数字服务之间的壁垒。Echo AI 的诞生，旨在让每一个人，无论是普通消费者还是专业开发者，都能通过最简单的一句话，轻松驾驭和调度海量、复杂的数字技能，获得即时、精准的服务体验。
                            </p>
                        </div>
                    </div>
                </section>

                <section className="about-section">
                    <div className="container">
                        <div className="section-header">
                            <h2>Echo AI 是什么？</h2>
                            <p className="subtitle">它不仅仅是一个语音助手，更是一个强大的技能调度中心。</p>
                        </div>
                        <div className="grid md:grid-cols-2">
                            <div className="info-card">
                                <div className="icon-wrapper"><User size={28} /></div>
                                <h3>对于普通用户</h3>
                                <p>您无需在繁杂的应用间切换，也无需学习复杂的操作。只需对 Echo AI 说出您的需求，无论是查询天气、管理日程，还是调用任何接入平台的第三方服务，它都能为您完成。</p>
                                <div className="flow-diagram">
                                    <p className="flow-title">核心交互流程</p>
                                    <div className="flow-steps">
                                        <span>您说</span><ArrowRight size={16} />
                                        <span>识别</span><ArrowRight size={16} />
                                        <span>理解</span><ArrowRight size={16} />
                                        <span>执行</span>
                                    </div>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="icon-wrapper"><Code size={28} /></div>
                                <h3>对于开发者</h3>
                                <p>我们为您提供了一个开放、高效的技能接入平台。如果您拥有自己的 HTTP API 或 MCP 脚本，只需遵循我们极简的接口规范，即可在 <strong>30分钟内</strong> 将您的服务接入 Echo AI 生态。</p>
                                <ul className="feature-list">
                                    <li><TerminalSquare size={20} /> 企业级开发者控制台</li>
                                    <li><ShieldCheck size={20} /> 多角色权限体系</li>
                                    <li><BookOpen size={20} /> 详细的开发文档</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="about-section">
                    <div className="container">
                        <div className="section-header">
                            <h2>核心特性一览</h2>
                            <p className="subtitle">探索 Echo AI 的强大功能，体验智能语音交互的无限可能</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3">
                            <div className="feature-card">
                                <div className="icon-wrapper"><Mic /></div>
                                <h4>纯语音交互</h4>
                                <p>以语音为唯一交互手段，实现真正的“零点击”操作。</p>
                            </div>
                            <div className="feature-card">
                                <div className="icon-wrapper"><Puzzle /></div>
                                <h4>开放的技能生态</h4>
                                <p>无缝集成 MCP 脚本与各类第三方 HTTP API。</p>
                            </div>
                            <div className="feature-card">
                                <div className="icon-wrapper"><Palette /></div>
                                <h4>完整的主题系统</h4>
                                <p>支持深色/浅色模式，并允许用户实时自定义主题。</p>
                            </div>
                            <div className="feature-card">
                                <div className="icon-wrapper"><Smartphone /></div>
                                <h4>全面响应式设计</h4>
                                <p>采用 Mobile-First 策略，适配所有尺寸的屏幕。</p>
                            </div>
                            <div className="feature-card">
                                <div className="icon-wrapper"><Code /></div>
                                <h4>企业级开发者工具</h4>
                                <p>提供功能完善的开发者控制台，简化服务管理。</p>
                            </div>
                            <div className="feature-card">
                                <div className="icon-wrapper"><ShieldHalf /></div>
                                <h4>100% 测试覆盖</h4>
                                <p>通过 E2E、单元和无障碍测试，确保平台稳定可靠。</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="about-section">
                    <div className="container">
                        <div className="section-header">
                            <h2>坚实的技术架构</h2>
                            <p className="subtitle">我们采用业界领先的前后端分离架构，确保系统的高性能、高可用和高扩展性。</p>
                        </div>
                        <div className="grid lg:grid-cols-3">
                            <div className="tech-card">
                                <h3>前端技术栈</h3>
                                <ul>
                                    <li><Figma />React 18</li>
                                    <li><Figma />Ant Design & Framer Motion</li>
                                    <li><Speech />Web Speech API</li>
                                    <li><Box />React Context</li>
                                </ul>
                            </div>
                            <div className="tech-card">
                                <h3>后端技术栈</h3>
                                <ul>
                                    <li><Braces />Python & FastAPI</li>
                                    <li><BrainCircuit />OpenAI SDK (LLM)</li>
                                    <li><Database />MySQL & SQLAlchemy</li>
                                    <li><KeyRound />JWT & RBAC</li>
                                </ul>
                            </div>
                            <div className="tech-card">
                                <h3>自动化与质量保证</h3>
                                <ul>
                                    <li><MousePointerClick />Cypress (E2E)</li>
                                    <li><Accessibility />jest-axe (无障碍)</li>
                                    <li><Bot />自研自动化开发脚本</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="about-section">
                    <div className="container">
                        <div className="section-header">
                            <h2>加入我们</h2>
                            <p className="subtitle">无论您的角色是什么，Echo AI 都欢迎您的加入。</p>
                        </div>
                        <div className="grid md:grid-cols-3">
                            <a href="#" className="cta-card">
                                <div className="icon-wrapper"><Compass size={32} /></div>
                                <h4>探索现有技能</h4>
                                <p>立即开始体验，感受语音交互的便捷。</p>
                            </a>
                            <a href="#" className="cta-card">
                                <div className="icon-wrapper"><FileCode2 size={32} /></div>
                                <h4>成为开发者</h4>
                                <p>查阅我们的开发文档，将您的服务接入平台。</p>
                            </a>
                            <a href="https://github.com/justDance-everybody/Demo_echo_frontend" target="_blank" rel="noopener noreferrer" className="cta-card">
                                <div className="icon-wrapper"><Github size={32} /></div>
                                <h4>贡献社区</h4>
                                <p>我们是一个开放的项目，欢迎您提交问题与建议。</p>
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AboutPage;
