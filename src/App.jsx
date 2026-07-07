import React, { useState, useEffect, useRef } from 'react';
import { Layers, Settings, Trash2, Plus, X, User, Cloud, Loader2, AlignLeft, CheckSquare, Tag, Clock, Target, Calendar, Edit3, Users, BarChart2, Shield, Paperclip, FileText, UploadCloud, AlertCircle, LogOut, Sun, Moon, Bell } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyYourRealKeyHere...",
  authDomain: "ombre-flow.firebaseapp.com",
  projectId: "ombre-flow",
  storageBucket: "ombre-flow.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:123456789:web:abcdefg12345"
};
const app = initializeApp(firebaseConfig);
const appId = "ombre-production"; // Or whatever you want to call your database collection path

const WORKSPACE_ID = 'ombre1';
const BOARD_COLLECTION = `board_${WORKSPACE_ID}`;
const USERS_COLLECTION = `board_${WORKSPACE_ID}_users`;

const TAG_COLORS = {
  cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]',
  fuchsia: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50 shadow-[0_0_10px_rgba(217,70,239,0.2)]',
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
  rose: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(225,29,72,0.2)]',
};

const AVATAR_COLORS = [
  'from-cyan-400 to-blue-600', 'from-fuchsia-500 to-purple-600', 
  'from-emerald-400 to-teal-600', 'from-amber-400 to-orange-600', 
  'from-rose-400 to-red-600', 'from-indigo-400 to-indigo-600'
];

const initialDataTemplate = [
  { id: 'list-1', title: 'Backlog', position: 0, wipLimit: 0, cards: [] },
  { id: 'list-2', title: 'In Progress', position: 1, wipLimit: 3, cards: [] },
  { id: 'list-3', title: 'Review', position: 2, wipLimit: 3, cards: [] },
  { id: 'list-4', title: 'Done', position: 3, wipLimit: 0, cards: [] }
];

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.4); }

  /* Light Mode Overrides */
  .light-mode.bg-\\[\\#050505\\] { background-color: #f1f5f9 !important; }
  .light-mode .bg-\\[\\#050505\\] { background-color: #f1f5f9 !important; }
  .light-mode .text-white { color: #0f172a !important; }
  .light-mode .text-slate-200 { color: #1e293b !important; }
  .light-mode .text-gray-200 { color: #334155 !important; }
  .light-mode .text-gray-300 { color: #475569 !important; }
  .light-mode .text-gray-400 { color: #64748b !important; }
  .light-mode .text-gray-500 { color: #94a3b8 !important; }
  
  .light-mode .bg-white\\/\\[0\\.01\\], .light-mode .bg-white\\/\\[0\\.02\\], .light-mode .bg-white\\/\\[0\\.03\\], .light-mode .bg-white\\/\\[0\\.04\\] { background-color: rgba(255, 255, 255, 0.7) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.03) !important; border-color: rgba(0,0,0,0.08) !important; }
  .light-mode .bg-\\[\\#0a0a0a\\], .light-mode .bg-\\[\\#0a0a0a\\]\\/60, .light-mode .bg-\\[\\#0a0a0a\\]\\/80, .light-mode .bg-\\[\\#0a0a0a\\]\\/90, .light-mode .bg-\\[\\#0f0f13\\], .light-mode .bg-\\[\\#1a1a1f\\] { background-color: #ffffff !important; border-color: rgba(0,0,0,0.08) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.03) !important; }
  .light-mode .border-white\\/5, .light-mode .border-white\\/10, .light-mode .border-white\\/20 { border-color: rgba(0,0,0,0.1) !important; }
  .light-mode .hover\\:bg-white\\/5:hover, .light-mode .hover\\:bg-white\\/10:hover { background-color: rgba(0,0,0,0.05) !important; color: #0f172a !important; }
  .light-mode .bg-black\\/40, .light-mode .bg-black\\/50, .light-mode .bg-black\\/60, .light-mode .bg-black\\/80 { background-color: #f8fafc !important; border-color: rgba(0,0,0,0.05) !important; color: #334155 !important;}
  
  .light-mode input, .light-mode textarea { color: #0f172a !important; background-color: #f8fafc !important; border-color: rgba(0,0,0,0.1) !important;}
  .light-mode input:focus, .light-mode textarea:focus { background-color: #ffffff !important; border-color: #0ea5e9 !important; box-shadow: 0 0 0 1px #0ea5e9 !important; }
  
  .light-mode .bg-cyan-500\\/10 { background-color: #e0f2fe !important; border-color: #bae6fd !important; color: #0284c7 !important; }
  .light-mode .from-slate-900\\/40 { --tw-gradient-from: rgba(255,255,255,0.8); }
  .light-mode .opacity-60 { opacity: 0.1 !important; }
`;

const Background = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050505]">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#050505] to-[#050505]"></div>
    <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px]"></div>
    <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-400/5 blur-[150px]"></div>
    <div className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-indigo-500/5 blur-[100px]"></div>
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-60 transition-opacity duration-500"></div>
  </div>
);

const LoginGateway = ({ onLogin, allUsers, createAdmin }) => {
    const [isSetup, setIsSetup] = useState(allUsers.length === 0);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setIsSetup(allUsers.length === 0);
    }, [allUsers]);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        if (isSetup) {
            if (!username || !password) { setError('Please fill all fields'); return; }
            createAdmin(username, password);
        } else {
            const user = allUsers.find(u => u.username === username && u.password === password);
            if (user) {
                onLogin(user);
            } else {
                setError('Invalid username or password');
            }
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-[#050505] text-slate-200 relative overflow-hidden">
            <Background />
            <div className="relative z-10 w-full max-w-md p-8 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold tracking-widest text-white mb-2">
                        OMBRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">FLOW</span>
                    </h1>
                    <p className="text-sm text-gray-400">{isSetup ? 'Setup Workspace Admin' : 'Sign in to Workspace OMBRE1'}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="w-4 h-4 text-gray-500" /></div>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#0a0a0a]/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder-gray-600" placeholder="Enter username" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Shield className="w-4 h-4 text-gray-500" /></div>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0a0a0a]/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder-gray-600" placeholder="Enter password" />
                        </div>
                    </div>

                    {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl py-3 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-2 mt-6">
                        {isSetup ? 'Create Admin Account' : 'Enter Workspace'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const Header = ({ currentUser, currentView, setView, onLogout, isLightMode, setIsLightMode, notifications = [] }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const myNotifs = notifications.filter(n => n.targetUserId === currentUser?.id || n.targetUserId === null);
  const unreadCount = myNotifs.filter(n => !n.read).length;

  return (
    <header className="relative z-10 h-16 border-b border-white/5 bg-white/[0.01] backdrop-blur-2xl flex items-center px-6 justify-between shrink-0 shadow-lg transition-colors duration-500">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-extrabold tracking-widest text-white">
          OMBRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">FLOW</span>
        </h1>
        
        <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
          <button onClick={() => setView('board')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'board' ? 'bg-white/10 text-cyan-400 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Layers className="w-4 h-4" /> Board
          </button>
          <button onClick={() => setView('dashboard')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-white/10 text-cyan-400 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <BarChart2 className="w-4 h-4" /> Workload
          </button>
          {currentUser?.role === 'admin' && (
            <button onClick={() => setView('team')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'team' ? 'bg-white/10 text-cyan-400 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Shield className="w-4 h-4" /> Team
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Light/Dark Toggle */}
        <button onClick={() => setIsLightMode(!isLightMode)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
           {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
           <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#050505]"></span>}
           </button>
           {showNotifs && (
               <div className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                   <div className="p-3 border-b border-white/10 bg-white/5">
                       <h3 className="text-sm font-bold text-white">Notifications</h3>
                   </div>
                   <div className="max-h-64 overflow-y-auto custom-scrollbar">
                       {myNotifs.length === 0 ? (
                           <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                       ) : (
                           myNotifs.map(n => (
                               <div key={n.id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                                   <p className="text-xs font-bold text-cyan-400 mb-1">{n.title}</p>
                                   <p className="text-xs text-gray-300">{n.message}</p>
                                   <p className="text-[10px] text-gray-500 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                               </div>
                           ))
                       )}
                   </div>
               </div>
           )}
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-white/10">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${currentUser.avatarColor} flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-200 hidden md:block">{currentUser.name}</span>
          <button onClick={onLogout} className="ml-2 p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

const CardModal = ({ cardId, listId, data, allUsers, currentUser, updateListInCloud, onClose, createNotification }) => {
    const list = data.find(l => l.id === listId);
    const card = list?.cards.find(c => c.id === cardId);
    
    if (!card) return null;

    const [desc, setDesc] = useState(card.description || '');
    const [showAssignees, setShowAssignees] = useState(false);

    const updateCard = (updates) => {
        const updatedCards = list.cards.map(c => c.id === cardId ? { ...c, ...updates } : c);
        updateListInCloud({ ...list, cards: updatedCards });
    };

    const toggleAssignee = (userId) => {
        let newAssignees = card.assignees || [];
        if (newAssignees.includes(userId)) {
            newAssignees = newAssignees.filter(id => id !== userId);
        } else {
            newAssignees = [...newAssignees, userId];
            // Trigger assignment notification
            createNotification('assign', 'New Task Assigned', `You have been assigned to task: "${card.content}"`, userId);
        }
        updateCard({ assignees: newAssignees });
    };

    const handleFileUploadSafe = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        if(file.size > 500 * 1024) { 
           console.error("File must be under 500KB for Ombre Flow cloud sync.");
           // Silently ignore or implement soft UI feedback in the future
           return; 
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const newAttachments = [...(card.attachments || []), { name: file.name, data: event.target.result, type: file.type }];
            updateCard({ attachments: newAttachments });
        };
        reader.readAsDataURL(file);
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3 text-white">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-lg font-bold">{card.content}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="relative">
                            <button onClick={() => setShowAssignees(!showAssignees)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-gray-200 transition-colors">
                                <Users className="w-4 h-4" /> Assignees {(card.assignees || []).length > 0 && <span className="bg-cyan-500/20 text-cyan-400 px-1.5 rounded-md text-xs">{card.assignees.length}</span>}
                            </button>
                            {showAssignees && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-[#0f0f13] border border-white/10 rounded-xl shadow-xl z-20 p-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase px-2 py-1 mb-1">Team Members</p>
                                    {allUsers.map(user => (
                                        <button key={user.id} onClick={() => toggleAssignee(user.id)} className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors group">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${user.avatarColor} flex items-center justify-center text-[10px] font-bold text-white`}>{user.name.charAt(0).toUpperCase()}</div>
                                                <span className="text-sm text-gray-300 group-hover:text-white">{user.name}</span>
                                            </div>
                                            {(card.assignees || []).includes(user.id) && <CheckSquare className="w-4 h-4 text-cyan-400" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <label className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-gray-200 transition-colors cursor-pointer">
                            <Paperclip className="w-4 h-4" /> Attach File
                            <input type="file" className="hidden" onChange={handleFileUploadSafe} />
                        </label>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2"><AlignLeft className="w-4 h-4" /> Description</h3>
                        <textarea 
                            value={desc} onChange={e => setDesc(e.target.value)} onBlur={() => updateCard({ description: desc })}
                            placeholder="Add a more detailed description..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-gray-200 min-h-[100px] focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all custom-scrollbar resize-y"
                        />
                    </div>

                    {(card.attachments || []).length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2"><Paperclip className="w-4 h-4" /> Attachments</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {card.attachments.map((att, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 overflow-hidden group">
                                        <div className="w-10 h-10 rounded-lg bg-[#050505] flex items-center justify-center shrink-0">
                                            {att.type.startsWith('image/') ? <img src={att.data} alt="attachment" className="w-full h-full object-cover rounded-lg" /> : <FileText className="w-5 h-5 text-gray-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-200 truncate">{att.name}</p>
                                        </div>
                                        <button onClick={() => updateCard({ attachments: card.attachments.filter((_, idx) => idx !== i) })} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-md transition-all shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Card = ({ card, index, listId, allUsers, onDragStart, onDragOver, onDrop, onDragEnd, deleteCard, dragInfo, openCardDetails }) => {
  const isDragging = dragInfo.dragged?.listId === listId && dragInfo.dragged?.cardIndex === index;
  const isDropTarget = dragInfo.target?.listId === listId && dragInfo.target?.cardIndex === index;
  const hasAttachments = card.attachments?.length > 0;

  return (
    <React.Fragment>
      {isDropTarget && <div className="h-1.5 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full my-1.5 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all" />}
      <div
        draggable onDragStart={(e) => onDragStart(e, listId, index)} onDragOver={(e) => onDragOver(e, listId, index)}
        onDrop={(e) => onDrop(e, listId, index)} onDragEnd={onDragEnd} onClick={() => openCardDetails(listId, card.id)}
        className={`group bg-[#0a0a0a]/90 backdrop-blur-md border border-white/5 p-3.5 rounded-xl hover:border-cyan-500/40 hover:shadow-[0_4px_20px_rgba(34,211,238,0.15)] transition-all cursor-grab active:cursor-grabbing relative flex flex-col gap-2 ${isDragging ? 'opacity-30 scale-[0.98]' : 'opacity-100'}`}
      >
        <div className="flex justify-between items-start gap-3">
            <p className="text-sm text-gray-200 leading-snug font-medium break-words flex-1">{card.content}</p>
            <button onClick={(e) => { e.stopPropagation(); deleteCard(listId, card.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 bg-black/60 border border-white/5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0 mt-[-4px] mr-[-4px]">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>

        {/* Footer Badges & Avatars */}
        <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-3 text-gray-500 text-xs font-medium">
                {card.description && <AlignLeft className="w-3.5 h-3.5" />}
                {hasAttachments && <Paperclip className="w-3.5 h-3.5 text-cyan-500/70" />}
            </div>
            
            {/* Avatars */}
            {card.assignees?.length > 0 && (
                <div className="flex items-center -space-x-2">
                    {card.assignees.slice(0, 3).map(userId => {
                        const user = allUsers.find(u => u.id === userId);
                        if(!user) return null;
                        return (
                            <div key={user.id} title={user.name} className={`w-6 h-6 rounded-full border border-[#0a0a0a] bg-gradient-to-tr ${user.avatarColor} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )
                    })}
                    {card.assignees.length > 3 && (
                        <div className="w-6 h-6 rounded-full border border-[#0a0a0a] bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-300">
                            +{card.assignees.length - 3}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </React.Fragment>
  );
};

const List = ({ list, updateListInCloud, deleteListFromCloud, allUsers, dndHandlers, dragInfo, openCardDetails }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCardText, setNewCardText] = useState('');
  
  const handleAdd = () => {
    if (!newCardText.trim()) return;
    const newCard = { id: `card-${Date.now()}`, content: newCardText, assignees: [], attachments: [], checklist: [] };
    updateListInCloud({ ...list, cards: [...list.cards, newCard] });
    setNewCardText(''); setIsAdding(false);
  };

  const deleteCard = (listId, cardId) => updateListInCloud({ ...list, cards: list.cards.filter(c => c.id !== cardId) });
  const isOverWip = list.wipLimit > 0 && list.cards.length > list.wipLimit;
  
  const borderClass = isOverWip ? 'border-orange-500/60 shadow-[0_0_25px_rgba(249,115,22,0.15)]' : 'border-white/[0.08]';
  const headerGlow = isOverWip ? 'bg-gradient-to-r from-transparent via-orange-500/30 to-transparent' : 'bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent';

  return (
    <div className={`w-[340px] shrink-0 bg-white/[0.02] bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl border rounded-2xl flex flex-col max-h-full relative overflow-hidden group/list transition-all duration-500 ${borderClass}`}>
      <div className={`absolute top-0 left-0 right-0 h-[1px] pointer-events-none transition-colors duration-500 ${headerGlow}`}></div>
      
      <div className="p-4 flex items-center justify-between transition-colors rounded-t-2xl border-b border-white/5 mb-2">
        <div className="flex items-center flex-1">
            <h3 className="bg-transparent text-white font-semibold tracking-wide text-base">{list.title}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 ${isOverWip ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white/10 text-gray-400'}`}>
                {list.cards.length}{list.wipLimit > 0 ? `/${list.wipLimit}` : ''}
            </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-3 custom-scrollbar min-h-[60px]"
        onDragOver={(e) => { e.preventDefault(); if (e.target === e.currentTarget) dndHandlers.onDragOver(e, list.id, list.cards.length); }}
        onDrop={(e) => { e.preventDefault(); if (e.target === e.currentTarget) dndHandlers.onDrop(e, list.id, list.cards.length); }}
      >
        {list.cards.map((card, index) => (
          <Card key={card.id} card={card} index={index} listId={list.id} allUsers={allUsers} deleteCard={deleteCard} openCardDetails={openCardDetails} dragInfo={dragInfo} {...dndHandlers} />
        ))}
        {dragInfo.target?.listId === list.id && dragInfo.target?.cardIndex === list.cards.length && list.cards.length > 0 && (
             <div className="h-1.5 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full my-1.5 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
        )}
      </div>

      <div className="p-3 pt-2" onDragOver={(e) => { e.preventDefault(); dndHandlers.onDragOver(e, list.id, list.cards.length); }} onDrop={(e) => { e.preventDefault(); dndHandlers.onDrop(e, list.id, list.cards.length); }}>
        {isAdding ? (
          <div className="bg-[#0a0a0a]/60 p-3 rounded-xl border border-white/10 backdrop-blur-md">
            <textarea autoFocus className="w-full bg-transparent text-sm text-gray-200 focus:outline-none resize-none min-h-[60px] placeholder-gray-500 custom-scrollbar" placeholder="What needs to be done?" value={newCardText} onChange={(e) => setNewCardText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); } }} />
            <div className="flex items-center justify-end gap-2 mt-3">
              <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">Cancel</button>
              <button onClick={handleAdd} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]">Add Task</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAdding(true)} className="w-full py-2.5 px-3 flex items-center gap-2 text-gray-400 hover:text-cyan-400 hover:bg-white/[0.04] rounded-xl transition-all text-sm font-medium group border border-transparent hover:border-cyan-500/20">
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" /> Add a task
          </button>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ data, allUsers }) => {
    return (
        <div className="animate-in fade-in duration-300 w-full max-w-6xl mx-auto pb-10">
            <h2 className="text-2xl font-bold text-white mb-6">Team Workload Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allUsers.map(user => {
                    let totalTasks = 0;
                    const tasksByList = {};
                    
                    data.forEach(list => {
                        tasksByList[list.title] = 0;
                        list.cards.forEach(card => {
                            if (card.assignees?.includes(user.id)) {
                                totalTasks++;
                                tasksByList[list.title]++;
                            }
                        });
                    });

                    return (
                        <div key={user.id} className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl flex flex-col gap-4">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${user.avatarColor} flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{user.name}</h3>
                                    <p className="text-sm text-cyan-400">{totalTasks} Total Tasks</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(tasksByList).map(([listName, count]) => (
                                    <div key={listName} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">{listName}</span>
                                        <span className="text-white font-medium bg-white/5 px-2 py-0.5 rounded-md">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const TeamManager = ({ allUsers, updateUsersInCloud }) => {
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newName, setNewName] = useState('');

    const handleCreateUser = () => {
        if (!newUsername || !newPassword || !newName) return;
        const newUser = {
            id: `user-${Date.now()}`,
            username: newUsername.trim(),
            password: newPassword.trim(),
            name: newName.trim(),
            role: 'user',
            avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
        };
        updateUsersInCloud(newUser);
        setNewUsername(''); setNewPassword(''); setNewName('');
    };

    return (
        <div className="animate-in fade-in duration-300 w-full max-w-4xl mx-auto space-y-8 pb-10">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Team Management</h2>
                <p className="text-gray-400 text-sm">Create and manage access for your team members in the Ombre1 Workspace.</p>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Add New Member</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input className="bg-[#0a0a0a]/80 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder-gray-600" placeholder="Full Name" value={newName} onChange={e => setNewName(e.target.value)} />
                    <input className="bg-[#0a0a0a]/80 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder-gray-600" placeholder="Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                    <input className="bg-[#0a0a0a]/80 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder-gray-600" placeholder="Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <button onClick={handleCreateUser} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl p-3 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" /> Add User
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allUsers.map(user => (
                    <div key={user.id} className="bg-white/[0.02] border border-white/10 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${user.avatarColor} flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-white font-semibold flex items-center gap-2">
                                    {user.name} 
                                    {user.role === 'admin' && <Shield className="w-3 h-3 text-cyan-400" />}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">Username: <span className="text-gray-400">{user.username}</span></p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); 
  const [allUsers, setAllUsers] = useState([]);
  
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('board'); 
  
  const [dragInfo, setDragInfo] = useState({ dragged: null, target: null });
  const [activeCardData, setActiveCardData] = useState(null);

  const [isLightMode, setIsLightMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const seeded = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setFirebaseUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    
    const usersRef = collection(db, 'artifacts', appId, 'public', 'data', USERS_COLLECTION);
    const unsubUsers = onSnapshot(usersRef, (snapshot) => {
        const fetchedUsers = snapshot.docs.map(doc => ({ ...doc.data() }));
        setAllUsers(fetchedUsers);
    }, (err) => console.error(err));

    const boardRef = collection(db, 'artifacts', appId, 'public', 'data', BOARD_COLLECTION);
    const unsubBoard = onSnapshot(boardRef, async (snapshot) => {
      const fetchedLists = snapshot.docs.map(doc => ({ ...doc.data() }));
      
      if (fetchedLists.length === 0 && !seeded.current) {
         seeded.current = true;
         for (let i = 0; i < initialDataTemplate.length; i++) {
            await setDoc(doc(boardRef, initialDataTemplate[i].id), initialDataTemplate[i]);
         }
         return; 
      }
      
      fetchedLists.sort((a, b) => a.position - b.position);
      setData(fetchedLists);
      setIsLoading(false);
    }, (error) => {
      console.error(error);
      setIsLoading(false);
    });

    const notifRef = collection(db, 'artifacts', appId, 'public', 'data', 'board_ombre1_notifications');
    const unsubNotif = onSnapshot(notifRef, (snapshot) => {
        const fetchedNotifs = snapshot.docs.map(doc => ({ ...doc.data() })).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(fetchedNotifs);
    }, (err) => console.error(err));
    
    return () => { unsubUsers(); unsubBoard(); unsubNotif(); };
  }, [firebaseUser]);

  const updateUsersInCloud = async (newUser) => {
      if (!firebaseUser || currentUser?.role !== 'admin') return;
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', USERS_COLLECTION, newUser.id);
      await setDoc(userRef, newUser);
  };

  const createAdmin = async (username, password) => {
      if (!firebaseUser) return;
      const adminUser = {
          id: `user-${Date.now()}`,
          username, password, name: 'Workspace Admin',
          role: 'admin', avatarColor: AVATAR_COLORS[0]
      };
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', USERS_COLLECTION, adminUser.id);
      await setDoc(userRef, adminUser);
      setCurrentUser(adminUser); 
  };

  const updateListInCloud = async (updatedList) => {
    if (!firebaseUser || !currentUser) return;
    setData(prev => prev.map(l => l.id === updatedList.id ? updatedList : l));
    const listRef = doc(db, 'artifacts', appId, 'public', 'data', BOARD_COLLECTION, updatedList.id);
    await setDoc(listRef, updatedList);
  };

  const createNotification = async (type, title, message, targetUserId) => {
      if (!firebaseUser) return;
      const notif = {
          id: `notif-${Date.now()}`, type, title, message, targetUserId,
          read: false, timestamp: new Date().toISOString()
      };
      const notifRef = doc(db, 'artifacts', appId, 'public', 'data', 'board_ombre1_notifications', notif.id);
      await setDoc(notifRef, notif);
  };

  const onDragStart = (e, listId, cardIndex) => { e.stopPropagation(); setDragInfo({ dragged: { listId, cardIndex }, target: null }); };
  const onDragOver = (e, listId, cardIndex) => {
    e.preventDefault(); e.stopPropagation();
    if (dragInfo.target?.listId !== listId || dragInfo.target?.cardIndex !== cardIndex) setDragInfo(prev => ({ ...prev, target: { listId, cardIndex } }));
  };

  const onDrop = async (e, targetListId, targetCardIndex) => {
    e.preventDefault(); e.stopPropagation();
    const { dragged, target } = dragInfo;
    if (!dragged || !firebaseUser) return;

    if (dragged.listId === targetListId && dragged.cardIndex === targetCardIndex) {
      setDragInfo({ dragged: null, target: null }); return;
    }

    const newData = JSON.parse(JSON.stringify(data)); 
    const sourceList = newData.find(l => l.id === dragged.listId);
    const targetList = newData.find(l => l.id === targetListId);
    
    const [movedCard] = sourceList.cards.splice(dragged.cardIndex, 1);

    if (dragged.listId === targetListId) {
       let insertIndex = targetCardIndex;
       if (dragged.cardIndex < targetCardIndex) insertIndex = targetCardIndex - 1;
       sourceList.cards.splice(insertIndex, 0, movedCard);
       await updateListInCloud(sourceList);
    } else {
       targetList.cards.splice(targetCardIndex, 0, movedCard);
       setData(newData); 
       
       const listsRef = collection(db, 'artifacts', appId, 'public', 'data', BOARD_COLLECTION);
       await setDoc(doc(listsRef, sourceList.id), sourceList);
       await setDoc(doc(listsRef, targetList.id), targetList);

       if (targetList.title.toLowerCase().includes('done')) {
           createNotification('done', 'Task Completed', `Task "${movedCard.content}" was moved to Done.`, null);
       }
    }
    setDragInfo({ dragged: null, target: null });
  };
  const onDragEnd = () => setDragInfo({ dragged: null, target: null });

  if (!firebaseUser || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050505] text-cyan-400">
         <Background />
         <div className="relative z-10 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-gray-400 font-medium tracking-wide">Initializing Workspace...</p>
         </div>
      </div>
    );
  }

  if (!currentUser) return <LoginGateway onLogin={setCurrentUser} allUsers={allUsers} createAdmin={createAdmin} />;

  return (
    <div className={`h-screen flex flex-col overflow-hidden font-sans relative text-slate-200 transition-colors duration-500 ${isLightMode ? 'light-mode bg-[#f4f7fb]' : 'bg-[#050505]'}`}>
      <style>{scrollbarStyles}</style>
      <Background />
      <Header currentUser={currentUser} currentView={currentView} setView={setCurrentView} onLogout={() => setCurrentUser(null)} isLightMode={isLightMode} setIsLightMode={setIsLightMode} notifications={notifications} />

      <main className="relative z-10 flex-1 overflow-x-auto overflow-y-auto p-8 custom-scrollbar">
        {currentView === 'board' && (
            <div className="flex gap-6 h-full items-start pb-4 w-max animate-in fade-in duration-300">
            {data.map(list => (
                <List 
                key={list.id} list={list} allUsers={allUsers}
                updateListInCloud={updateListInCloud}
                dndHandlers={{ onDragStart, onDragOver, onDrop, onDragEnd }} dragInfo={dragInfo} 
                openCardDetails={(listId, cardId) => setActiveCardData({ listId, cardId })}
                />
            ))}
            </div>
        )}

        {currentView === 'dashboard' && <Dashboard data={data} allUsers={allUsers} />}
        {currentView === 'team' && currentUser.role === 'admin' && <TeamManager allUsers={allUsers} updateUsersInCloud={updateUsersInCloud} />}
      </main>

      {activeCardData && (
         <CardModal 
           cardId={activeCardData.cardId} listId={activeCardData.listId} 
           data={data} allUsers={allUsers} currentUser={currentUser}
           updateListInCloud={updateListInCloud} onClose={() => setActiveCardData(null)}
           createNotification={createNotification}
         />
      )}
    </div>
  );
}