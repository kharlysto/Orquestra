"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Member = { id: string; name: string; email: string; role: string };
type Attachment = { name: string; size: number; type: string; dataUrl: string };
type Message = { id: string; senderId: string; senderName: string; body: string; mentionUserId?: string; attachment?: Attachment; visibility?: "GENERAL" | "PRIVATE"; recipientId?: string; replyToId?: string; reactions?: Record<string, string>; createdAt: string };
type Thread = "GENERAL" | "PRIVATE";

function MentionedText({ value }: { value: string }) {
  return <>{value.split(/(@everyone|@[a-zA-Z0-9._-]+)/g).map((part, index) => part.startsWith("@") ? <strong key={index} className="draft-mention">{part}</strong> : <span key={index}>{part}</span>)}</>;
}

function SendIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 16 8-16 8 3-8-3-8Z" /><path d="M7 12h13" /></svg>; }
function AttachIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7" /></svg>; }

export default function DraftWorkspace({ setNotice }: { setNotice: (value: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [me, setMe] = useState<{ id: string; name: string; role: string } | null>(null);
  const [body, setBody] = useState("");
  const [mentionUserId, setMentionUserId] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [attachment, setAttachment] = useState<Attachment>();
  const [thread, setThread] = useState<Thread>("GENERAL");
  const [recipientId, setRecipientId] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFiles, setShowFiles] = useState(false);
  const [loading, setLoading] = useState(true);
  const messageListRef = useRef<HTMLDivElement>(null);

  const people = useMemo(() => members.filter((member) => member.id !== me?.id), [members, me]);
  const mentionOptions = useMemo(() => [{ id: "EVERYONE", name: "everyone", email: "Notify the whole team", role: "TEAM" }, ...people].filter((member) => !mentionQuery || member.name.toLowerCase().includes(mentionQuery.toLowerCase())), [people, mentionQuery]);
  const visibleMessages = useMemo(() => messages.filter((message) => thread === "GENERAL" ? message.visibility !== "PRIVATE" : message.visibility === "PRIVATE"), [messages, thread]);
  const searchMatches = useMemo(() => { const query = searchQuery.trim().toLowerCase(); if (!query) return []; return visibleMessages.filter((message) => message.body.toLowerCase().includes(query) || message.senderName.toLowerCase().includes(query) || message.attachment?.name.toLowerCase().includes(query)); }, [searchQuery, visibleMessages]);
  const conversationFiles = useMemo(() => visibleMessages.filter((message) => message.attachment).map((message) => ({ message, attachment: message.attachment! })), [visibleMessages]);

  async function load(initial = false) {
    if (initial) setLoading(true);
    const [messageResponse, memberResponse, meResponse] = await Promise.all([fetch("/api/messages"), fetch("/api/invitations"), fetch("/api/me")]);
    if (messageResponse.ok) { setMessages((await messageResponse.json()).messages); if (initial) scrollToLatest(); }
    if (memberResponse.ok) setMembers((await memberResponse.json()).members || []);
    if (meResponse.ok) setMe((await meResponse.json()).user);
    if (initial) setLoading(false);
  }

  useEffect(() => {
    load(true);
    const timer = window.setInterval(() => load(), 4000);
    return () => window.clearInterval(timer);
  }, []);

  function scrollToLatest() { window.setTimeout(() => { const list = messageListRef.current; if (list) list.scrollTop = list.scrollHeight; }, 40); }
  function scrollToMessage(messageId: string) { setShowFiles(false); window.setTimeout(() => messageListRef.current?.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 40); }

  useEffect(() => { scrollToLatest(); }, [thread]);

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setNotice("Attachments must be 20MB or smaller."); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => setAttachment({ name: file.name, size: file.size, type: file.type, dataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  }

  function updateBody(value: string) {
    setBody(value);
    const match = value.match(/@([a-zA-Z0-9._-]*)$/);
    setMentionQuery(match ? match[1] : "");
  }

  function chooseMention(member: Member) {
    setBody(body.replace(/@([a-zA-Z0-9._-]*)$/, `@${member.name} `));
    setMentionUserId(member.id);
    setMentionQuery("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (thread === "PRIVATE" && !recipientId) { setNotice("Choose a teammate for this private message."); return; }
    const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body, mentionUserId, attachment, visibility: thread, recipientId: thread === "PRIVATE" ? recipientId : undefined, replyToId: replyTo?.id }) });
    const data = await response.json();
    if (!response.ok) setNotice(data.error || "Unable to send the message.");
    if (response.ok) { setBody(""); setMentionUserId(""); setMentionQuery(""); setRecipientId(""); setAttachment(undefined); setReplyTo(null); load().then(scrollToLatest); }
  }

  async function reactTo(messageId: string, reaction: string) { const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reactionToId: messageId, reaction }) }); if (!response.ok) { const data = await response.json(); setNotice(data.error || "Unable to react to this message."); return; } load(); }

  return <div className="draft-workspace dashboard-card grid h-[calc(100vh-190px)] min-h-[600px] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#151515] lg:grid-cols-[1fr_310px]">
    <section className="flex min-h-0 flex-col">
      <header className="draft-thread-header shrink-0 border-b border-white/[0.07] px-6 py-4">
        <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Team conversation</p><p className="mt-1 text-xs text-white/40">Messages stay separated by thread.</p></div>
        <div className="draft-thread-tools"><label className="draft-search"><span>⌕</span><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search conversation" aria-label="Search conversation" /></label><button type="button" className={`draft-files-button ${showFiles ? "is-active" : ""}`} onClick={() => setShowFiles((open) => !open)}>Files <span>{conversationFiles.length}</span></button><div className="draft-thread-tabs" role="tablist" aria-label="Draft conversations"><button type="button" role="tab" aria-selected={thread === "GENERAL"} onClick={() => setThread("GENERAL")} className={thread === "GENERAL" ? "is-active" : ""}>General <span>{messages.filter((message) => message.visibility !== "PRIVATE").length}</span></button><button type="button" role="tab" aria-selected={thread === "PRIVATE"} onClick={() => setThread("PRIVATE")} className={thread === "PRIVATE" ? "is-active" : ""}>Private <span>{messages.filter((message) => message.visibility === "PRIVATE").length}</span></button></div></div>
      </header>
      <div ref={messageListRef} className="draft-message-list min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
        {searchQuery.trim() && <div className="draft-search-results"><p>Search results</p>{searchMatches.length ? searchMatches.map((match) => <button type="button" key={match.id} onClick={() => scrollToMessage(match.id)}><span>{match.body || match.attachment?.name}</span><small>{match.senderName} · {new Date(match.createdAt).toLocaleString()}</small></button>) : <span className="draft-search-empty">No matching messages.</span>}</div>}
        {showFiles && <div className="draft-files-panel"><div><p>Files in {thread === "PRIVATE" ? "private" : "general"} conversation</p><small>{conversationFiles.length} attachment{conversationFiles.length === 1 ? "" : "s"}</small></div>{conversationFiles.length ? conversationFiles.map(({ message, attachment }) => <div className="draft-file-row" key={message.id}><span className="draft-file-icon">↗</span><div><b>{attachment.name}</b><small>{(attachment.size / 1024 / 1024).toFixed(2)}MB · {message.senderName}</small></div><a href={attachment.dataUrl} target="_blank" rel="noreferrer" aria-label={`View ${attachment.name}`}>View</a><a download={attachment.name} href={attachment.dataUrl} aria-label={`Download ${attachment.name}`}>Download</a></div>) : <p className="draft-search-empty">No files in this conversation.</p>}</div>}
        {loading && <p className="text-sm text-white/35">Loading conversation...</p>}
        {!loading && !visibleMessages.length && <p className="py-16 text-center text-sm text-white/35">{thread === "PRIVATE" ? "No private messages yet." : "Start a conversation with your team."}</p>}
        {visibleMessages.map((message) => { const mine = message.senderId === me?.id; const reply = message.replyToId ? messages.find((item) => item.id === message.replyToId) : null; const reaction = message.reactions?.[me?.id || ""]; return <article data-message-id={message.id} key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`draft-bubble max-w-[82%] rounded-2xl px-4 py-3 ${mine ? "draft-bubble-mine rounded-br-md" : "draft-bubble-other rounded-bl-md"}`}><div className="flex items-center justify-between gap-4"><p className="text-xs font-black">{mine ? "You" : message.senderName}</p>{message.visibility === "PRIVATE" && <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Private</span>}</div>{reply && <div className="draft-reply-preview">Replying to {reply.senderName}: <span>{reply.body || reply.attachment?.name || "Attachment"}</span></div>}{message.body && <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed"><MentionedText value={message.body} /></p>}{message.attachment && <a download={message.attachment.name} href={message.attachment.dataUrl} className="mt-3 block rounded-xl border border-current/20 bg-black/10 p-3 text-xs"><b className="block truncate">{message.attachment.name}</b><span className="opacity-60">{(message.attachment.size / 1024 / 1024).toFixed(2)}MB · Download</span></a>}<div className="draft-message-tools"><button type="button" onClick={() => setReplyTo(message)}>Reply</button><button type="button" onClick={() => reactTo(message.id, "👍")} className={reaction === "👍" ? "is-reacted" : ""}>👍</button><button type="button" onClick={() => reactTo(message.id, "❤️")} className={reaction === "❤️" ? "is-reacted" : ""}>❤️</button><button type="button" onClick={() => reactTo(message.id, "✅")} className={reaction === "✅" ? "is-reacted" : ""}>✅</button></div><time className="mt-2 block text-[9px] opacity-45">{new Date(message.createdAt).toLocaleString()}</time></div></article>; })}
      </div>
      <form onSubmit={submit} className="draft-composer shrink-0 border-t border-white/[0.07] p-5">{replyTo && <div className="draft-replying">Replying to {replyTo.senderName}<button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply">×</button></div>}<div className="draft-input-wrap relative"><textarea required={!attachment} value={body} onChange={(event) => updateBody(event.target.value)} placeholder={thread === "PRIVATE" ? "Write a private message..." : "Write a message. Use @ to mention..."} className="min-h-20 w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-sm outline-none focus:border-primary" />{mentionQuery !== "" || body.endsWith("@") ? <div className="draft-mention-menu">{mentionOptions.map((member) => <button type="button" key={member.id} onClick={() => chooseMention(member)}><span className="draft-mention-option">@{member.name}</span><small>{member.email}</small></button>)}{!mentionOptions.length && <p>No matching teammates.</p>}</div> : null}</div><div className="draft-composer-actions"><label title="Attach file" aria-label="Attach file" className="draft-icon-button"><input type="file" className="hidden" onChange={selectFile} /><AttachIcon /></label>{attachment && <span className="draft-attachment-name max-w-40 truncate text-xs text-primary">{attachment.name}</span>}<button type="submit" title="Send message" aria-label="Send message" className="draft-icon-button draft-send-button"><SendIcon /></button></div></form>
    </section>
    <aside className="draft-sidebar border-t border-white/[0.07] p-5 lg:border-l lg:border-t-0"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{thread === "PRIVATE" ? "Private inbox" : "General inbox"}</p><h4 className="mt-2 font-black">{thread === "PRIVATE" ? "Private agent thread" : "Team draft"}</h4><p className="mt-1 text-xs leading-relaxed text-white/35">{thread === "PRIVATE" ? "Only the sender, recipient, and owner can see private messages." : "Shared notes for the whole workspace team."}</p>{thread === "PRIVATE" && <select required value={recipientId} onChange={(event) => setRecipientId(event.target.value)} className="mt-5 w-full rounded-xl border border-primary/30 bg-primary/[0.04] px-3 py-3 text-sm"><option value="">Choose teammate</option>{people.map((member) => <option key={member.id} value={member.id}>{member.name} · {member.role}</option>)}</select>}<div className="mt-6 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4"><p className="text-xs font-black text-primary">Conversation rules</p><p className="mt-2 text-xs leading-relaxed text-white/45">Type @ to mention a teammate or everyone. Attachments are limited to 20MB.</p></div></aside>
  </div>;
}
