import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { registerSocketUser, socket } from "@/lib/socket";

import { apiUrl } from "@/lib/api";
function AdminChatPanel({ currentUser, targetUserId = "", title = "Support Chat", allowedRoles = [] }) {
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(targetUserId);
  const [chatId, setChatId] = useState("");
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setSelectedContactId(targetUserId || "");
  }, [targetUserId]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(apiUrl("/api/chat/contacts"), {
          withCredentials: true,
        });
        const nextContacts = (response.data?.data || []).filter((contact) =>
          allowedRoles.length ? allowedRoles.includes(contact.role) : true
        );
        setContacts(nextContacts);
        if (!targetUserId && !selectedContactId && nextContacts[0]?._id) {
          setSelectedContactId(nextContacts[0]._id);
        }
      } catch (error) {
        setContacts([]);
      }
    };

    fetchContacts();
  }, [allowedRoles, selectedContactId, targetUserId]);

  useEffect(() => {
    if (!selectedContactId) {
      return;
    }

    const openChat = async () => {
      try {
        const chatResponse = await axios.post(
          apiUrl("/api/chat/create"),
          { userId: selectedContactId },
          { withCredentials: true }
        );
        const nextChatId = chatResponse.data?.data?._id || "";
        setChatId(nextChatId);
        const response = await axios.get(apiUrl(`/api/chat/${nextChatId}`), {
          withCredentials: true,
        });
        setMessages(response.data?.messages || []);
      } catch (error) {
        setMessages([]);
      }
    };

    openChat();
  }, [selectedContactId]);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    registerSocketUser(currentUser);
    socket.emit("chat:join", `chat:${chatId}`);
    const handleMessage = (payload) => {
      if (String(payload.chatId) !== String(chatId)) {
        return;
      }
      setMessages((current) => [...current, payload.message]);
    };
    socket.on("chat:message", handleMessage);

    return () => {
      socket.emit("chat:leave", `chat:${chatId}`);
      socket.off("chat:message", handleMessage);
    };
  }, [chatId]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!chatId || !body.trim()) {
      return;
    }

    try {
      await axios.post(
        apiUrl("/api/chat/message"),
        {
          chatId,
          text: body,
        },
        {
          withCredentials: true,
        }
      );
      setBody("");
      toast({
        title: "Message sent successfully",
      });
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {!targetUserId ? (
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={selectedContactId}
            onChange={(event) => setSelectedContactId(event.target.value)}
          >
            {contacts.map((contact) => (
              <option key={contact._id} value={contact._id}>
                {contact.userName} ({contact.role})
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <div className="mt-4 h-72 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
        {messages.length ? (
          messages.map((message, index) => (
            <div
              key={`${message.senderId}-${message.timestamp}-${index}`}
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                String(message.senderId) === String(currentUser?.id)
                  ? "ml-auto bg-slate-900 text-white"
                  : "bg-white text-slate-900"
              }`}
            >
              <p>{message.text}</p>
              <p className="mt-1 text-[11px] opacity-70">
                {new Date(message.timestamp || Date.now()).toLocaleString("en-IN")}
              </p>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-500">No messages yet.</div>
        )}
      </div>
      <form onSubmit={sendMessage} className="mt-4 flex gap-3">
        <input
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Type a message"
        />
        <button className="rounded-xl bg-slate-900 px-4 py-2 text-white" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}

export default AdminChatPanel;
