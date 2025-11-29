// components/admin/Chat.jsx - FIXED DOWNLOAD & IMAGE PADDING
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
  const [selectedChat, setSelectedChat] = useState(null);
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Refs untuk menghindari infinite loop
  const chatSocket = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageViewerRef = useRef(null);
  const socketInitialized = useRef(false);
  const isInitialMount = useRef(true);
  const selectedChatRef = useRef(selectedChat);
  const chatsRef = useRef(chats);
  const messagesRef = useRef(messages);

  // Sync refs dengan state
  useEffect(() => {
    selectedChatRef.current = selectedChat;
    chatsRef.current = chats;
    messagesRef.current = messages;
  }, [selectedChat, chats, messages]);

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

  // Load chats function - TANPA dependencies
  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const chatsData = await getAllChats();
      setChats(chatsData);
    } catch (error) {
      console.error('❌ Error loading chats:', error);
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Realtime message handler - DIPISAH dari socket initialization
  const handleRealtimeMessage = useCallback((data) => {
    console.log('📨 New message received in admin:', data);
    
    if (!data || data.sender !== 'user') return;

    // Update chats list secara realtime
    setChats(prevChats => {
      const chatExists = prevChats.some(chat => 
        chat.userId === data.userId || chat.id === data.chatId
      );

      if (!chatExists) {
        return [{
          id: data.chatId,
          userId: data.userId,
          name: data.userName || 'User',
          lastMessage: data.message,
          time: 'Baru saja',
          unread: 1,
          online: true,
          lastOnline: 'Online'
        }, ...prevChats];
      }

      return prevChats.map(chat => {
        if (chat.userId === data.userId || chat.id === data.chatId) {
          const currentSelectedChat = selectedChatRef.current !== null ? 
            chatsRef.current[selectedChatRef.current] : null;
          const isCurrentChat = currentSelectedChat && 
            (currentSelectedChat.userId === data.userId || currentSelectedChat.id === data.chatId);
          
          return {
            ...chat,
            lastMessage: data.message,
            time: 'Baru saja',
            unread: isCurrentChat ? 0 : (chat.unread || 0) + 1
          };
        }
        return chat;
      }).sort((a, b) => {
        if (a.time === 'Baru saja' && b.time !== 'Baru saja') return -1;
        if (b.time === 'Baru saja' && a.time !== 'Baru saja') return 1;
        return 0;
      });
    });

    // Add message to current chat secara realtime
    setMessages(prevMessages => {
      const currentSelectedChat = selectedChatRef.current !== null ? 
        chatsRef.current[selectedChatRef.current] : null;
      
      if (currentSelectedChat && (currentSelectedChat.userId === data.userId || currentSelectedChat.id === data.chatId)) {
        // Cek apakah message sudah ada untuk menghindari duplikasi
        const messageExists = prevMessages.some(msg => 
          msg.id === data.messageId || 
          (msg.message === data.message && msg.time === new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }))
        );

        if (messageExists) return prevMessages;

        const newMsg = {
          id: data.messageId || `msg-${Date.now()}`,
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
        
        return [...prevMessages, newMsg];
      }
      return prevMessages;
    });

    // Show notification hanya jika bukan chat aktif
    const currentSelectedChat = selectedChatRef.current !== null ? 
      chatsRef.current[selectedChatRef.current] : null;
    
    if (!currentSelectedChat || (currentSelectedChat.userId !== data.userId && currentSelectedChat.id !== data.chatId)) {
      showNotification(`Pesan baru dari ${data.userName || 'User'}`, data.message);
    }
  }, []);

  // Initialize chat socket connection - DIPERBAIKI
  const initializeChatSocketConnection = useCallback(() => {
    if (socketInitialized.current || chatSocket.current) {
      console.log('🔌 Socket already initialized');
      return;
    }

    try {
      console.log('🔌 Initializing admin chat socket connection...');
      const newSocket = initializeChatSocket();
      
      if (!newSocket) {
        console.error('❌ Failed to create socket');
        return;
      }

      chatSocket.current = newSocket;
      socketInitialized.current = true;

      // Setup listeners dengan handler yang sudah dipisah
      setupChatSocketListeners(newSocket, {
        onNewMessage: handleRealtimeMessage,
        onUserTyping: (data) => {
          console.log('⌨️ Typing indicator received:', data);
          if (data.userId && data.userId !== 'admin') {
            setUserTyping(prev => ({
              ...prev,
              [data.userId]: data.isTyping
            }));

            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }

            if (data.isTyping) {
              typingTimeoutRef.current = setTimeout(() => {
                setUserTyping(prev => ({
                  ...prev,
                  [data.userId]: false
                }));
              }, 3000);
            }
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
          setChats(prevChats => 
            prevChats.map(chat => 
              chat.userId === data.userId 
                ? { ...chat, online: false, lastOnline: 'Beberapa saat lalu' }
                : chat
            )
          );
        },
        onChatUpdated: (data) => {
          console.log('🔄 Chat updated:', data);
          if (data.action === 'new-chat') {
            loadChats();
          }
        },
        onError: (error) => {
          console.error('❌ Socket error in admin:', error);
        }
      });

      // Join admin room ketika socket connected
      newSocket.on('connect', () => {
        console.log('✅ Admin socket connected successfully');
        joinChatRoom(newSocket, null, 'admin');
      });

      if (newSocket.connected) {
        joinChatRoom(newSocket, null, 'admin');
      }

    } catch (error) {
      console.error('❌ Failed to initialize chat socket:', error);
      socketInitialized.current = false;
    }
  }, [handleRealtimeMessage, loadChats]);

  // Initial load effect - HANYA DIJALANKAN SEKALI
  useEffect(() => {
    if (isInitialMount.current) {
      console.log('🚀 Initial mount - loading chats and initializing socket');
      loadChats();
      
      // Delay sedikit untuk initialize socket
      const socketTimer = setTimeout(() => {
        initializeChatSocketConnection();
      }, 500);

      isInitialMount.current = false;

      return () => {
        clearTimeout(socketTimer);
      };
    }
  }, [loadChats, initializeChatSocketConnection]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (chatSocket.current) {
        console.log('🧹 Cleaning up admin chat socket');
        cleanupChatSocket(chatSocket.current);
        socketInitialized.current = false;
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Load messages function - DIPERBAIKI
  const loadChatMessages = useCallback(async (chatId) => {
    if (!chatId) return;
    
    try {
      setIsLoading(true);
      const chatData = await getChatMessages(chatId, true);
      setMessages(chatData.messages || []);
      
      // Reset unread count untuk chat yang dipilih
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId ? { ...chat, unread: 0 } : chat
        )
      );
    } catch (error) {
      console.error('❌ Error loading chat messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect untuk load messages ketika selectedChat berubah
  useEffect(() => {
    if (selectedChat !== null && chats[selectedChat]) {
      const chatId = chats[selectedChat].id;
      console.log(`🔄 Loading messages for chat: ${chatId}`);
      loadChatMessages(chatId);
    } else {
      setMessages([]);
    }
  }, [selectedChat, loadChatMessages]);

  // Image viewer effects
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (imageViewerRef.current && !imageViewerRef.current.contains(event.target)) {
        setSelectedImage(null);
        setZoomLevel(1);
      }
    };

    if (selectedImage) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [selectedImage]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (selectedImage) {
        if (event.key === 'Escape') {
          setSelectedImage(null);
          setZoomLevel(1);
        }
        if (event.key === '+' || event.key === '=') {
          event.preventDefault();
          setZoomLevel(prev => Math.min(prev + 0.25, 3));
        }
        if (event.key === '-') {
          event.preventDefault();
          setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send message function - DIPERBAIKI untuk realtime
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || selectedChat === null || !chats[selectedChat] || isSending) return;

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
        read: true
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Stop typing indicator
      handleTyping(false);
      
      // Send via API
      const apiResult = await sendMessage(currentChat.id, currentChat.userId, {
        message: messageText,
        sender: 'admin'
      });
      
      // Send via socket untuk realtime
      if (chatSocket.current) {
        sendMessageViaSocket(chatSocket.current, {
          chatId: currentChat.id,
          userId: currentChat.userId,
          message: messageText,
          sender: 'admin',
          userName: 'Admin',
          messageId: apiResult.message?.id || `admin-${Date.now()}`
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
      
      // Remove temporary flag dengan ID yang benar dari server
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { 
                ...msg, 
                id: apiResult.message?.id || `confirmed-${Date.now()}`,
                // Tambahkan timestamp dari server jika ada
                time: apiResult.message?.createdAt ? 
                  new Date(apiResult.message.createdAt).toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : msg.time
              }
            : msg
        )
      );
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Gagal mengirim pesan. Silakan coba lagi.');
      
      // Remove failed message
      setMessages(prev => 
        prev.filter(msg => !msg.id.includes(`temp-`))
      );
    } finally {
      setIsSending(false);
    }
  };

  // File upload function - DIPERBAIKI dengan download yang benar
  const handleFileUpload = async (file) => {
    if (!file || selectedChat === null || !chats[selectedChat]) {
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
      
      // Update message dengan file URL yang benar
      const fileUrl = result.message?.fileUrl || result.fileUrl || `/uploads/chat/${file.name}`;
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { 
                ...msg, 
                id: result.message?.id || `file-confirmed-${Date.now()}`,
                fileUrl: fileUrl,
                message: `[File: ${file.name}]`,
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
      
      // Kirim via socket untuk realtime
      if (chatSocket.current) {
        const messagePayload = {
          chatId: currentChat.id,
          userId: currentChat.userId,
          message: `[File: ${file.name}]`,
          sender: 'admin',
          fileUrl: fileUrl,
          fileName: file.name,
          fileType: file.type,
          userName: 'Admin',
          messageId: result.message?.id || `file-admin-${Date.now()}`
        };
        sendMessageViaSocket(chatSocket.current, messagePayload);
      }
      
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      alert('Gagal mengupload file. Silakan coba lagi.');
      
      // Remove failed file message
      setMessages(prev => 
        prev.filter(msg => !msg.id.includes('file-temp-'))
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
    event.target.value = '';
  };

  const handleTyping = (typing) => {
    if (!chatSocket.current || selectedChat === null || !chats[selectedChat]) return;
    
    const currentChat = chats[selectedChat];
    sendTypingIndicator(chatSocket.current, 'admin', typing, currentChat.id);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 3000);
    }
  };

  const handleImageClick = (fileUrl, fileName) => {
    setSelectedImage({ fileUrl, fileName });
    setZoomLevel(1);
  };

  // Download file function - DIPERBAIKI dengan fetch + blob
const handleDownloadFile = async (fileUrl, fileName) => {
  if (!fileUrl) {
    alert('File URL tidak tersedia');
    return;
  }

  try {
    // Buat full URL jika relative path
    const fullFileUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `https://serverraharpashopp-production-f317.up.railway.app${fileUrl}`;
    
    console.log('📥 Attempting download:', fullFileUrl);

    // Gunakan fetch untuk mendapatkan file sebagai blob
    const response = await fetch(fullFileUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Convert response ke blob
    const blob = await response.blob();
    
    // Buat URL object dari blob
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Buat elemen anchor untuk download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || 'download';
    
    // Tambahkan ke DOM, klik, dan hapus
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup URL object
    window.URL.revokeObjectURL(blobUrl);
    
    console.log('✅ Download berhasil:', fileName);
    
  } catch (error) {
    console.error('❌ Error downloading file:', error);
    
    // Fallback: coba dengan metode langsung
    try {
      const fullFileUrl = fileUrl.startsWith('http') 
        ? fileUrl 
        : `https://serverraharpashopp-production-f317.up.railway.app${fileUrl}`;
      
      const link = document.createElement('a');
      link.href = fullFileUrl;
      link.download = fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Download fallback berhasil');
    } catch (fallbackError) {
      console.error('❌ Fallback juga gagal:', fallbackError);
      alert('Gagal mendownload file. Silakan coba lagi atau hubungi administrator.');
    }
  }
};

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleContactClick = (index) => {
    console.log(`👆 Chat selected: ${index}`);
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
    setSelectedChat(null);
    setSearchTerm('');
    setShowChat(false);
    setMessages([]);
    loadChats();
    
    if (onNavigate) {
      onNavigate('Chat');
    }
  };

  // Render message content - DIPERBAIKI PADDING GAMBAR
  const renderMessageContent = (msg) => {
    if (msg.fileUrl && msg.fileName) {
      return (
        <div className="space-y-1">
          <p className="text-sm xs:text-base break-words">
            {msg.message}
          </p>
          <div className="bg-white/50 rounded-lg border border-amber-200 overflow-hidden">
            {msg.fileType?.startsWith('image/') ? (
              <div className="space-y-1">
                <div className="relative">
                  <img 
                    src={`https://serverraharpashopp-production-f317.up.railway.app${msg.fileUrl}`} 
                    alt={msg.fileName}
                    className="w-full h-auto max-h-48 object-cover cursor-pointer"
                    onClick={() => handleImageClick(msg.fileUrl, msg.fileName)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden bg-amber-50 p-3 text-center">
                    <i className="bx bx-image text-xl text-amber-600 mb-1"></i>
                    <p className="text-xs text-amber-700 break-words">{msg.fileName}</p>
                    <button 
                      onClick={() => handleDownloadFile(msg.fileUrl, msg.fileName)}
                      className="mt-1 px-2 py-1 bg-amber-600 text-white rounded text-xs hover:bg-amber-700 transition-colors"
                    >
                      Download File
                    </button>
                  </div>
                </div>
                {msg.isUploading && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 px-2 pb-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600"></div>
                    Mengupload...
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-amber-50 transition-colors"
                onClick={() => handleDownloadFile(msg.fileUrl, msg.fileName)}
              >
                <i className="bx bx-file text-xl text-amber-600"></i>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-800 truncate">
                    {msg.fileName}
                  </p>
                  <p className="text-[10px] text-amber-600">
                    Klik untuk download file
                  </p>
                </div>
                <i className="bx bx-download text-amber-600"></i>
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
    <>
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
                              <div className={`rounded-2xl p-2 shadow-lg
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

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div 
            ref={imageViewerRef}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full h-full flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-800 truncate flex-1 mr-4">
                {selectedImage.fileName}
              </h3>
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="bx bx-zoom-out text-xl"></i>
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-2 rounded-xl bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors"
                >
                  <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
                </button>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="bx bx-zoom-in text-xl"></i>
                </button>
                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setZoomLevel(1);
                  }}
                  className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors ml-2"
                >
                  <i className="bx bx-x text-xl"></i>
                </button>
              </div>
            </div>

            {/* Image Container */}
            <div className="flex-1 overflow-hidden bg-gray-900 flex items-center justify-center p-4">
              <img
                src={`https://serverraharpashopp-production-f317.up.railway.app${selectedImage.fileUrl}`}
                alt={selectedImage.fileName}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const container = e.target.parentElement;
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'text-white text-center p-8';
                  errorDiv.innerHTML = `
                    <i class="bx bx-image text-4xl mb-4 text-gray-400"></i>
                    <p class="text-lg font-medium mb-2">Gambar tidak dapat dimuat</p>
                    <p class="text-sm text-gray-400">${selectedImage.fileName}</p>
                  `;
                  container.appendChild(errorDiv);
                }}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleDownloadFile(selectedImage.fileUrl, selectedImage.fileName)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  >
                    <i className="bx bx-download"></i>
                    <span>Download</span>
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Gunakan mouse wheel atau tombol +/- untuk zoom
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Chat