
import React, { useState, useMemo } from 'react';
import { User } from '../types';

interface AuthModalProps {
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Unshakable Password Validation Logic (INIS 2026 Standard)
  const validation = useMemo(() => ({
    length: password.length >= 14,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  }), [password]);

  const strength = Object.values(validation).filter(Boolean).length;
  const isUnshakable = strength === 5;
  const strengthColor = strength === 5 ? 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]' : strength >= 3 ? 'bg-yellow-500' : 'bg-rose-500';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !isUnshakable) return;
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0],
      email: email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
    onLogin(user);
  };

  const handleSkip = () => {
    const guestUser: User = {
      id: 'guest',
      name: 'Guest Explorer',
      email: 'guest@silk.ai',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
    };
    onLogin(guestUser);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl transition-all duration-500">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 silk-gradient rounded-2xl flex items-center justify-center shadow-xl animate-float">
              <i className="fa-solid fa-feather-pointed text-white text-2xl"></i>
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-center mb-2 dark:text-white tracking-tighter uppercase italic">
            {isLogin ? 'Access Portal' : 'Initialize Identity'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-[10px] uppercase font-black tracking-widest">
            Secured by INIS Encryption v2.0
          </p>
          
          <div className="space-y-6">
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white dark:bg-slate-800 text-silk-600 shadow-sm' : 'text-slate-400'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-silk-500">
                      <i className="fa-solid fa-user-tag text-sm"></i>
                    </span>
                    <input 
                      type="text" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-14 pr-4 outline-none focus:ring-2 focus:ring-silk-500/20 focus:border-silk-500 transition-all dark:text-white text-sm"
                      placeholder="Operator Name"
                    />
                  </div>
                </div>
              )}
              
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-silk-500">
                  <i className="fa-solid fa-envelope text-sm"></i>
                </span>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-14 pr-4 outline-none focus:ring-2 focus:ring-silk-500/20 focus:border-silk-500 transition-all dark:text-white text-sm"
                  placeholder="Email Address"
                />
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-silk-500">
                    <i className="fa-solid fa-lock text-sm"></i>
                  </span>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-14 pr-4 outline-none focus:ring-2 focus:ring-silk-500/20 focus:border-silk-500 transition-all dark:text-white text-sm"
                    placeholder="Password"
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Password Integrity</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${isUnshakable ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isUnshakable ? 'UNSHAKABLE' : 'STRENGTHENING...'}
                      </span>
                    </div>
                    <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${strengthColor}`} style={{ width: `${(strength / 5) * 100}%` }}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries({
                        '14+ Chars': validation.length,
                        'Uppercase': validation.hasUpper,
                        'Lowercase': validation.hasLower,
                        'Numerical': validation.hasNumber,
                        'Symbols': validation.hasSymbol,
                      }).map(([key, valid]) => (
                        <div key={key} className={`flex items-center gap-2 text-[7px] font-black uppercase tracking-widest ${valid ? 'text-indigo-500' : 'text-slate-600'}`}>
                          <div className={`w-1 h-1 rounded-full ${valid ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]' : 'bg-slate-800'}`}></div>
                          {key}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                type="submit"
                disabled={!isLogin && !isUnshakable}
                className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all mt-4 flex items-center justify-center gap-3 ${isLogin ? 'silk-gradient text-white hover:opacity-90' : 'bg-indigo-600 text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-indigo-700'}`}
              >
                {isLogin ? 'Establish Link' : 'Secure Identity'}
              </button>
            </form>
          </div>
          
          <div className="mt-8 flex flex-col items-center gap-4">
            <button 
              onClick={handleSkip}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors py-2"
            >
              Preview Interface as Guest
            </button>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-6 text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">
        © 2026 INIS QUANTUM ALPHA • ALL RIGHTS RESERVED
      </div>
    </div>
  );
};

export default AuthModal;
