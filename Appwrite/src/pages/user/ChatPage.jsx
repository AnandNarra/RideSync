import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useGetMessages, useSendMessage } from "../../api's/chat/chat.query";
import useAuthStore from '@/store/authStore';
import { ArrowLeft, Send, User, MessageSquare } from 'lucide-react';

const ChatPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const [text, setText] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const { data: chatData, isLoading } = useGetMessages(bookingId);
    const { mutate: sendMessage, isPending: isSending } = useSendMessage();

    const messages = chatData?.data || [];
    const otherUser = chatData?.otherUser || { fullName: 'User' };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim() || isSending) return;

        sendMessage({ bookingId, text: text.trim() });
        setText('');
        inputRef.current?.focus();
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, msg) => {
        const date = formatDate(msg.createdAt);
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
        return groups;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    >
                        <ArrowLeft size={18} className="text-slate-600" />
                    </button>
                    <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-slate-100 bg-slate-100 flex items-center justify-center shrink-0">
                        {otherUser.profilePhoto ? (
                            <img src={otherUser.profilePhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} className="text-slate-300" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-black text-slate-900 truncate">{otherUser.fullName}</h2>
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Online • Auto-refreshing</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-100">
                                <MessageSquare size={32} className="text-blue-200" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">Start the conversation</h3>
                            <p className="text-slate-400 mt-2 text-sm font-medium">Say hi to {otherUser.fullName}! 👋</p>
                        </div>
                    ) : (
                        Object.entries(groupedMessages).map(([date, msgs]) => (
                            <div key={date}>
                                {/* Date separator */}
                                <div className="flex items-center justify-center my-4">
                                    <span className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-2 rounded-full shadow-sm border border-slate-100">
                                        {date}
                                    </span>
                                </div>

                                {/* Messages for this date */}
                                <div className="space-y-2">
                                    {msgs.map((msg) => {
                                        const isMine = msg.senderId?._id === user?._id;
                                        return (
                                            <div
                                                key={msg._id}
                                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] px-5 py-3 shadow-sm ${isMine
                                                            ? 'bg-slate-900 text-white rounded-[1.25rem] rounded-br-md'
                                                            : 'bg-white text-slate-800 rounded-[1.25rem] rounded-bl-md border border-slate-100'
                                                        }`}
                                                >
                                                    <p className="text-sm font-medium leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                                                    <p className={`text-[10px] mt-1.5 font-bold ${isMine ? 'text-slate-400' : 'text-slate-400'}`}>
                                                        {formatTime(msg.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Bar */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-slate-100">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message..."
                        maxLength={1000}
                        className="flex-1 bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-blue-50 rounded-2xl py-4 px-6 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-300"
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || isSending}
                        className="w-14 h-14 bg-slate-900 hover:bg-black text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shrink-0"
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send size={18} />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;
