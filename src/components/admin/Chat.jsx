// components/admin/Chat.jsx - DIPERBAIKI
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getAllChats, 
  getChatMessages, 
  sendMessage, 
  sendMessageWithFile,
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
  const [uploadingFile, setUploadingFile] = useState(false);
  const [userTyping, setUserTyping] = useState({});
  const chatSocket = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Initialize chat socket connection dengan useCallback
  const initializeChatSocketConnection = useCallback(() => {
    try {
      const newSocket = initializeChatSocket();
      chatSocket.current = newSocket;

      // Setup listeners langsung
      setupChatSocketListeners(newSocket, {
        onNewMessage: (data) => {
          console.log('📨 New message received in admin:', data);
          
          // Update chats list secara realtime
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

          // Add message to current chat secara realtime
          if (selectedChat !== null && chats[selectedChat] && 
              (chats[selectedChat].userId === data.userId || chats[selectedChat].id === data.chatId)) {
            
            const newMsg = {
              id: Date.now().toString(),
              sender: data.sender,
              message: data.message,
              time: new Date().toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              read: true,
              fileUrl: data.fileUrl || null,
              fileName: data.fileName || null,
              fileType: data.fileType || null
            };
            
            setMessages(prev => [...prev, newMsg]);

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

      // Join admin room segera
      joinChatRoom(newSocket, null, 'admin');

    } catch (error) {
      console.error('❌ Failed to initialize chat socket:', error);
    }
  }, [selectedChat, chats]);

  // Load chats
  const loadChats = useCallback(async () => {
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
  }, [loadChats, initializeChatSocketConnection]);

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
      
      // Add message optimistically - TANPA DELAY
      const tempMessage = {
        id: `temp-${Date.now()}`,
        sender: 'admin',
        message: messageText,
        time: new Date().toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        read: true
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Stop typing indicator
      handleTyping(false);
      
      // Send via API - REAL TIME
      await sendMessage(currentChat.id, currentChat.userId, {
        message: messageText,
        sender: 'admin'
      });
      
      // Send via socket - REAL TIME
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
      
      // Remove temporary flag langsung
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, id: `confirmed-${Date.now()}` }
            : msg
        )
      );
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Gagal mengirim pesan. Silakan coba lagi.');
      
      // Remove failed message
      setMessages(prev => 
        prev.filter(msg => msg.id !== `temp-${Date.now()}`)
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !chats[selectedChat]) {
      console.log('❌ Cannot upload file: No chat selected');
      return;
    }

    const currentChat = chats[selectedChat];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Hanya file gambar (JPG, JPEG, PNG, GIF, WEBP) yang diizinkan!');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB!');
      return;
    }

    try {
      setUploadingFile(true);
      
      // Add temporary message untuk file
      const tempMessage = {
        id: `file-temp-${Date.now()}`,
        sender: 'admin',
        message: `Mengupload file: ${file.name}`,
        time: new Date().toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        read: true,
        fileUrl: null,
        fileName: file.name,
        fileType: file.type,
        isUploading: true
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      // Upload file dan kirim message
      console.log('📎 Uploading file as admin:', file.name);
      const result = await sendMessageWithFile(
        currentChat.id, 
        currentChat.userId, 
        {
          message: `[File: ${file.name}]`,
          sender: 'admin'
        },
        file
      );
      
      console.log('✅ File uploaded successfully:', result);
      
      // Update message dengan file URL
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { 
                ...msg, 
                id: `file-confirmed-${Date.now()}`,
                fileUrl: result.message?.fileUrl || `/uploads/chat/${file.name}`,
                isUploading: false
              }
            : msg
        )
      );
      
      // Update chats list
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === currentChat.id 
            ? { 
                ...chat, 
                lastMessage: `[File] ${file.name}`,
                time: 'Baru saja',
                unread: 0
              }
            : chat
        )
      );
      
      // Kirim via socket juga
      if (chatSocket.current) {
        const messagePayload = {
          chatId: currentChat.id,
          userId: currentChat.userId,
          message: `[File: ${file.name}]`,
          sender: 'admin',
          fileUrl: result.message?.fileUrl || `/uploads/chat/${file.name}`,
          fileName: file.name,
          fileType: file.type
        };
        sendMessageViaSocket(chatSocket.current, messagePayload);
      }
      
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      alert('Gagal mengupload file. Silakan coba lagi.');
      
      // Remove failed file message
      setMessages(prev => 
        prev.filter(msg => !msg.isUploading)
      );
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    event.target.value = '';
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

  const renderMessageContent = (msg) => {
    if (msg.fileUrl && msg.fileName) {
      return (
        <div className="space-y-2">
          <p className="text-sm xs:text-base break-words">
            {msg.message}
          </p>
          <div className="bg-white/50 rounded-xl p-2 border border-amber-200">
            {msg.fileType?.startsWith('image/') ? (
              <div className="space-y-2">
                <img 
                  src={`https://serverraharpashopp-production-f317.up.railway.app${msg.fileUrl}`} 
                  alt={msg.fileName}
                  className="max-w-full h-auto rounded-lg max-h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden bg-amber-50 rounded-lg p-4 text-center">
                  <i className="bx bx-image text-2xl text-amber-600 mb-2"></i>
                  <p className="text-xs text-amber-700 break-words">{msg.fileName}</p>
                  <p className="text-[10px] text-amber-600 mt-1">Gambar tidak dapat dimuat</p>
                </div>
                {msg.isUploading && (
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600"></div>
                    Mengupload...
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-2">
                <i className="bx bx-file text-2xl text-amber-600"></i>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-800 truncate">
                    {msg.fileName}
                  </p>
                  <p className="text-[10px] text-amber-600">
                    File attachment
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <p className="text-sm xs:text-base break-words">{msg.message}</p>
    );
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
                                {msg.isUploading && (
                                  <span className="text-amber-600 text-xs ml-1">mengupload...</span>
                                )}
                              </span>
                            </div>
                            <div className={`rounded-2xl p-3 xs:p-4 shadow-lg
                                          ${msg.sender === 'admin' 
                                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-br-none' 
                                            : 'bg-white text-gray-800 border border-amber-100 rounded-bl-none'
                                          }`}>
                              {renderMessageContent(msg)}
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
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  disabled={uploadingFile || isSending}
                />
                
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  {/* File Upload Button */}
                  <button 
                    type="button"
                    onClick={handleFileButtonClick}
                    disabled={uploadingFile || isSending}
                    className="p-2 xs:p-3 rounded-xl bg-amber-100 text-amber-600 
                             hover:bg-amber-200 transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center"
                  >
                    {uploadingFile ? (
                      <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <i className='bx bx-paperclip text-lg xs:text-xl'></i>
                    )}
                  </button>
                  
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
                      disabled={isSending || uploadingFile}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || isSending || uploadingFile}
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
                
                {/* File Type Info */}
                <p className="text-[10px] xs:text-xs text-gray-500 text-center mt-2">
                  Support: JPG, PNG, GIF, WEBP (Max 5MB)
                  {(isSending || uploadingFile) && (
                    <span className="text-amber-600 ml-1">• Mengirim...</span>
                  )}
                </p>
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