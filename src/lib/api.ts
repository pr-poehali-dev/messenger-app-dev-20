const AUTH_URL = "https://functions.poehali.dev/92a54be2-1add-43a8-94a7-05556ac83f92";
const CHATS_URL = "https://functions.poehali.dev/9993caf6-cc86-47b1-afb6-8783fa157cb9";

function getToken(): string {
  return localStorage.getItem("nx_token") || "";
}

async function post(url: string, body: object): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Auth-Token": getToken() },
    body: JSON.stringify(body),
  });
}

async function get(url: string, params: Record<string, string> = {}): Promise<Response> {
  const q = new URLSearchParams(params).toString();
  return fetch(`${url}${q ? "?" + q : ""}`, {
    headers: { "X-Auth-Token": getToken() },
  });
}

function parseBody(data: unknown): unknown {
  if (typeof data === "string") {
    try { return JSON.parse(data); } catch { return data; }
  }
  return data;
}

export const api = {
  auth: {
    async register(username: string, display_name: string, password: string) {
      const r = await post(AUTH_URL, { action: "register", username, display_name, password });
      const raw = await r.json();
      return { ok: r.ok, status: r.status, data: parseBody(raw) as { token?: string; user?: User; error?: string } };
    },
    async login(username: string, password: string) {
      const r = await post(AUTH_URL, { action: "login", username, password });
      const raw = await r.json();
      return { ok: r.ok, status: r.status, data: parseBody(raw) as { token?: string; user?: User; error?: string } };
    },
    async me() {
      const r = await get(AUTH_URL, { action: "me" });
      const raw = await r.json();
      return { ok: r.ok, data: parseBody(raw) as { user?: User; error?: string } };
    },
    async logout() {
      await post(AUTH_URL, { action: "logout" });
      localStorage.removeItem("nx_token");
      localStorage.removeItem("nx_user");
    },
  },

  chats: {
    async getUsers(q = "") {
      const r = await get(CHATS_URL, q ? { action: "users", q } : { action: "users" });
      const raw = await r.json();
      return (parseBody(raw) as { users: User[] }).users || [];
    },
    async list() {
      const r = await post(CHATS_URL, { action: "list" });
      const raw = await r.json();
      return (parseBody(raw) as { chats: Chat[] }).chats || [];
    },
    async create(user_id: number) {
      const r = await post(CHATS_URL, { action: "create", user_id });
      const raw = await r.json();
      return (parseBody(raw) as { chat_id: number }).chat_id;
    },
    async createGroup(name: string, member_ids: number[], avatar_color = "#a855f7") {
      const r = await post(CHATS_URL, { action: "create", is_group: true, name, avatar_color, member_ids });
      const raw = await r.json();
      return (parseBody(raw) as { chat_id: number }).chat_id;
    },
    async messages(chat_id: number) {
      const r = await get(CHATS_URL, { action: "messages", chat_id: String(chat_id) });
      const raw = await r.json();
      return (parseBody(raw) as { messages: Message[] }).messages || [];
    },
    async send(chat_id: number, text: string) {
      const r = await post(CHATS_URL, { action: "send", chat_id, text });
      const raw = await r.json();
      return parseBody(raw) as { message_id: number; created_at: string };
    },
    async react(message_id: number, emoji: string) {
      const r = await post(CHATS_URL, { action: "react", message_id, emoji });
      const raw = await r.json();
      return parseBody(raw) as { action: string };
    },
  },
};

export interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
  avatar_initials: string;
  is_online: boolean;
  last_seen: string;
  node_id?: string;
  pubkey?: string;
  bio?: string;
}

export interface Chat {
  id: number;
  is_group: boolean;
  name: string | null;
  avatar_color: string;
  description: string;
  last_msg: string | null;
  last_time: string | null;
  other_user?: User;
}

export interface Message {
  id: number;
  text: string;
  created_at: string;
  sender_id: number;
  sender_name: string;
  sender_color: string;
  sender_initials: string;
  sender_username: string;
  reactions: Array<{ emoji: string; user_id: number }> | null;
}
