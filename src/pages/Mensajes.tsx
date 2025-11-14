import React, { useState } from 'react';
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export default function Mensajes() {
  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'Juan', content: '¿Cuándo puedes entregar el material?', timestamp: '14:30', isOwn: false },
    { id: '2', sender: 'Tú', content: 'Mañana a las 10 AM en Monterrey', timestamp: '14:32', isOwn: true },
    { id: '3', sender: 'Juan', content: '¡Perfecto! ¿Cuál es tu ubicación exacta?', timestamp: '14:33', isOwn: false },
  ]);

  const conversations: Conversation[] = [
    { id: '1', name: 'Juan García', avatar: '👨‍💼', lastMessage: '¿Cuál es tu ubicación exacta?', timestamp: 'Hace 2 min', unread: 1, online: true },
    { id: '2', name: 'María López', avatar: '👩‍💼', lastMessage: 'Recibido, muchas gracias', timestamp: 'Hace 1h', unread: 0, online: false },
    { id: '3', name: 'Carlos Ruiz', avatar: '👨‍🔧', lastMessage: 'El material está verificado', timestamp: 'Hace 3h', unread: 0, online: true },
    { id: '4', name: 'Ana Martínez', avatar: '👩‍🌾', lastMessage: 'Interesado en cartón y papel', timestamp: 'Ayer', unread: 2, online: true },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          sender: 'Tú',
          content: messageInput,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: true,
        },
      ]);
      setMessageInput('');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-emerald-200 dark:border-emerald-800 px-6 md:px-8 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">💬 Mensajes</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-4 p-6">
        {/* Chat List */}
        <div className="w-full md:w-80 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-emerald-200 dark:border-emerald-700">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`w-full px-4 py-3 border-b border-gray-100 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-3 ${
                  selectedConversation === conversation.id
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-l-emerald-600'
                    : ''
                }`}
              >
                {/* Avatar with Online Status */}
                <div className="relative">
                  <div className="text-3xl">{conversation.avatar}</div>
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>

                {/* Message Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{conversation.name}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">{conversation.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{conversation.lastMessage}</p>
                </div>

                {/* Unread Badge */}
                {conversation.unread > 0 && (
                  <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                    {conversation.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        {currentConversation && (
          <div className="hidden md:flex flex-1 flex-col bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 shadow-lg overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{currentConversation.avatar}</div>
                <div>
                  <h3 className="font-semibold">{currentConversation.name}</h3>
                  <p className="text-xs text-emerald-100">
                    {currentConversation.online ? 'En línea' : 'Desconectado'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-emerald-700 rounded-lg transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-emerald-700 rounded-lg transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-emerald-700 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-700/50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      message.isOwn
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.isOwn ? 'text-emerald-100' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t border-emerald-200 dark:border-emerald-700 p-4 flex gap-3">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

