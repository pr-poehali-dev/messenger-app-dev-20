import { useState } from "react";
import Icon from "@/components/ui/icon";

const TABS = [
  { id: "chats", label: "Чаты", icon: "MessageCircle" },
  { id: "contacts", label: "Контакты", icon: "Users" },
  { id: "groups", label: "Группы", icon: "UsersRound" },
  { id: "notifications", label: "Уведомления", icon: "Bell" },
  { id: "profile", label: "Профиль", icon: "UserCircle" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

const CHATS = [
  { id: 1, name: "Алексей Морозов", avatar: "АМ", color: "#a855f7", msg: "Увидимся завтра на встрече 👋", time: "14:32", unread: 3, online: true, typing: false },
  { id: 2, name: "Команда Дизайн", avatar: "КД", color: "#ec4899", msg: "Макеты готовы к ревью!", time: "13:15", unread: 7, online: true, typing: true },
  { id: 3, name: "Мария Петрова", avatar: "МП", color: "#3b82f6", msg: "Файл отправила тебе", time: "12:00", unread: 0, online: false, typing: false },
  { id: 4, name: "NexBot 🤖", avatar: "NB", color: "#10b981", msg: "Привет! Чем могу помочь?", time: "11:44", unread: 1, online: true, typing: false },
  { id: 5, name: "Иван Сидоров", avatar: "ИС", color: "#f59e0b", msg: "Посмотри документ, пожалуйста", time: "Вчера", unread: 0, online: false, typing: false },
  { id: 6, name: "Анна Козлова", avatar: "АК", color: "#06b6d4", msg: "Спасибо за помощь! 🙌", time: "Вчера", unread: 0, online: true, typing: false },
];

const MESSAGES = [
  { id: 1, out: false, text: "Привет! Как дела? 👋", time: "14:20" },
  { id: 2, out: true, text: "Отлично, спасибо! Работаю над новым проектом", time: "14:21" },
  { id: 3, out: false, text: "Это интересно! Расскажи подробнее", time: "14:22" },
  { id: 4, out: true, text: "Это мессенджер с шифрованием и крутым дизайном 🚀", time: "14:25" },
  { id: 5, out: false, text: "Звучит здорово! Когда запуск?", time: "14:28" },
  { id: 6, out: true, text: "Скоро! Сейчас финальные правки делаем", time: "14:30" },
  { id: 7, out: false, text: "Увидимся завтра на встрече 👋", time: "14:32" },
];

const STORIES = [
  { id: 1, name: "Моя", avatar: "ВЫ", color: "#a855f7", viewed: false, isMe: true },
  { id: 2, name: "Алексей", avatar: "АМ", color: "#a855f7", viewed: false, isMe: false },
  { id: 3, name: "Команда", avatar: "КД", color: "#ec4899", viewed: false, isMe: false },
  { id: 4, name: "Мария", avatar: "МП", color: "#3b82f6", viewed: true, isMe: false },
  { id: 5, name: "Анна", avatar: "АК", color: "#06b6d4", viewed: true, isMe: false },
];

const CONTACTS = [
  { id: 1, name: "Алексей Морозов", status: "В сети", avatar: "АМ", color: "#a855f7", phone: "+7 999 123-45-67", online: true },
  { id: 2, name: "Анна Козлова", status: "Была 1ч назад", avatar: "АК", color: "#06b6d4", phone: "+7 999 234-56-78", online: false },
  { id: 3, name: "Иван Сидоров", status: "Не беспокоить", avatar: "ИС", color: "#f59e0b", phone: "+7 999 345-67-89", online: false },
  { id: 4, name: "Мария Петрова", status: "В сети", avatar: "МП", color: "#3b82f6", phone: "+7 999 456-78-90", online: true },
  { id: 5, name: "NexBot", status: "Всегда онлайн 🤖", avatar: "NB", color: "#10b981", phone: "Бот", online: true },
];

const GROUPS = [
  { id: 1, name: "Команда Дизайн", members: 12, avatar: "КД", color: "#ec4899", desc: "Обсуждение макетов и дизайн-систем", lastMsg: "Макеты готовы!" },
  { id: 2, name: "Разработка 🛠️", members: 8, avatar: "РЗ", color: "#3b82f6", desc: "Технические вопросы и код", lastMsg: "Деплой прошёл успешно" },
  { id: 3, name: "Маркетинг", members: 25, avatar: "МК", color: "#f59e0b", desc: "Стратегии и кампании", lastMsg: "Запуск завтра в 10:00" },
  { id: 4, name: "Общий чат 🎉", members: 47, avatar: "ОЧ", color: "#10b981", desc: "Новости компании и анонсы", lastMsg: "Всем хороших выходных!" },
];

const NOTIFS = [
  { id: 1, icon: "MessageCircle", color: "#a855f7", title: "Новое сообщение", text: "Алексей: Увидимся завтра 👋", time: "5 мин назад", unread: true },
  { id: 2, icon: "UsersRound", color: "#ec4899", title: "Команда Дизайн", text: "Макеты готовы к ревью!", time: "20 мин назад", unread: true },
  { id: 3, icon: "Phone", color: "#10b981", title: "Пропущенный звонок", text: "Мария Петрова", time: "1 ч назад", unread: false },
  { id: 4, icon: "Heart", color: "#ef4444", title: "Реакция на сообщение", text: "Анна поставила ❤️ вашему сообщению", time: "2 ч назад", unread: false },
  { id: 5, icon: "Circle", color: "#3b82f6", title: "Новая история", text: "Иван добавил историю", time: "3 ч назад", unread: false },
];

const REACTIONS_LIST = ["❤️", "😂", "🔥", "👍", "😮", "😢"];

export default function Index() {
  const [activeTab, setActiveTab] = useState("chats");
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [message, setMessage] = useState("");
  const [showReactions, setShowReactions] = useState<number | null>(null);
  const [msgReactions, setMsgReactions] = useState<Record<number, string[]>>({
    1: ["❤️", "😊"], 4: ["🔥", "👍"]
  });
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState<"voice" | "video">("voice");
  const [showStory, setShowStory] = useState<number | null>(null);

  const activeContact = CHATS.find(c => c.id === activeChat);

  const addReaction = (msgId: number, emoji: string) => {
    setMsgReactions(prev => {
      const cur = prev[msgId] || [];
      if (cur.includes(emoji)) return { ...prev, [msgId]: cur.filter(e => e !== emoji) };
      return { ...prev, [msgId]: [...cur, emoji] };
    });
    setShowReactions(null);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar nav */}
      <div className="w-16 flex flex-col items-center py-4 gap-1 border-r border-border glass z-10 relative">
        <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
          <span className="text-white font-bold text-sm font-mono">N</span>
        </div>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
            className={`w-11 h-11 rounded-xl flex items-center justify-center relative transition-all duration-200 group
              ${activeTab === tab.id
                ? "bg-purple-500/20 text-purple-400"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
          >
            <Icon name={tab.icon} size={20} />
            {tab.id === "notifications" && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full border border-background" />
            )}
            {tab.id === "chats" && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-400 rounded-full border border-background" />
            )}
            <span className="absolute left-14 bg-card border border-border text-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-w-0">

        {/* ===== CHATS ===== */}
        {activeTab === "chats" && (
          <>
            {/* Chat list */}
            <div className="w-72 flex flex-col border-r border-border flex-shrink-0">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-lg font-bold gradient-text">Чаты</h1>
                  <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-purple-400 transition-colors">
                    <Icon name="SquarePen" size={16} />
                  </button>
                </div>
                <div className="relative">
                  <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input className="w-full bg-secondary rounded-xl pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-purple-500/50" placeholder="Поиск..." />
                </div>
              </div>

              {/* Stories */}
              <div className="px-3 py-2 border-b border-border overflow-hidden">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {STORIES.map(story => (
                    <button key={story.id} onClick={() => setShowStory(story.id)} className="flex flex-col items-center gap-1 min-w-[52px]">
                      <div className={`${!story.viewed && !story.isMe ? "story-ring" : ""} rounded-full`}>
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-background"
                          style={{ background: story.color }}
                        >
                          {story.isMe ? "+" : story.avatar}
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center">{story.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat list */}
              <div className="flex-1 overflow-y-auto">
                {CHATS.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 transition-colors text-left
                      ${activeChat === chat.id ? "bg-purple-500/10" : "hover:bg-secondary/50"}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: chat.color }}>
                        {chat.avatar}
                      </div>
                      {chat.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold truncate">{chat.name}</span>
                        <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-1">{chat.time}</span>
                      </div>
                      {chat.typing ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-purple-400">печатает</span>
                          <div className="flex gap-0.5">
                            <div className="w-1 h-1 bg-purple-400 rounded-full typing-dot" />
                            <div className="w-1 h-1 bg-purple-400 rounded-full typing-dot" />
                            <div className="w-1 h-1 bg-purple-400 rounded-full typing-dot" />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.msg}</p>
                      )}
                    </div>
                    {chat.unread > 0 && (
                      <span className="flex-shrink-0 min-w-[20px] h-5 rounded-full gradient-btn flex items-center justify-center text-white text-[10px] font-bold px-1">
                        {chat.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat view */}
            {activeContact ? (
              <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border glass">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: activeContact.color }}>
                      {activeContact.avatar}
                    </div>
                    {activeContact.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{activeContact.name}</p>
                    <p className="text-xs text-green-400">{activeContact.online ? "В сети" : "Не в сети"}</p>
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
                    <button className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Icon name="Search" size={18} />
                    </button>
                    <button className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Icon name="MoreVertical" size={18} />
                    </button>
                  </div>
                </div>

                {/* Encryption banner */}
                <div className="mx-4 mt-3 mb-1 flex items-center justify-center gap-2 py-1.5 px-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <Icon name="Lock" size={12} className="text-green-400" />
                  <span className="text-xs text-green-400 font-medium">Сквозное шифрование включено</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                  {MESSAGES.map(msg => (
                    <div key={msg.id} className={`flex ${msg.out ? "justify-end" : "justify-start"} animate-fade-in group`}>
                      <div className="relative max-w-[70%]">
                        <div
                          className={`px-4 py-2.5 cursor-pointer ${msg.out ? "msg-bubble-out text-white" : "msg-bubble-in text-foreground"}`}
                          onDoubleClick={() => setShowReactions(msg.id)}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${msg.out ? "text-white/60" : "text-muted-foreground"} text-right`}>{msg.time}</p>
                        </div>

                        {/* Reactions display */}
                        {(msgReactions[msg.id]?.length ?? 0) > 0 && (
                          <div className={`flex gap-1 mt-1 flex-wrap ${msg.out ? "justify-end" : "justify-start"}`}>
                            {msgReactions[msg.id].map((r, i) => (
                              <button key={i} onClick={() => addReaction(msg.id, r)}
                                className="text-sm bg-secondary rounded-full px-1.5 py-0.5 border border-border hover:border-purple-500/50 transition-colors">
                                {r}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Add reaction button */}
                        <button onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}
                          className="absolute -top-2 right-2 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-foreground">
                          +
                        </button>

                        {/* Reaction picker */}
                        {showReactions === msg.id && (
                          <div className={`absolute bottom-full mb-2 ${msg.out ? "right-0" : "left-0"} flex gap-1 bg-card border border-border rounded-2xl p-2 shadow-xl z-10 animate-scale-in`}>
                            {REACTIONS_LIST.map(emoji => (
                              <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                                className="text-xl hover:scale-125 transition-transform">
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="px-4 pb-4 pt-2 border-t border-border">
                  <div className="flex items-end gap-2 bg-secondary rounded-2xl px-3 py-2">
                    <button className="text-muted-foreground hover:text-purple-400 transition-colors pb-1">
                      <Icon name="Paperclip" size={20} />
                    </button>
                    <button className="text-muted-foreground hover:text-pink-400 transition-colors pb-1">
                      <Icon name="Image" size={20} />
                    </button>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Сообщение..."
                      rows={1}
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none py-1 max-h-32"
                    />
                    <button className="text-muted-foreground hover:text-yellow-400 transition-colors pb-1">
                      <Icon name="Smile" size={20} />
                    </button>
                    {message.trim() ? (
                      <button onClick={() => setMessage("")}
                        className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform">
                        <Icon name="Send" size={18} />
                      </button>
                    ) : (
                      <button className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 hover:bg-purple-500/30 transition-colors">
                        <Icon name="Mic" size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Выберите чат</p>
              </div>
            )}
          </>
        )}

        {/* ===== CONTACTS ===== */}
        {activeTab === "contacts" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <h1 className="text-xl font-bold gradient-text">Контакты</h1>
              <button className="flex items-center gap-2 gradient-btn text-white text-sm px-3 py-1.5 rounded-xl hover:opacity-90 transition-opacity">
                <Icon name="UserPlus" size={15} />
                Добавить
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="relative mb-4">
                <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input className="w-full bg-secondary rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-500/50 text-foreground placeholder:text-muted-foreground" placeholder="Поиск контактов..." />
              </div>
              <div className="space-y-2">
                {CONTACTS.map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-purple-500/30 transition-all group animate-fade-in">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ background: c.color }}>
                        {c.avatar}
                      </div>
                      {c.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-card" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.status}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{c.phone}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setActiveTab("chats"); setActiveChat(c.id <= 4 ? c.id : 4); }}
                        className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 hover:bg-purple-500/30 transition-colors">
                        <Icon name="MessageCircle" size={15} />
                      </button>
                      <button onClick={() => { setCallType("voice"); setCallActive(true); setActiveChat(c.id <= 4 ? c.id : 4); }}
                        className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors">
                        <Icon name="Phone" size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== GROUPS ===== */}
        {activeTab === "groups" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <h1 className="text-xl font-bold gradient-text">Группы</h1>
              <button className="flex items-center gap-2 gradient-btn text-white text-sm px-3 py-1.5 rounded-xl hover:opacity-90 transition-opacity">
                <Icon name="Plus" size={15} />
                Создать
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {GROUPS.map(g => (
                <div key={g.id} className="p-4 bg-card rounded-2xl border border-border hover:border-purple-500/30 transition-all cursor-pointer group animate-fade-in">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg"
                      style={{ background: g.color }}>
                      {g.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">{g.name}</h3>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Icon name="Users" size={11} />
                          {g.members}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{g.desc}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-px flex-1 bg-border" />
                        <p className="text-xs text-muted-foreground">{g.lastMsg}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 text-xs py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors font-medium">
                      Открыть чат
                    </button>
                    <button className="flex-1 text-xs py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors font-medium">
                      Участники
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== NOTIFICATIONS ===== */}
        {activeTab === "notifications" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <h1 className="text-xl font-bold gradient-text">Уведомления</h1>
              <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Прочитать все
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {NOTIFS.map((n, i) => (
                <div key={n.id}
                  className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border hover:border-purple-500/30 transition-all cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${n.color}20` }}>
                    <Icon name={n.icon} size={18} style={{ color: n.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.text}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                  </div>
                  {n.unread && <span className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-2" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== PROFILE ===== */}
        {activeTab === "profile" && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="relative h-40 overflow-hidden flex-shrink-0">
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #3b82f6 100%)" }} />
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(168,85,247,0.4) 0%, transparent 60%)" }} />
              <button className="absolute top-3 right-3 w-8 h-8 rounded-lg glass flex items-center justify-center text-white/80 hover:text-white transition-colors">
                <Icon name="Pencil" size={14} />
              </button>
            </div>
            <div className="px-6 pb-6 -mt-12 relative">
              <div className="story-ring w-24 h-24 rounded-full inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-background">
                  ВЫ
                </div>
              </div>
              <h2 className="text-2xl font-bold mt-2">Ваш Профиль</h2>
              <p className="text-sm text-muted-foreground">@username</p>
              <p className="text-sm mt-2 text-foreground/80">Строю будущее, один чат за раз 🚀</p>

              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: "Контакты", value: "142" },
                  { label: "Группы", value: "12" },
                  { label: "Истории", value: "28" },
                ].map(stat => (
                  <div key={stat.label} className="bg-card rounded-xl p-3 border border-border text-center">
                    <p className="text-xl font-bold gradient-text">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                {[
                  { icon: "Phone", label: "Телефон", value: "+7 999 000-00-00" },
                  { icon: "Mail", label: "Email", value: "user@nexchat.ru" },
                  { icon: "MapPin", label: "Город", value: "Москва, Россия" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Icon name={item.icon} size={15} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
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
                    { label: "Двухфакторная аутентификация", desc: "SMS или приложение", active: true },
                    { label: "Биометрический вход", desc: "Face ID / Touch ID", active: false },
                  ]
                },
                {
                  title: "Уведомления", icon: "Bell", color: "#a855f7", items: [
                    { label: "Push-уведомления", desc: "Новые сообщения", active: true },
                    { label: "Звуки сообщений", desc: "Системный звук", active: true },
                    { label: "Превью в уведомлениях", desc: "Показывать текст", active: false },
                  ]
                },
                {
                  title: "Конфиденциальность", icon: "Eye", color: "#ec4899", items: [
                    { label: "Время последнего визита", desc: "Видят все", active: true },
                    { label: "Статус набора текста", desc: "Показывать «печатает»", active: true },
                    { label: "Статус прочтения", desc: "Галочки доставки", active: true },
                  ]
                },
                {
                  title: "Чат-боты", icon: "Bot", color: "#3b82f6", items: [
                    { label: "Автоответы", desc: "Умные шаблоны", active: false },
                    { label: "NexBot", desc: "Встроенный помощник", active: true },
                  ]
                }
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
            </div>
          </div>
        )}
      </div>

      {/* === Call overlay === */}
      {callActive && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center gap-6 animate-fade-in">
          <div className="story-ring rounded-full">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: activeContact?.color }}>
              {activeContact?.avatar}
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{activeContact?.name}</h2>
            <p className="text-white/60 mt-1 animate-pulse-slow">{callType === "voice" ? "🎙️ Голосовой звонок" : "📹 Видеозвонок"} · Соединение...</p>
          </div>
          {callType === "video" && (
            <div className="w-64 h-40 bg-secondary/50 rounded-2xl border border-border flex items-center justify-center">
              <Icon name="Video" size={32} className="text-muted-foreground" />
            </div>
          )}
          <div className="flex items-center gap-4 mt-4">
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

      {/* === Story overlay === */}
      {showStory !== null && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center animate-fade-in"
          onClick={() => setShowStory(null)}>
          <div className="relative w-80 h-[500px] rounded-3xl overflow-hidden border border-border shadow-2xl"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899, #3b82f6)" }}
            onClick={e => e.stopPropagation()}>
            <div className="absolute top-3 left-3 right-3 flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-0.5 flex-1 rounded-full ${i === 0 ? "bg-white" : "bg-white/30"}`} />
              ))}
            </div>
            <div className="absolute top-8 left-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                {STORIES.find(s => s.id === showStory)?.avatar}
              </div>
              <span className="text-white text-sm font-medium">{STORIES.find(s => s.id === showStory)?.name}</span>
              <span className="text-white/60 text-xs">только что</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-6xl">🚀</p>
            </div>
            <div className="absolute bottom-4 left-3 right-3">
              <div className="flex items-center gap-2 bg-black/30 rounded-full px-4 py-2">
                <input placeholder="Ответить..." className="flex-1 bg-transparent text-white text-sm placeholder:text-white/50 outline-none" />
                <Icon name="Send" size={16} className="text-white/60" />
              </div>
            </div>
            <button onClick={() => setShowStory(null)}
              className="absolute top-8 right-3 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white">
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}