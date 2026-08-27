import React, { useEffect, useState, useRef } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { messagesApi } from "../../api/marketplace.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { PageLoader, EmptyState, ErrorState } from "../../components/ui.jsx";

export default function Messages() {
  const { user } = useAuth();
  const toast = useToast();
  const [threads, setThreads] = useState(null);
  const [threadsError, setThreadsError] = useState(null);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesError, setMessagesError] = useState(null);
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(true);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const loadThreads = () => {
    setThreadsError(null);
    messagesApi
      .threads()
      .then((res) => {
        setThreads(res.threads);
        if (res.threads.length > 0) setActive((prev) => prev || res.threads[0]);
      })
      .catch((err) => setThreadsError(err.message || "Couldn't load your conversations."));
  };
  useEffect(loadThreads, []);

  useEffect(() => {
    if (!active) return;
    setMessagesError(null);
    messagesApi
      .with(active.participant._id, active.item?._id)
      .then((res) => setMessages(res.messages))
      .catch((err) => setMessagesError(err.message || "Couldn't load this conversation."));
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    const body = text.trim();
    setText("");
    try {
      const res = await messagesApi.send({ receiverId: active.participant._id, itemId: active.item?._id, body });
      setMessages((prev) => [...prev, res.message]);
    } catch (err) {
      toast.error(err.message);
      setText(body);
    }
  };

  if (threadsError) return <ErrorState description={threadsError} onRetry={loadThreads} />;
  if (!threads) return <PageLoader />;

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Messages</h1>
      {threads.length === 0 ? (
        <EmptyState title="No conversations yet" description="Message an owner from an item page to start a conversation." />
      ) : (
        <div
          className="grid sm:grid-cols-[220px_1fr] gap-0 bg-white border border-line rounded-2xl overflow-hidden h-[70vh] sm:h-[480px]"
        >
          <div className={`border-r border-line overflow-y-auto ${showThreadOnMobile ? "" : "hidden sm:block"}`}>
            {threads.map((t, i) => (
              <button
                key={i}
                onClick={() => {
                  setActive(t);
                  setShowThreadOnMobile(false);
                }}
                className={`w-full text-left px-3.5 py-3 border-b border-line hover:bg-surface ${active === t ? "bg-brand-soft" : ""}`}
              >
                <p className="text-sm font-semibold truncate">{t.participant.name}</p>
                <p className="text-xs text-muted truncate">{t.item?.title || "General"}</p>
              </button>
            ))}
          </div>
          <div className={`flex-col ${showThreadOnMobile ? "hidden sm:flex" : "flex"}`}>
            <div className="sm:hidden flex items-center gap-2 border-b border-line px-3 py-2.5">
              <button onClick={() => setShowThreadOnMobile(true)} className="text-muted hover:text-ink" aria-label="Back to conversations">
                <ArrowLeft size={16} />
              </button>
              <p className="text-sm font-semibold truncate">{active?.participant.name}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {messagesError ? (
                <ErrorState
                  description={messagesError}
                  onRetry={() => setActive((prev) => (prev ? { ...prev } : prev))}
                />
              ) : (
                <>
                  {messages.map((m) => (
                    <div key={m._id} className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${String(m.sender) === String(user._id) || m.sender?._id === user._id ? "bg-brand text-white ml-auto" : "bg-surface"}`}>
                      {m.body}
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </>
              )}
            </div>
            <form onSubmit={send} className="border-t border-line p-3 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 min-w-0 border border-line rounded-lg px-3 py-2 text-sm bg-surface outline-none focus:ring-2 focus:ring-brand/40"
              />
              <button type="submit" className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center shrink-0" aria-label="Send">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
