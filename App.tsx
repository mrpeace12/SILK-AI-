import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import MessageItem from './components/MessageItem';
import VoiceInterface from './components/VoiceInterface';
import SplashScreen from './components/SplashScreen';
import AuthModal from './components/AuthModal';
import { Message, Role, ChatSession, User } from './types';
import { streamWithModel, Part } from './services/geminiService';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [groundingMetadataMap, setGroundingMetadataMap] = useState<Record<string, any>>({});
  
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('silk-theme') === 'dark' || 
      (!localStorage.getItem('silk-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('silk-user');
    if (storedUser) setUser(JSON.parse(storedUser));
    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('silk-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('silk-theme', 'light');
    }
  }, [isDarkMode]);

  // Optimized Speech Recognition for 2026 Mobile/Termux environment
  useEffect(() => {
    if (user) {
      if (sessions.length === 0) {
        const firstSession: ChatSession = {
          id: uuidv4(),
          title: "Main Thread",
          messages: [{
            id: uuidv4(),
            role: Role.MODEL,
            text: `Greetings. SILK AI has initialized your request. Processing at maximum bandwidth... I am ready to assist with your professional projects, engineering tasks, and detailed analysis. ${user.id === 'guest' ? 'You are currently in preview mode.' : ''} How may I help you today?`,
            timestamp: new Date()
          }],
          updatedAt: new Date()
        };
        setSessions([firstSession]);
        setCurrentSessionId(firstSession.id);
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setInputText(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + finalTranscript);
          }
        };

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          if (navigator.vibrate) navigator.vibrate(20);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (navigator.vibrate) navigator.vibrate([10, 30]);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('STT Error:', event.error);
          setIsListening(false);
        };
      }
    }
  }, [user]);

  useEffect(() => scrollToBottom(), [sessions]);

  const toggleDictation = () => {
    if (!recognitionRef.current) return alert("System Calibration Error: Speech recognition module not available on this endpoint.");
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('silk-user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('silk-user');
    setSessions([]);
    setCurrentSessionId(null);
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && selectedFiles.length === 0) || !currentSessionId) return;

    if (isListening) recognitionRef.current.stop();

    const fileParts: Part[] = await Promise.all(
      selectedFiles.map(async (file) => ({
        inlineData: {
          mimeType: file.type || 'application/octet-stream',
          data: await fileToBase64(file),
        },
      }))
    );

    const userMessage: Message = {
      id: uuidv4(),
      role: Role.USER,
      text: inputText || (selectedFiles.length > 0 ? `Uploaded ${selectedFiles.length} files.` : ""),
      timestamp: new Date()
    };

    const tempInput = inputText;
    setInputText('');
    setSelectedFiles([]);

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMessage],
          updatedAt: new Date(),
          title: s.messages.length <= 1 ? (tempInput.slice(0, 30) || 'Intelligence Stream') : s.title
        };
      }
      return s;
    }));

    const aiMessageId = uuidv4();
    const aiMessage: Message = {
      id: aiMessageId,
      role: Role.MODEL,
      text: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) return { ...s, messages: [...s.messages, aiMessage] };
      return s;
    }));

    try {
      const history = currentSession?.messages.map(m => ({
        role: m.role === Role.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
      })) || [];

      let fullText = '';
      const stream = streamWithModel(tempInput || "Analysis requested.", history, fileParts);
      
      for await (const chunk of stream) {
        fullText += chunk.text || "";
        if (chunk.groundingMetadata) {
          setGroundingMetadataMap(prev => ({ ...prev, [aiMessageId]: chunk.groundingMetadata }));
        }
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map(m => m.id === aiMessageId ? { ...m, text: fullText } : m)
            };
          }
          return s;
        }));
      }

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === aiMessageId ? { ...m, isStreaming: false } : m)
          };
        }
        return s;
      }));
    } catch (error) {
      console.error(error);
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === aiMessageId ? { ...m, text: "Protocol Exception: High-latency detected. Please re-submit your directive.", isStreaming: false } : m)
          };
        }
        return s;
      }));
    }
  };

  if (showSplash) return <SplashScreen />;
  if (!user) return <AuthModal onLogin={handleLogin} />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-500">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={() => {
          const newS = { id: uuidv4(), title: "Intelligence Stream", messages: [], updatedAt: new Date() };
          setSessions([newS, ...sessions]);
          setCurrentSessionId(newS.id);
        }}
        onSelectChat={setCurrentSessionId}
        onCallAI={() => setIsCalling(true)}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        user={user}
        onLogout={handleLogout}
      />

      {isCalling && <VoiceInterface onClose={() => setIsCalling(false)} />}

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 glass flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 border-b border-slate-200/40 dark:border-slate-800/40">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg">
              <i className="fa-solid fa-bars-staggered"></i>
            </button>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-silk-500">SILK HUB</span>
              <span className="text-xs font-bold truncate max-w-[200px] text-slate-900 dark:text-white">
                {currentSession?.title || 'Session'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl silk-gradient border-2 border-white dark:border-slate-800 shadow-md overflow-hidden group cursor-pointer relative">
               <img src={user.avatar} alt="User" className="w-full h-full object-cover group-hover:opacity-30 transition-opacity" />
               <button onClick={handleLogout} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px]">
                 <i className="fa-solid fa-power-off"></i>
               </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 lg:px-16 py-8 scroll-smooth no-scrollbar">
          <div className="max-w-4xl mx-auto">
            {currentSession?.messages.map((message) => (
              <MessageItem 
                key={message.id} 
                message={message} 
                groundingMetadata={groundingMetadataMap[message.id]}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 lg:p-6 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm sticky bottom-0 z-40">
          <div className="max-w-4xl mx-auto relative">
            
            {selectedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-silk-50/80 dark:bg-silk-500/10 border border-silk-100 dark:border-silk-500/20 px-3 py-1.5 rounded-xl text-[10px] text-silk-600 dark:text-silk-400 font-bold uppercase">
                    <i className={`fa-solid ${file.type.startsWith('image/') ? 'fa-image' : 'fa-file-code'}`}></i>
                    <span className="max-w-[100px] truncate">{file.name}</span>
                    <button onClick={() => setSelectedFiles(f => f.filter((_, idx) => idx !== i))} className="hover:text-red-500">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSend} className="relative flex items-center">
              <div className="absolute left-4 z-10 flex items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-600 hover:text-silk-600 transition-colors"
                >
                  <i className="fa-solid fa-plus text-lg"></i>
                </button>
                <input type="file" ref={fileInputRef} multiple className="hidden" onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} />
              </div>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? "Listening..." : "Message SILK AI..."}
                className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] py-4 pl-14 pr-32 shadow-xl focus:ring-4 focus:ring-silk-500/5 focus:border-silk-400 outline-none transition-all text-[15px] dark:text-white ${isListening ? 'border-silk-500 ring-4 ring-silk-500/20' : ''}`}
              />
              
              <div className="absolute right-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleDictation}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-indigo-600 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'} text-lg`}></i>
                </button>

                <button
                  type="submit"
                  disabled={!inputText.trim() && selectedFiles.length === 0}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    (inputText.trim() || selectedFiles.length > 0) ? 'silk-gradient text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700'
                  }`}
                >
                  <i className="fa-solid fa-arrow-up text-lg"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;