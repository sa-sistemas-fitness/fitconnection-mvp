import {
  ArrowUpRight,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { TrainerAvatar } from "../components/TrainerAvatar.jsx";
import { Button, EmptyState, Input, StatusBadge } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function counterpart(chat, userId) {
  const request = chat.solicitud;
  return request.entrenador.usuario.idUsuario === userId
    ? request.cliente.usuario
    : request.entrenador.usuario;
}

function messageTime(value) {
  return new Date(value).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messageError, setMessageError] = useState("");
  const messagesEndRef = useRef(null);

  const loadChats = useCallback(async () => {
    setLoadingChats(true);
    setError("");
    try {
      const { data } = await api.get("/chats");
      const acceptedChats = data.chats.filter(
        (chat) => chat.solicitud.estado.nombre === "Aceptada",
      );
      setChats(acceptedChats);
      setActiveId((current) =>
        acceptedChats.some((chat) => chat.idChat === current)
          ? current
          : (acceptedChats[0]?.idChat ?? null),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar tus conversaciones.",
      );
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    setMessageError("");
    try {
      const { data } = await api.get(`/chats/${chatId}/messages`);
      setMessages(data.messages);
    } catch (requestError) {
      setMessageError(
        requestError.response?.data?.message ??
          "No fue posible cargar los mensajes.",
      );
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    loadMessages(activeId);
  }, [activeId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const active = chats.find((chat) => chat.idChat === activeId) ?? null;
  const visibleChats = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return chats;
    return chats.filter((chat) => {
      const person = counterpart(chat, user.idUsuario);
      return `${person.nombre} ${person.apellido}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [chats, query, user.idUsuario]);

  const send = async (event) => {
    event.preventDefault();
    const contenido = text.trim();
    if (!contenido || !active || sending) return;
    setSending(true);
    setMessageError("");
    try {
      await api.post(`/chats/${active.idChat}/messages`, { contenido });
      setText("");
      await Promise.all([loadMessages(active.idChat), loadChats()]);
    } catch (requestError) {
      setMessageError(
        requestError.response?.data?.message ?? "No se pudo enviar el mensaje.",
      );
    } finally {
      setSending(false);
    }
  };

  if (loadingChats) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Cargando tus conversaciones..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-10">
        <ErrorState message={error} onRetry={loadChats} />
      </div>
    );
  }

  if (!chats.length) {
    return (
      <div className="page-container py-16">
        <EmptyState
          action={
            <Link to="/entrenadores">
              <Button>Buscar entrenador</Button>
            </Link>
          }
          description="El chat se habilita automáticamente cuando un entrenador acepta tu solicitud de conexión."
          icon={MessageSquare}
          title="Todavía no hay conversaciones"
        />
      </div>
    );
  }

  const other = counterpart(active, user.idUsuario);
  const otherIsTrainer =
    active.solicitud.entrenador.usuario.idUsuario === other.idUsuario;

  return (
    <div className="grid min-h-[calc(100vh-74px)] lg:h-[calc(100vh-74px)] lg:grid-cols-[360px_1fr]">
      <aside className="border-r border-white/[0.07] bg-[#080a12]">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Conexiones aceptadas</p>
              <h1 className="mt-1 text-2xl font-extrabold">Mensajes</h1>
            </div>
            <button
              aria-label="Actualizar conversaciones"
              className="rounded-xl p-2.5 text-slate-500 hover:bg-white/5 hover:text-blue-300"
              onClick={loadChats}
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
          <Input
            className="mt-5"
            icon={Search}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar conversaciones..."
            value={query}
          />
        </div>

        <div className="max-h-[360px] overflow-y-auto lg:max-h-[calc(100vh-190px)]">
          {visibleChats.map((chat) => {
            const person = counterpart(chat, user.idUsuario);
            const last = chat.mensajes?.[0];
            return (
              <button
                className={`flex w-full gap-3 border-t border-white/[0.06] p-5 text-left transition ${
                  active?.idChat === chat.idChat
                    ? "bg-blue-500/10"
                    : "hover:bg-white/[0.03]"
                }`}
                key={chat.idChat}
                onClick={() => setActiveId(chat.idChat)}
              >
                <TrainerAvatar
                  className="size-12 shrink-0 rounded-full"
                  index={(chat.solicitud.idEntrenador - 1) % 6}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="truncate">
                      {person.nombre} {person.apellido}
                    </strong>
                    {last && (
                      <span className="shrink-0 text-xs text-slate-600">
                        {messageTime(last.fechaEnvio)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {last?.contenido ?? "Conversación iniciada"}
                  </p>
                </div>
              </button>
            );
          })}
          {!visibleChats.length && (
            <p className="border-t border-white/[0.06] px-5 py-8 text-center text-sm text-slate-500">
              No encontramos conversaciones.
            </p>
          )}
        </div>
      </aside>

      <section className="flex min-h-[620px] flex-col lg:min-h-0">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <TrainerAvatar
              className="size-11 shrink-0 rounded-full"
              index={(active.solicitud.idEntrenador - 1) % 6}
            />
            <div className="min-w-0">
              <strong className="block truncate">
                {other.nombre} {other.apellido}
              </strong>
              <StatusBadge className="mt-1" tone="green">
                Conexión aceptada
              </StatusBadge>
            </div>
          </div>
          {otherIsTrainer && (
            <Link to={`/entrenadores/${active.solicitud.idEntrenador}`}>
              <Button size="sm" variant="secondary">
                Ver Perfil <ArrowUpRight className="size-4" />
              </Button>
            </Link>
          )}
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-10">
          {loadingMessages ? (
            <div className="grid h-full place-items-center text-slate-500">
              <div className="text-center">
                <LoaderCircle className="mx-auto size-7 animate-spin text-blue-400" />
                <p className="mt-3 text-sm">Actualizando mensajes...</p>
              </div>
            </div>
          ) : messages.length ? (
            messages.map((message) => {
              const mine = message.idUsuario === user.idUsuario;
              return (
                <div
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  key={message.idMensaje}
                >
                  <div
                    className={`max-w-xl rounded-[22px] px-5 py-4 ${
                      mine
                        ? "rounded-br-md bg-blue-600 text-white shadow-[0_14px_35px_rgba(37,99,235,.18)]"
                        : "rounded-bl-md border border-white/10 bg-[#10131f] text-slate-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-7">
                      {message.contenido}
                    </p>
                    <p
                      className={`mt-2 text-xs ${
                        mine ? "text-blue-200" : "text-slate-600"
                      }`}
                    >
                      {messageTime(message.fechaEnvio)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <MessageSquare className="mx-auto size-9 text-blue-400" />
                <p className="mt-3 font-bold">La conversación está lista</p>
                <p className="mt-1 text-sm text-slate-500">
                  Enviá el primer mensaje para empezar.
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="border-t border-white/[0.07] p-4" onSubmit={send}>
          {messageError && (
            <p className="mb-3 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {messageError}
            </p>
          )}
          <div className="flex gap-3 rounded-2xl border border-white/10 bg-[#10131f] p-2 focus-within:border-blue-500/50">
            <input
              className="min-w-0 flex-1 bg-transparent px-3 text-white outline-none placeholder:text-slate-600"
              disabled={sending}
              onChange={(event) => setText(event.target.value)}
              placeholder="Escribí un mensaje..."
              value={text}
            />
            <Button
              aria-label="Enviar mensaje"
              className="size-12 shrink-0 rounded-xl p-0"
              disabled={sending || !text.trim()}
              type="submit"
            >
              {sending ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <Send className="size-5" />
              )}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
