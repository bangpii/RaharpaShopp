// components/admin/Chat.jsx - DIPERBAIKI
import React, { useState, useEffect, useRef } from 'react';
import { 
  getAllChats, 
  getChatMessages, 
  sendMessage, 
  initializeChatSocket, 
  setupChatSocketListeners,
  joinChatRoom,
  sendMessageViaSocket,
  sendTypingIndicator,
  cleanupChatSocket
} from '../../api/Api_chat';

const Chat = ({ onNavigate }) => {
  const [selectedChat, setSelectedChat] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userTyping, setUserTyping] = useState({});
  const chatSocket = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Load chats dan initialize socket
  useEffect(() => {
    loadChats();
    initializeChatSocketConnection();

    return () => {
      if (chatSocket.current) {
        cleanupChatSocket(chatSocket.current);
        if (chatSocket.current.close) {
          chatSocket.current.close();
        }
      }
    };
  }, []);

  // Load messages ketika chat dipilih
  useEffect(() => {
    if (selectedChat !== null && chats[selectedChat]) {
      loadChatMessages(chats[selectedChat].id);
    }
  }, [selectedChat, chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChatSocketConnection = () => {
    try {
      const newSocket = initializeChatSocket();
      chatSocket.current = newSocket;

      setupChatSocketListeners(newSocket, {
        onNewMessage: (data) => {
          console.log('📨 New message received in admin:', data);
          
          // Update chats list
          setChats(prevChats => {
            const updatedChats = prevChats.map(chat => {
              if (chat.userId === data.userId || chat.id === data.chatId) {
                return {
                  ...chat,
                  lastMessage: data.message,
                  time: 'Baru saja',
                  unread: chat.id === selectedChat ? 0 : chat.unread + 1
                };
              }
              return chat;
            });
            
            // Sort by last message time
            return updatedChats.sort((a, b) => {
              if (a.time === 'Baru saja') return -1;
              if (b.time === 'Baru saja') return 1;
              return 0;
            });
          });

          // Add message to current chat jika chat yang aktif
          if (selectedChat !== null && chats[selectedChat] && 
              (chats[selectedChat].userId === data.userId || chats[selectedChat].id === data.chatId)) {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              sender: data.sender,
              message: data.message,
              time: new Date().toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              read: true
            }]);

            // Show notification
            showNotification(`Pesan baru dari ${data.userName}`, data.message);
          }
        },
        onUserTyping: (data) => {
          setUserTyping(prev => ({
            ...prev,
            [data.userId]: data.isTyping
          }));

          // Clear previous timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          // Auto clear typing indicator setelah 3 detik
          if (data.isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              setUserTyping(prev => ({
                ...prev,
                [data.userId]: false
              }));
            }, 3000);
          }
        },
        onUserOnline: (data) => {
          console.log('🟢 User online:', data);
          setChats(prevChats => 
            prevChats.map(chat => 
              chat.userId === data.userId 
                ? { ...chat, online: true, lastOnline: 'Online' }
                : chat
            )
          );
        },
        onUserOffline: (data) => {
          console.log('🔴 User offline:', data);
        },
        onChatUpdated: (data) => {
          console.log('🔄 Chat updated:', data);
          if (data.action === 'new-message') {
            loadChats(); // Reload chats list
          }
        },
        onError: (error) => {
          console.error('❌ Socket error in admin:', error);
        }
      });

      // Join admin room
      joinChatRoom(newSocket, null, 'admin');

    } catch (error) {
      console.error('❌ Failed to initialize chat socket:', error);
    }
  };

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const chatsData = await getAllChats();
      setChats(chatsData);
    } catch (error) {
      console.error('❌ Error loading chats:', error);
      // Fallback data
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatMessages = async (chatId) => {
    if (!chatId) return;
    
    try {
      setIsLoading(true);
      const chatData = await getChatMessages(chatId, true); // Mark as read
      setMessages(chatData.messages || []);
    } catch (error) {
      console.error('❌ Error loading chat messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chats[selectedChat] || isSending) return;

    const messageText = newMessage.trim();
    const currentChat = chats[selectedChat];
    
    try {
      setIsSending(true);
      
      // Add message optimistically
      const tempMessage = {
        id: `temp-${Date.now()}`,
        sender: 'admin',
        message: messageText,
        time: new Date().toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        read: true,
        isSending: true
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Stop typing indicator
      handleTyping(false);
      
      // Send via API
      await sendMessage(currentChat.id, currentChat.userId, {
        message: messageText,
        sender: 'admin'
      });
      
      // Send via socket
      if (chatSocket.current) {
        sendMessageViaSocket(chatSocket.current, {
          chatId: currentChat.id,
          userId: currentChat.userId,
          message: messageText,
          sender: 'admin'
        });
      }
      
      // Update chats list
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === currentChat.id 
            ? { 
                ...chat, 
                lastMessage: messageText,
                time: 'Baru saja',
                unread: 0
              }
            : chat
        )
      );
      
      // Remove temporary flag
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, isSending: false }
            : msg
        )
      );
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Gagal mengirim pesan. Silakan coba lagi.');
      
      // Remove failed message
      setMessages(prev => 
        prev.filter(msg => !msg.isSending)
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (typing) => {
    if (!chatSocket.current || !chats[selectedChat]) return;
    
    sendTypingIndicator(chatSocket.current, 'admin', typing);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 3000);
    }
  };

  const handleContactClick = (index) => {
    setSelectedChat(index);
    if (isMobile) {
      setShowChat(true);
    }
  };

  const handleBackClick = () => {
    setShowChat(false);
  };

  const handleDashboardClick = () => {
    if (onNavigate) {
      onNavigate('Dashboard');
    }
  };

  const handleChatRefresh = () => {
    setSelectedChat(0);
    setSearchTerm('');
    setShowChat(false);
    loadChats();
    
    if (onNavigate) {
      onNavigate('Chat');
    }
  };

  const showNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body, icon: "/favicon.ico" });
        }
      });
    }
  };

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentChat = selectedChat !== null ? filteredChats[selectedChat] : null;
  const isUserTyping = currentChat && userTyping[currentChat.userId];

  return (
    <div className="space-y-4 xs:space-y-6 overflow-x-hidden min-h-screen bg-gray-50 sm:overflow-x-visible">
      {/* Header dengan Breadcrumb */}
      <div className="flex flex-col px-3 xs:px-4 sm:px-6 pt-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs xs:text-sm text-gray-500 mb-1 xs:mb-2">
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleDashboardClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <i className='bx bx-home text-base xs:text-lg text-amber-700'></i>
              <span className="text-amber-700 font-semibold">Dashboard</span>
            </button>
            <i className='bx bx-chevron-right text-gray-400'></i>
            <button 
              onClick={handleChatRefresh}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <i className='bx bx-chat text-base xs:text-lg text-amber-700'></i>
              <span className="text-amber-700 font-semibold">Chat</span>
            </button>
          </div>
        </div>
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">CHAT OBROLAN</h1>
            <p className="text-gray-600 mt-1 text-xs xs:text-sm lg:text-base">Kelola chat pelanggan dengan mudah dan efisien</p>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-2xl mx-3 xs:mx-4 sm:mx-6 p-3 xs:p-4 sm:p-6 
                     shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
                     border border-amber-100 mb-6">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] min-h-[500px] max-h-[800px] rounded-xl overflow-hidden 
                       shadow-[inset_0_2px_8px_rgba(186,118,48,0.05)] gap-0 lg:gap-4">
          
          {/* Sidebar Kontak - Card Terpisah */}
          <div className={`lg:w-1/3 bg-amber-25 flex flex-col rounded-xl
                         shadow-[0_4px_12px_rgba(186,118,48,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]
                         border border-amber-100
                         ${showChat ? 'hidden lg:flex' : 'flex'} ${isMobile ? 'h-full' : ''}`}>
            
            {/* Search Bar */}
            <div className="p-3 xs:p-4 border-b border-amber-100 bg-white rounded-t-xl">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className='bx bx-search text-gray-400 text-sm xs:text-base'></i>
                </div>
                <input
                  type="text"
                  placeholder="Cari percakapan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 xs:py-2.5 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           bg-gray-50 hover:bg-white transition-colors duration-200
                           text-xs xs:text-sm placeholder-gray-400"
                />
              </div>
            </div>

            {/* List Kontak dengan Scroll */}
            <div className="flex-1 overflow-y-auto rounded-b-xl custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <i className='bx bx-chat text-3xl mb-2'></i>
                  <p className="text-sm">Tidak ada chat</p>
                </div>
              ) : (
                filteredChats.map((chat, index) => (
                  <div
                    key={chat.id}
                    onClick={() => handleContactClick(index)}
                    className={`p-3 xs:p-4 border-b border-amber-50 cursor-pointer transition-all duration-200
                              ${selectedChat === index 
                                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' 
                                : 'hover:bg-amber-50'
                              }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar dengan status online */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 xs:w-12 xs:h-12 rounded-2xl flex items-center justify-center text-white
                                      ${selectedChat === index 
                                        ? 'bg-amber-800' 
                                        : 'bg-gradient-to-br from-amber-600 to-amber-700'
                                      }`}>
                          <i className='bx bx-user text-base xs:text-lg'></i>
                        </div>
                        {/* Online Indicator */}
                        {chat.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      {/* Konten */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold truncate text-sm xs:text-base
                                       ${selectedChat === index ? 'text-white' : 'text-gray-800'}`}>
                            {chat.name}
                          </h3>
                          <span className={`text-xs ${selectedChat === index ? 'text-amber-100' : 'text-gray-500'}`}>
                            {chat.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`truncate text-xs xs:text-sm
                                      ${selectedChat === index ? 'text-amber-100' : 'text-gray-600'}`}>
                            {chat.lastMessage}
                          </p>
                          {/* Notifikasi Unread */}
                          {chat.unread > 0 && (
                            <span className={`flex items-center justify-center min-w-5 h-5 rounded-full text-xs font-semibold
                                           ${selectedChat === index 
                                             ? 'bg-white text-amber-700' 
                                             : 'bg-amber-600 text-white'
                                           }`}>
                              {chat.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Area Chat - Card Terpisah */}
          <div className={`lg:w-2/3 flex flex-col rounded-xl
                         shadow-[0_4px_12px_rgba(186,118,48,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]
                         border border-amber-100 bg-white
                         ${showChat ? 'flex' : 'hidden lg:flex'} ${isMobile ? 'h-full' : ''}`}>
            
            {/* Header Chat dengan Back Button untuk Mobile */}
            <div className="p-3 xs:p-4 border-b border-amber-100 bg-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Back Button untuk Mobile */}
                  <button 
                    onClick={handleBackClick}
                    className="lg:hidden p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <i className='bx bx-arrow-back text-lg'></i>
                  </button>
                  
                  {currentChat ? (
                    <>
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 
                                    flex items-center justify-center text-white">
                        <i className='bx bx-user text-lg'></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm xs:text-base">
                          {currentChat.name}
                        </h3>
                        <p className={`text-xs flex items-center gap-1 ${
                          currentChat.online ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {currentChat.online ? (
                            <>
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              Online
                              {isUserTyping && (
                                <span className="text-amber-600 italic"> - mengetik...</span>
                              )}
                            </>
                          ) : (
                            `Terakhir online ${currentChat.lastOnline}`
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 
                                    flex items-center justify-center text-white">
                        <i className='bx bx-user text-lg'></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm xs:text-base">
                          Pilih Percakapan
                        </h3>
                        <p className="text-xs text-gray-500">
                          Pilih chat untuk memulai obrolan
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Area Pesan */}
            <div className="flex-1 p-3 xs:p-4 overflow-y-auto bg-gradient-to-b from-white to-amber-25 custom-scrollbar">
              {currentChat ? (
                <>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-3 xs:space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2 xs:gap-3 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.sender === 'user' && (
                            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 
                                          flex items-center justify-center text-white flex-shrink-0">
                              <i className='bx bx-user text-sm'></i>
                            </div>
                          )}
                          
                          <div className={`max-w-[70%] xs:max-w-xs sm:max-w-sm ${msg.sender === 'admin' ? 'text-right' : ''}`}>
                            <div className={`mb-1 ${msg.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                              <span className="text-xs font-semibold text-gray-600">
                                {msg.sender === 'admin' ? 'Anda' : currentChat.name}
                                {msg.isSending && (
                                  <span className="text-amber-600 text-xs ml-1">mengirim...</span>
                                )}
                              </span>
                            </div>
                            <div className={`rounded-2xl p-3 xs:p-4 shadow-lg
                                          ${msg.sender === 'admin' 
                                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-br-none' 
                                            : 'bg-white text-gray-800 border border-amber-100 rounded-bl-none'
                                          }`}>
                              <p className="text-sm xs:text-base break-words">{msg.message}</p>
                              <p className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-amber-100' : 'text-gray-500'}`}>
                                {msg.time}
                              </p>
                            </div>
                          </div>

                          {msg.sender === 'admin' && (
                            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 
                                          flex items-center justify-center text-white flex-shrink-0">
                              <i className='bx bx-user text-sm'></i>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Typing Indicator */}
                      {isUserTyping && (
                        <div className="flex items-start gap-2 xs:gap-3">
                          <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 
                                        flex items-center justify-center text-white flex-shrink-0">
                            <i className='bx bx-user text-sm'></i>
                          </div>
                          <div className="max-w-xs">
                            <div className="bg-white text-gray-800 border border-amber-100 rounded-2xl rounded-bl-none p-3 xs:p-4 shadow-lg">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <i className='bx bx-chat text-5xl mb-4'></i>
                  <p className="text-lg font-medium mb-2">Pilih Percakapan</p>
                  <p className="text-sm text-center">Pilih chat dari daftar untuk memulai obrolan dengan pelanggan</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            {currentChat && (
              <div className="p-3 xs:p-4 border-t border-amber-100 bg-white rounded-b-xl">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        if (e.target.value.trim()) {
                          handleTyping(true);
                        } else {
                          handleTyping(false);
                        }
                      }}
                      onBlur={() => handleTyping(false)}
                      placeholder="Ketik pesan..."
                      className="w-full px-3 xs:px-4 py-2 xs:py-3 border border-amber-200 rounded-xl 
                               focus:ring-2 focus:ring-amber-500 focus:border-transparent
                               bg-amber-50 hover:bg-white transition-colors duration-200
                               text-sm xs:text-base placeholder-gray-400"
                      disabled={isSending}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="p-2 xs:p-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 
                             text-white hover:from-amber-700 hover:to-amber-800 transition-all duration-200
                             shadow-[0_4px_12px_rgba(186,118,48,0.3)] disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <i className='bx bx-send text-lg xs:text-xl'></i>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS untuk scrollbar */}
      <style>{`
        .custom-scrollbar {
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #FFF transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FFF;
          border-radius: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #FFF;
        }
      `}</style>
    </div>
  )
}

export default Chat