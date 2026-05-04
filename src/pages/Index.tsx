import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { api, User, Chat, Message } from "@/lib/api";

const TABS = [
  { id: "chats", label: "Чаты", icon: "MessageCircle" },
  { id: "contacts", label: "Контакты", icon: "Users" },
  { id: "groups", label: "Группы", icon: "UsersRound" },
  { id: "network", label: "P2P Сеть", icon: "Network" },
  { id: "profile", label: "Профиль", icon: "UserCircle" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

const REACTIONS_LIST = ["❤️", "😂", "🔥", "👍", "😮", "😢"];
const MY_NODE_ID = "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6);

// ===== AUTH SCREEN =====
function AuthScreen({ onAuth }: { onAuth: (user: User, token: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    const res = mode === "login"
      ? await api.auth.login(username, password)
      : await api.auth.register(username, displayName, password);
    setLoading(false);
    if (!res.ok || !res.data.token || !res.data.user) {
      setError(res.data.error || "Ошибка");
      return;
    }
    localStorage.setItem("nx_token", res.data.token);
    localStorage.setItem("nx_user", JSON.stringify(res.data.user));
    onAuth(res.data.user, res.data.token);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />
      </div>
      <div className="w-full max-w-sm mx-4 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/40">
            <span className="text-white font-bold text-2xl font-mono">N</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text">NexChat</h1>
          <p className="text-sm text-muted-foreground mt-1">Децентрализованный мессенджер</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6">
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? "gradient-btn text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}>
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Логин</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="username"
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-500/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {mode === "register" && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Имя</label>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-500/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="••••••••"
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-500/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button onClick={submit} disabled={loading}
              className="w-full gradient-btn text-white py-2.5 rounded-xl font-medium text-sm mt-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/30">
              {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          <Icon name="Lock" size={11} className="text-green-400" />
          <p className="text-xs text-muted-foreground">E2E шифрование · P2P · без сервера</p>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN APP =====
export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("chats");

  // Chats state
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showReactions, setShowReactions] = useState<number | null>(null);

  // Contacts state
  const [contacts, setContacts] = useState<User[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Call state
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState<"voice" | "video">("voice");

  // Network
  const [peerCount, setPeerCount] = useState(5);
  const [netTraffic, setNetTraffic] = useState({ up: 1.2, down: 3.4 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  // Check auth on load
  useEffect(() => {
    const savedUser = localStorage.getItem("nx_user");
    const savedToken = localStorage.getItem("nx_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setAuthChecked(true);
  }, []);

  // Network ping animation
  useEffect(() => {
    const t = setInterval(() => {
      setPeerCount(p => Math.max(3, Math.min(12, p + (Math.random() > 0.5 ? 1 : -1))));
      setNetTraffic({ up: +(Math.random() * 3).toFixed(1), down: +(Math.random() * 6).toFixed(1) });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // Load chats when user is set
  const loadChats = useCallback(async () => {
    if (!user) return;
    setLoadingChats(true);
    const list = await api.chats.list();
    setChats(list);
    setLoadingChats(false);
  }, [user]);

  useEffect(() => {
    if (user) loadChats();
  }, [user, loadChats]);

  // Load messages for active chat + polling
  const loadMessages = useCallback(async (chatId: number) => {
    setLoadingMsgs(true);
    const msgs = await api.chats.messages(chatId);
    setMessages(msgs);
    setLoadingMsgs(false);
  }, []);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeChatId) return;
    loadMessages(activeChatId);
    pollRef.current = setInterval(() => loadMessages(activeChatId), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeChatId, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load contacts
  useEffect(() => {
    if (activeTab === "contacts" || activeTab === "chats") {
      setLoadingContacts(true);
      api.chats.getUsers(contactSearch).then(users => {
        setContacts(users.filter(u => u.id !== user?.id));
        setLoadingContacts(false);
      });
    }
  }, [activeTab, contactSearch, user]);

  const sendMessage = async () => {
    if (!msgInput.trim() || !activeChatId || sending) return;
    const text = msgInput.trim();
    setMsgInput("");
    setSending(true);
    await api.chats.send(activeChatId, text);
    await loadMessages(activeChatId);
    await loadChats();
    setSending(false);
  };

  const openChat = async (otherUserId: number) => {
    const chatId = await api.chats.create(otherUserId);
    await loadChats();
    setActiveChatId(chatId);
    setActiveTab("chats");
  };

  const addReaction = async (msgId: number, emoji: string) => {
    await api.chats.react(msgId, emoji);
    if (activeChatId) await loadMessages(activeChatId);
    setShowReactions(null);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (ts: string | null) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return formatTime(ts);
    return d.toLocaleDateString("ru", { day: "numeric", month: "short" });
  };

  if (!authChecked) return null;
  if (!user) return <AuthScreen onAuth={(u, t) => { localStorage.setItem("nx_token", t); setUser(u); }} />;

  const getChatName = (chat: Chat) => chat.is_group ? (chat.name || "Группа") : (chat.other_user?.display_name || "Чат");
  const getChatInitials = (chat: Chat) => chat.is_group ? (chat.name?.slice(0, 2).toUpperCase() || "ГР") : (chat.other_user?.avatar_initials || "??");
  const getChatColor = (chat: Chat) => chat.is_group ? chat.avatar_color : (chat.other_user?.avatar_color || "#a855f7");

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-16 flex flex-col items-center py-4 gap-1 border-r border-border glass z-10 relative">
        <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 relative">
          <span className="text-white font-bold text-sm font-mono">N</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-pulse" />
        </div>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} title={tab.label}
            className={`w-11 h-11 rounded-xl flex items-center justify-center relative transition-all duration-200 group
              ${activeTab === tab.id ? "bg-purple-500/20 text-purple-400" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
            <Icon name={tab.icon} size={20} />
            {tab.id === "network" && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-400 rounded-full border border-background animate-pulse" />}
            <span className="absolute left-14 bg-card border border-border text-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              {tab.label}
            </span>
          </button>
        ))}
        <div className="mt-auto flex flex-col items-center gap-1">
          <div className="w-11 h-px bg-border" />
          <div className="flex flex-col items-center gap-0.5 py-2" title={`${peerCount} пиров`}>
            <div className="flex gap-0.5 items-end">
              {[...Array(Math.min(peerCount, 5))].map((_, i) => (
                <div key={i} className="w-1 rounded-full bg-green-400" style={{ height: `${8 + i * 3}px` }} />
              ))}
            </div>
            <span className="text-[9px] text-green-400 font-mono">{peerCount}P</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-w-0">

        {/* ===== CHATS ===== */}
        {activeTab === "chats" && (
          <>
            <div className="w-72 flex flex-col border-r border-border flex-shrink-0">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-lg font-bold gradient-text">Чаты</h1>
                  <button onClick={loadChats} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-purple-400 transition-colors">
                    <Icon name="RefreshCw" size={15} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loadingChats && (
                  <div className="flex items-center justify-center py-8">
                    <Icon name="Loader2" size={20} className="text-purple-400 animate-spin" />
                  </div>
                )}
                {!loadingChats && chats.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <Icon name="MessageCirclePlus" size={32} className="text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">Нет чатов</p>
                    <p className="text-xs text-muted-foreground mt-1">Перейдите в «Контакты» чтобы начать диалог</p>
                  </div>
                )}
                {chats.map(chat => (
                  <button key={chat.id} onClick={() => setActiveChatId(chat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 transition-colors text-left
                      ${activeChatId === chat.id ? "bg-purple-500/10" : "hover:bg-secondary/50"}`}>
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: getChatColor(chat) }}>
                        {getChatInitials(chat)}
                      </div>
                      {!chat.is_group && chat.other_user?.is_online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold truncate">{getChatName(chat)}</span>
                        <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-1">{formatDate(chat.last_time)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.last_msg || "Нет сообщений"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat view */}
            {activeChat ? (
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border glass">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: getChatColor(activeChat) }}>
                      {getChatInitials(activeChat)}
                    </div>
                    {!activeChat.is_group && activeChat.other_user?.is_online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{getChatName(activeChat)}</p>
                    <p className="text-xs text-green-400">
                      {!activeChat.is_group && activeChat.other_user?.is_online ? "P2P · В сети" : "Не в сети"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setCallType("voice"); setCallActive(true); }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-green-400 hover:bg-green-400/10 transition-colors">
                      <Icon name="Phone" size={18} />
                    </button>
                    <button onClick={() => { setCallType("video"); setCallActive(true); }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
                      <Icon name="Video" size={18} />
                    </button>
                  </div>
                </div>

                <div className="mx-4 mt-2 mb-1 flex items-center justify-between py-1 px-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Icon name="Lock" size={11} className="text-green-400" />
                    <span className="text-xs text-green-400">E2E · P2P · без сервера</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{user.pubkey || MY_NODE_ID}</span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                  {loadingMsgs && messages.length === 0 && (
                    <div className="flex justify-center py-8">
                      <Icon name="Loader2" size={20} className="text-purple-400 animate-spin" />
                    </div>
                  )}
                  {messages.map(msg => {
                    const isOut = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isOut ? "justify-end" : "justify-start"} animate-fade-in group`}>
                        <div className="relative max-w-[70%]">
                          {!isOut && (
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                style={{ background: msg.sender_color }}>
                                {msg.sender_initials || msg.sender_name?.[0]}
                              </div>
                              <span className="text-xs text-muted-foreground">{msg.sender_name}</span>
                            </div>
                          )}
                          <div className={`px-4 py-2.5 cursor-pointer ${isOut ? "msg-bubble-out text-white" : "msg-bubble-in text-foreground"}`}
                            onDoubleClick={() => setShowReactions(msg.id)}>
                            <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                            <p className={`text-[10px] mt-1 ${isOut ? "text-white/60" : "text-muted-foreground"} text-right`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>

                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className={`flex gap-1 mt-1 flex-wrap ${isOut ? "justify-end" : "justify-start"}`}>
                              {Object.entries(
                                msg.reactions.reduce((acc: Record<string, number>, r) => {
                                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                  return acc;
                                }, {})
                              ).map(([emoji, count]) => (
                                <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                                  className="text-sm bg-secondary rounded-full px-1.5 py-0.5 border border-border hover:border-purple-500/50 transition-colors">
                                  {emoji} {count > 1 && <span className="text-xs text-muted-foreground">{count}</span>}
                                </button>
                              ))}
                            </div>
                          )}

                          <button onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}
                            className="absolute -top-2 right-2 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">
                            +
                          </button>
                          {showReactions === msg.id && (
                            <div className={`absolute bottom-full mb-2 ${isOut ? "right-0" : "left-0"} flex gap-1 bg-card border border-border rounded-2xl p-2 shadow-xl z-10 animate-scale-in`}>
                              {REACTIONS_LIST.map(emoji => (
                                <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                                  className="text-xl hover:scale-125 transition-transform">{emoji}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-border">
                  <div className="flex items-end gap-2 bg-secondary rounded-2xl px-3 py-2">
                    <textarea
                      value={msgInput}
                      onChange={e => setMsgInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder="Сообщение... (Enter — отправить)"
                      rows={1}
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none py-1 max-h-32"
                    />
                    {msgInput.trim() ? (
                      <button onClick={sendMessage} disabled={sending}
                        className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform disabled:opacity-50">
                        <Icon name={sending ? "Loader2" : "Send"} size={18} className={sending ? "animate-spin" : ""} />
                      </button>
                    ) : (
                      <button className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <Icon name="Mic" size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center opacity-20">
                  <Icon name="MessageCircle" size={32} className="text-white" />
                </div>
                <p className="text-muted-foreground text-sm">Выберите чат или найдите собеседника в «Контактах»</p>
              </div>
            )}
          </>
        )}

        {/* ===== CONTACTS ===== */}
        {activeTab === "contacts" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex-shrink-0">
              <h1 className="text-xl font-bold gradient-text mb-3">Контакты</h1>
              <div className="relative">
                <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={contactSearch} onChange={e => setContactSearch(e.target.value)}
                  className="w-full bg-secondary rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-500/50 text-foreground placeholder:text-muted-foreground"
                  placeholder="Поиск пользователей..." />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingContacts && (
                <div className="flex justify-center py-8"><Icon name="Loader2" size={20} className="text-purple-400 animate-spin" /></div>
              )}
              {contacts.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-purple-500/30 transition-all group animate-fade-in">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: c.avatar_color }}>{c.avatar_initials || c.display_name[0]}</div>
                    {c.is_online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-card" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{c.display_name}</p>
                    <p className="text-xs text-muted-foreground">@{c.username}</p>
                    <p className="text-xs mt-0.5">{c.is_online ? <span className="text-green-400">В сети</span> : <span className="text-muted-foreground">Не в сети</span>}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openChat(c.id)}
                      className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 hover:bg-purple-500/30 transition-colors">
                      <Icon name="MessageCircle" size={15} />
                    </button>
                    <button onClick={() => { setCallType("voice"); setCallActive(true); }}
                      className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors">
                      <Icon name="Phone" size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {!loadingContacts && contacts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">Пользователи не найдены</div>
              )}
            </div>
          </div>
        )}

        {/* ===== GROUPS ===== */}
        {activeTab === "groups" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex-shrink-0">
              <h1 className="text-xl font-bold gradient-text">Группы</h1>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Icon name="UsersRound" size={40} className="text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground text-sm">Группы пока создаются через Контакты</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== NETWORK ===== */}
        {activeTab === "network" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold gradient-text">P2P Сеть</h1>
                <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Подключено</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-card rounded-xl border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Ваш узел</span>
                  <span className="text-xs text-purple-400 font-mono">{user.node_id || MY_NODE_ID}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-secondary rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-green-400">{peerCount}</p>
                    <p className="text-[10px] text-muted-foreground">Пиров</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-blue-400">↑{netTraffic.up}</p>
                    <p className="text-[10px] text-muted-foreground">МБ/с</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-purple-400">↓{netTraffic.down}</p>
                    <p className="text-[10px] text-muted-foreground">МБ/с</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Протоколы</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Signal Protocol", desc: "E2E шифрование", color: "#10b981", on: true },
                  { name: "DHT Kademlia", desc: "Поиск узлов", color: "#3b82f6", on: true },
                  { name: "Onion Routing", desc: "Анонимность", color: "#a855f7", on: true },
                  { name: "WebRTC", desc: "P2P звонки", color: "#f59e0b", on: true },
                ].map(p => (
                  <div key={p.name} className="p-2.5 bg-card rounded-xl border border-border flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: p.color }} />
                    <div>
                      <p className="text-xs font-semibold">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== PROFILE ===== */}
        {activeTab === "profile" && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="relative h-40 overflow-hidden flex-shrink-0">
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899, #3b82f6)" }} />
              <button onClick={() => api.auth.logout().then(() => setUser(null))}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-white/80 hover:text-white text-xs transition-colors">
                <Icon name="LogOut" size={13} />
                Выйти
              </button>
            </div>
            <div className="px-6 pb-6 -mt-12 relative">
              <div className="story-ring w-24 h-24 rounded-full inline-block">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-background"
                  style={{ background: user.avatar_color }}>
                  {user.avatar_initials || user.display_name[0]}
                </div>
              </div>
              <h2 className="text-2xl font-bold mt-2">{user.display_name}</h2>
              <p className="text-sm text-muted-foreground">@{user.username}</p>

              <div className="mt-4 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                <p className="text-xs text-green-400 font-medium mb-2 flex items-center gap-1">
                  <Icon name="ShieldCheck" size={12} />
                  Децентрализованная идентичность
                </p>
                <div className="space-y-1.5">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Node ID</p>
                    <p className="text-xs font-mono text-foreground break-all">{user.node_id || MY_NODE_ID}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Публичный ключ</p>
                    <p className="text-xs font-mono text-foreground break-all">{user.pubkey || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== SETTINGS ===== */}
        {activeTab === "settings" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex-shrink-0">
              <h1 className="text-xl font-bold gradient-text">Настройки</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {[
                {
                  title: "Безопасность", icon: "Shield", color: "#10b981", items: [
                    { label: "Сквозное шифрование", desc: "E2E для всех чатов", active: true },
                    { label: "Двухфакторная аутентификация", desc: "SMS или приложение", active: false },
                  ]
                },
                {
                  title: "Уведомления", icon: "Bell", color: "#a855f7", items: [
                    { label: "Push-уведомления", desc: "Новые сообщения", active: true },
                    { label: "Звуки сообщений", desc: "Системный звук", active: true },
                  ]
                },
                {
                  title: "Децентрализация", icon: "Network", color: "#10b981", items: [
                    { label: "P2P режим", desc: "Сообщения без серверов", active: true },
                    { label: "Onion-маршрутизация", desc: "Скрыть IP-адрес", active: true },
                    { label: "Tor Bridge", desc: "Обход блокировок", active: false },
                  ]
                },
              ].map(section => (
                <div key={section.title}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${section.color}20` }}>
                      <Icon name={section.icon} size={13} style={{ color: section.color }} />
                    </div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{section.title}</h3>
                  </div>
                  <div className="space-y-1">
                    {section.items.map(item => (
                      <div key={item.label} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <div className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${item.active ? "bg-purple-500" : "bg-secondary"}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.active ? "translate-x-6" : "translate-x-1"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-border">
                <button onClick={() => api.auth.logout().then(() => setUser(null))}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm">
                  <Icon name="LogOut" size={15} />
                  Выйти из аккаунта
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call overlay */}
      {callActive && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center gap-6 animate-fade-in">
          <div className="story-ring rounded-full">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: activeChat ? getChatColor(activeChat) : "#a855f7" }}>
              {activeChat ? getChatInitials(activeChat) : "?"}
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{activeChat ? getChatName(activeChat) : "Звонок"}</h2>
            <p className="text-white/60 mt-1">{callType === "voice" ? "🎙️ Голосовой" : "📹 Видеозвонок"} · Соединение...</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <Icon name="MicOff" size={22} />
            </button>
            <button onClick={() => setCallActive(false)}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-xl shadow-red-500/30">
              <Icon name="PhoneOff" size={24} />
            </button>
            {callType === "video" && (
              <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <Icon name="VideoOff" size={22} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
