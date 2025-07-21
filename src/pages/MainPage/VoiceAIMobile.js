import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Button, 
  NavBar, 
  Card,
  Toast,
  WaterMark
} from 'antd-mobile';
import { SoundOutline, AudioOutline, CloseCircleOutline } from 'antd-mobile-icons';
import { v4 as uuidv4 } from 'uuid';
import ThemeToggle from '../../components/ThemeToggle';
import apiClient from '../../services/apiClient';
import useTTS from '../../hooks/useTTS';
import useVoice from '../../hooks/useVoice';
import useIntent from '../../hooks/useIntent';
import { ThemeContext } from '../../theme/ThemeProvider';
import { AuthContext } from '../../contexts/AuthContext';
import './VoiceAIMobile.css';

// 添加兼容性检查
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition || null;

const VoiceAIMobile = () => {
  const { theme } = useContext(ThemeContext);
  const { isAuthenticated, user } = useContext(AuthContext);
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [apiAvailable, setApiAvailable] = useState(true);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [currentToolId, setCurrentToolId] = useState('');
  const [currentParams, setCurrentParams] = useState({});
  const [originalQuery, setOriginalQuery] = useState('');
  
  // 使用hooks
  const { speak, cancel, isSpeaking } = useTTS();
  const voice = useVoice(); // 使用useVoice hook代替原生API
  const { classifyIntent } = useIntent(); // 使用useIntent hook进行意图分类
  
  // 初始化会话和检查API可用性
  useEffect(() => {
    // 检查API可用性
    if (!SpeechRecognitionAPI) {
      setApiAvailable(false);
      Toast.show({
        icon: 'fail',
        content: '您的浏览器不支持语音识别',
        duration: 3000,
      });
      return;
    }
    
    // 生成新的会话ID
    setSessionId(uuidv4());
  }, []);
  
  // 执行操作函数 - 使用useCallback包装以便在依赖项中使用
  const executeAction = useCallback(async (toolId, params) => {
    // 防止重复执行
    if (executing) {
      console.log("已经在执行操作,忽略重复请求");
      return;
    }
    
    setExecuting(true);
    
    try {
      Toast.show({
        icon: 'loading',
        content: '正在执行...',
        duration: 0,
      });
      
      console.log(`开始执行工具: ${toolId}, 参数:`, params);
      const result = await apiClient.execute(toolId, params, sessionId, user?.id || 1);
      
      // 清除加载提示
      Toast.clear();
      
      console.log("执行结果:", result);
      
      // 格式化结果用于显示和朗读
      const displayText = formatResultForDisplay(result.data || result);
      const speechText = formatResultForSpeech(result.data || result);
      
      setResult(displayText);
      
      // 停止任何正在进行的语音
      if (isSpeaking) {
        cancel();
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // 朗读结果
      speak(speechText);
      
    } catch (error) {
      console.error("执行操作失败:", error);
      Toast.show({
        icon: 'fail',
        content: error.message || '执行失败，请重试',
        duration: 2000,
      });
      setResult('执行失败: ' + (error.message || '未知错误'));
    } finally {
      // 延迟释放executing状态,避免UI闪烁
      setTimeout(() => {
        setExecuting(false);
      }, 300);
    }
  }, [executing, sessionId, user, isSpeaking, cancel, speak]);
  
  // 处理意图函数 - 使用useCallback包装以便在依赖项中使用
  const processIntent = useCallback(async (userText) => {
    if (processing) {
      console.log("已经在处理中,忽略重复请求");
      return; // 避免重复处理
    }
    
    setProcessing(true);
    
    try {
      console.log(`开始处理意图: "${userText}"`);
      const response = await apiClient.interpret(userText, sessionId, user?.id || 1);
      
      // 判断是否需要确认
      if (response.type === 'confirm' || (response.tool_calls && response.tool_calls.length > 0)) {
        // 获取确认文本
        const confirmMessage = response.confirmText || response.confirm_text || '您确定要执行此操作吗？';
        setConfirmText(confirmMessage);
        
        // 准备工具ID和参数
        let toolId = '';
        let params = {};
        
        if (response.tool_calls && response.tool_calls.length > 0) {
          // 新的API结构
          const toolCall = response.tool_calls[0];
          toolId = toolCall.tool_id;
          params = toolCall.parameters || {};
        } else {
          // 旧的API结构
          toolId = response.action;
          params = response.params || {};
        }
        
        // 先存储当前工具ID和参数,用于后续执行
        setCurrentToolId(toolId);
        setCurrentParams(params);
        
        // 确保不会在TTS播放前就开始监听语音
        setListening(false);
        if (voice.isListening) {
          await voice.stopListening();
        }
        
        // 设置等待确认状态
        setWaitingForConfirmation(true);
        
        // 延迟一点再播放TTS,确保状态更新已完成
        // 停止任何正在播放的语音
        if (isSpeaking) {
          cancel();
          // 给取消操作一点时间完成
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // 播放确认文本
        console.log(`开始播放确认文本: "${confirmMessage}"`);
        speak(confirmMessage);
        setSpeaking(true);
      } else if (response.content) {
        // 直接响应
        setResult(response.content);
        speak(response.content);
      } else {
        setResult('无法理解您的请求,请重试');
        speak('无法理解您的请求,请重试');
      }
    } catch (error) {
      console.error('处理意图失败:', error);
      Toast.show({
        icon: 'fail',
        content: error.message || '服务器错误,请重试',
      });
    } finally {
      // 短延迟后才释放processing状态,避免重复处理
      setTimeout(() => {
        setProcessing(false);
      }, 300);
    }
  }, [processing, sessionId, user, voice, isSpeaking, cancel, speak, setListening]);
  
  // 使用useEffect监听voice.transcript变化，处理确认流程
  useEffect(() => {
    if (waitingForConfirmation && voice.transcript) {
      console.log("收到确认语音回复:", voice.transcript);
      
      // 使用useIntent的classifyIntent方法分类意图,传入原始查询文本
      const intent = classifyIntent(voice.transcript, originalQuery);
      console.log("分类意图结果:", intent);
      
      // 如果返回IGNORE,跳过本次输入处理
      if (intent === 'IGNORE') {
        console.log("忽略当前输入,继续等待确认");
        return;
      }
      
      // 停止监听
      voice.stopListening();
      
      // 根据意图类型执行不同操作
      if (intent === 'CONFIRM') {
        // 设置执行标志,防止重复执行
        if (executing) {
          console.log("已经在执行中,忽略重复确认");
          return;
        }
        
        // 延迟执行,等待状态更新完成
        setTimeout(() => {
          // 确保操作信息存在
          if (currentToolId) {
            Toast.show({
              icon: 'loading',
              content: '正在执行操作...',
              duration: 0,
            });
            
            setWaitingForConfirmation(false);
            executeAction(currentToolId, currentParams).finally(() => {
              Toast.clear();
            });
          } else {
            console.log("工具ID为空,无法执行操作");
            Toast.show({
              content: '无法执行操作,请重试',
            });
            setWaitingForConfirmation(false);
          }
        }, 300);
      } else if (intent === 'RETRY') {
        // 重新处理原始文本
        setWaitingForConfirmation(false);
        if (text) {
          Toast.show({
            content: '正在重新处理您的请求...',
          });
          processIntent(text);
        }
      } else if (intent === 'CANCEL') {
        Toast.show({
          icon: 'success',
          content: '已取消操作',
        });
        setWaitingForConfirmation(false);
        setConfirmText('');
        setCurrentToolId('');
        setCurrentParams({});
      } else {
        // 如果意图不明确,默认为取消
        Toast.show({
          icon: 'info',
          content: '未能识别您的回复,已取消操作',
        });
        setWaitingForConfirmation(false);
        setConfirmText('');
      }
    }
  }, [voice.transcript, waitingForConfirmation, classifyIntent, currentToolId, currentParams, text, originalQuery, executing, voice, processIntent, executeAction]);
  
  // 使用useEffect监听isSpeaking状态变化，处理TTS播放完成后的自动语音识别启动
  useEffect(() => {
    setSpeaking(isSpeaking);
    
    // 当TTS停止播放且在等待确认状态时,自动开始语音识别
    if (!isSpeaking && waitingForConfirmation && confirmText) {
      console.log("TTS播放结束,准备监听确认回复...");
      
      // 缩短延迟时间，提高响应性
      const delay = 1000; // 减少到1秒
      const timer = setTimeout(() => {
        // 简化检查条件，只要还在等待确认且没有在监听就启动
        if (waitingForConfirmation && !voice.isListening) {
          console.log("自动开始监听确认回复...");
          try {
            voice.startListening();
            setListening(true);
          } catch (error) {
            console.error('自动启动语音识别失败:', error);
            // 如果自动启动失败，提示用户手动点击
            Toast.show({
              icon: 'info',
              content: '请点击"语音确认"按钮进行确认',
              duration: 3000,
            });
          }
        } else {
          console.log("状态已变化或正在监听,跳过自动启动");
        }
      }, delay);
      
      // 清理函数,避免组件卸载时仍然执行定时器
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, waitingForConfirmation, confirmText, voice, setListening]);
  
  // 使用useEffect监听voice.isListening状态，处理语音识别结果
  useEffect(() => {
    setListening(voice.isListening);
    
    // 当语音识别结束且有结果且不是在等待确认的状态下,处理语音识别结果
    if (!voice.isListening && voice.transcript && !waitingForConfirmation && !processing) {
      // 为防止重复处理,添加一个标记或检查对象
      const currentTranscript = voice.transcript;
      console.log("语音识别结束,处理用户输入:", currentTranscript);
      
      // 保存原始查询文本,用于后续意图分类
      setOriginalQuery(currentTranscript);
      
      // 短暂延迟确保状态已稳定
      setTimeout(() => {
        if (!processing) {
          setText(currentTranscript);
          processIntent(currentTranscript);
        }
      }, 200);
    }
  }, [voice.isListening, voice.transcript, waitingForConfirmation, processing, processIntent]);

  // 监听语音识别错误
  useEffect(() => {
    if (voice.error) {
      console.error("语音识别错误:", voice.error);
      Toast.show({
        icon: 'fail',
        content: voice.error,
        duration: 2000,
      });
    }
  }, [voice.error]);
  
  // 开始语音识别
  const startListening = async () => {
    if (!apiAvailable) {
      Toast.show({
        icon: 'fail',
        content: '您的浏览器不支持语音识别',
      });
      return;
    }
    
    // 重置状态
    setText('');
    setResult('');
    setConfirmText('');
    setCurrentToolId('');
    setCurrentParams({});
    setWaitingForConfirmation(false);
    
    // 如果已经在监听，先停止
    if (voice.isListening) {
      await voice.stopListening();
      // 短暂延迟确保完全停止
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    try {
      console.log("VoiceAIMobile: 开始语音识别...");
      setListening(true);
      voice.startListening();
    } catch (error) {
      console.error('启动语音识别失败:', error);
      setListening(false);
      Toast.show({
        icon: 'fail',
        content: '启动语音识别失败，请重试',
      });
    }
  };
  

  
  // 格式化结果用于显示
  const formatResultForDisplay = (data) => {
    if (!data) return '没有返回结果';
    
    // 处理字符串
    if (typeof data === 'string') return data;
    
    // 处理对象
    if (typeof data === 'object') {
      // 优先级处理常见的返回字段
      if (data.tts_message) return data.tts_message;
      if (data.message) return data.message;
      if (data.summary) return data.summary;
      if (data.result) return data.result;
      
      // 增强的天气数据处理
      if (data.weather || data.temperature || data.location) {
        let result = '';
        if (data.location) result += `${data.location}`;
        if (data.weather) {
          result += result ? `今天${data.weather}` : `天气：${data.weather}`;
        }
        if (data.temperature) {
          result += `，温度${data.temperature}`;
        }
        if (data.humidity) {
          result += `，湿度${data.humidity}`;
        }
        if (result) return result;
      }
      
      // 处理音乐播放器响应
      if (data.track && data.status) {
        return `正在播放：${data.track.title} - ${data.track.artist}`;
      }
      
      // 处理Dify/Coze响应
      if (data.answer) return data.answer;
      
      // 处理其他结构化数据
      try {
        return JSON.stringify(data, null, 2);
      } catch (e) {
        return '操作已完成,但无法显示详细结果';
      }
    }
    
    return '操作已完成';
  };
  
  // 格式化结果用于语音播报
  const formatResultForSpeech = (data) => {
    if (!data) return '抱歉，没有获取到结果';
    
    // 处理字符串类型
    if (typeof data === 'string') {
      // 过滤掉技术性消息，提供更友好的语音反馈
      if (data.includes('HTTP call') && data.includes('successful')) {
        return '操作已成功完成';
      }
      return data;
    }
    
    // 处理对象类型
    if (typeof data === 'object') {
      // 最优先：专门为TTS准备的字段
      if (data.tts_message) return data.tts_message;
      if (data.summary) return data.summary;
      
      // 天气数据的语音优化
      if (data.weather || data.temperature || data.location) {
        let speechText = '';
        if (data.location) speechText += `${data.location}`;
        if (data.weather) {
          speechText += speechText ? `今天${data.weather}` : `天气${data.weather}`;
        }
        if (data.temperature) {
          speechText += `，温度${data.temperature}`;
        }
        if (data.humidity) {
          speechText += `，湿度${data.humidity}`;
        }
        if (speechText) return speechText;
      }
      
      // 音乐播放器的语音反馈
      if (data.track && data.status) {
        return `已为您播放${data.track.title}，演唱者${data.track.artist}`;
      }
      
      // Dify/Coze等AI服务的回答
      if (data.answer) return data.answer;
      
      // 通用消息字段
      if (data.message) {
        // 过滤技术性消息
        if (data.message.includes('HTTP call') && data.message.includes('successful')) {
          return '操作已成功完成';
        }
        return data.message;
      }
    }
    
    // 如果没有合适的字段，使用通用格式化
    const displayResult = formatResultForDisplay(data);
    // 避免播报JSON格式的技术信息
    if (displayResult.startsWith('{') || displayResult.includes('HTTP call')) {
      return '操作已完成';
    }
    return displayResult;
  };
  
  // 添加重置会话的函数
  const resetSession = async () => {
    // 取消任何正在进行的语音
    cancel();
    
    // 如果正在监听,停止监听
    if (voice.isListening) {
      await voice.stopListening();
    }
    
    // 重置所有状态
    setText('');
    setResult('');
    setConfirmText('');
    setListening(false);
    setProcessing(false);
    setExecuting(false);
    setSpeaking(false);
    setWaitingForConfirmation(false);
    setCurrentToolId('');
    setCurrentParams({});
    
    // 生成新的会话ID
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    console.log('已重置会话,新的会话ID:', newSessionId);
    
    // 显示提示
    Toast.show({
      icon: 'success',
      content: '会话已重置',
      duration: 1500,
    });
  };
  
  // 添加测试按钮用于非语音环境
  const handleDemoText = () => {
    const demoText = "查询今天的天气";
    setText(demoText);
    processIntent(demoText);
  };

  return (
    <div className="voice-ai-container" data-theme={theme}>
      <NavBar 
        backArrow={false} 
        className="voice-ai-navbar" 
        right={
          <Button 
            size="mini" 
            onClick={() => window.location.href = isAuthenticated ? '/user' : '/auth'}
          >
            {isAuthenticated ? (user?.username || '我的') : '登录'}
          </Button>
        }
      >
        全语音 AI 助手
      </NavBar>
      
      <div className="content-area">
        {text && (
          <Card title="您的请求" className="voice-card user-request-card">
            <div className="user-text">{text}</div>
          </Card>
        )}
        
        {confirmText && (
          <Card title="确认信息" className="voice-card confirm-card">
            <div className="confirm-text">{confirmText}</div>
            {waitingForConfirmation && (
              <div className="confirm-hint">
                🎤 请说“确认”或“取消”，或点击下方“语音确认”按钮
              </div>
            )}
          </Card>
        )}
        
        {waitingForConfirmation && voice.transcript && (
          <Card title="您的回复" className="voice-card user-reply-card">
            <div className="user-text">{voice.transcript}</div>
          </Card>
        )}
        
        {result && (
          <Card title="执行结果" className="voice-card result-card">
            <div className="result-text">
              {(() => {
                try {
                  const jsonObj = JSON.parse(result);
                  // 是JSON,格式化显示
                  return (
                    <pre className="json-result">
                      {JSON.stringify(jsonObj, null, 2)}
                    </pre>
                  );
                } catch (e) {
                  // 不是JSON,按普通文本显示
                  return <p className="text-result">{result}</p>;
                }
              })()}
            </div>
          </Card>
        )}
        
        {!text && !confirmText && !result && (
          <div className="empty-state">
            <SoundOutline className="empty-icon" />
            <p className="empty-text">点击下方按钮开始语音对话</p>
          </div>
        )}
      </div>
      
      <div className="status-indicator">
        {listening && <div className="status listening">正在聆听{waitingForConfirmation ? '您的确认' : '您的指令'}...</div>}
        {processing && <div className="status processing">正在处理...</div>}
        {executing && <div className="status executing">正在执行...</div>}
        {speaking && <div className="status speaking">正在播报...</div>}
        {waitingForConfirmation && !listening && !speaking && (
          <div className="status waiting">
            请说“确认”或“取消”，或点击下方按钮
          </div>
        )}
        {!listening && !processing && !executing && !speaking && !waitingForConfirmation && (
          <div className="status idle">空闲中,等待您的指令</div>
        )}
      </div>
      
      <div className="control-area">
        <div className="button-row">
            {/* 录音按钮 - 在确认状态下也允许使用 */}
            <Button
              block
              color={waitingForConfirmation ? "success" : "primary"}
              size="large"
              loading={listening}
              disabled={processing || executing || speaking || !apiAvailable}
              onClick={listening ? () => voice.stopListening() : startListening}
              icon={<SoundOutline />}
            >
              {listening ? '停止录音' : (waitingForConfirmation ? '语音确认' : '开始录音')}
            </Button>
          
            {/* 取消/停止按钮 */}
            <Button
              block
              color="warning"
              size="large"
              disabled={!speaking && !waitingForConfirmation && !listening}
              onClick={listening ? () => voice.stopListening() : cancelSpeech}
              icon={<CloseCircleOutline />}
            >
              {listening ? '停止录音' : (speaking ? '停止播报' : '取消操作')}
            </Button>
          
            <Button
              block
              color="success"
              size="large"
              disabled={!result}
              onClick={() => {
                try {
                  const resultData = JSON.parse(result);
                  speak(formatResultForSpeech(resultData));
                } catch(e) {
                  speak(result);
                }
              }}
              icon={<AudioOutline />}
            >
              重新播报
            </Button>
        </div>
        
        {/* 添加重置按钮 */}
        {(text || result || confirmText) && (
          <Button
            block
            color="default"
            size="middle"
            onClick={resetSession}
            className="reset-button"
          >
            清除并重置会话
          </Button>
        )}
        
        {!apiAvailable && (
          <Button
            block
            color="primary"
            size="large"
            onClick={handleDemoText}
            className="demo-button"
          >
            测试功能（不用语音）
          </Button>
        )}
      </div>
      
      <div className="footer">
        Echo AI 语音助手 © 2025
      </div>
      
      <WaterMark content="Echo AI" />
      
      {/* 添加导航按钮 */}
      <div className="classic-mode-button">
        <Button 
          size="mini" 
          onClick={() => window.location.href = '/classic'}
        >
          切换到经典版
        </Button>
      </div>
      
      {/* 添加主题切换按钮 */}
      <ThemeToggle />
    </div>
  );
};

export default VoiceAIMobile; 