// components/user/ChatRoom.jsx - VERSI DIPERBAIKI DENGAN DOWNLOAD & IMAGE PADDING
import React, { useState, useEffect, useRef, useCallback } from 'react';
import "boxicons/css/boxicons.min.css";
import { 
  getOrCreateUserChat, 
  sendMessage, 
  sendMessageWithFile,
  initializeChatSocket, 
  setupChatSocketListeners,
  joinChatRoom,
  sendMessageViaSocket,
  sendTypingIndicator,
  cleanupChatSocket
} from '../../api/Api_chat';

const ChatRoom = ({ showWishlist, setShowWishlist, userData }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [adminTyping, setAdminTyping] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatSocket = useRef(null);
  const typingTimeoutRef = useRef(null);
  const imageViewerRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat socket connection dengan useCallback
  const initializeChatSocketConnection = useCallback(() => {
    if (!userData?.id) {
      console.log('❌ Cannot initialize socket: No user ID');
      return;
    }

    try {
      console.log('🔌 Initializing chat socket connection...');
      const newSocket = initializeChatSocket();
      
      if (!newSocket) {
        console.error('❌ Failed to create socket');
        return;
      }

      chatSocket.current = newSocket;

      // Setup listeners langsung tanpa menunggu connect
      console.log('🎧 Setting up socket listeners immediately...');
      setupChatSocketListeners(newSocket, {
        onNewMessage: (data) => {
          console.log('📨 New message received in user chat:', data);
          
          // Pastikan data ada dan relevan dengan chat ini
          if (data && (data.chatId === chatId || data.userId === userData.id)) {
            console.log('✅ Adding new message to chat:', data.message);
            
            // Tambahkan message langsung tanpa delay
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
            
            if (data.sender === 'admin') {
              showNotification('Admin mengirim pesan baru', data.message);
            }
          } else {
            console.log('❌ Message not relevant for this chat:', {
              messageChatId: data?.chatId,
              currentChatId: chatId,
              messageUserId: data?.userId,
              currentUserId: userData.id
            });
          }
        },
        onUserTyping: (data) => {
          console.log('⌨️ Typing indicator received:', data);
          if (data.userId === 'admin') {
            setAdminTyping(data.isTyping);
            console.log('👨‍💼 Admin typing:', data.isTyping);
          }
        },
        onUserOnline: (data) => {
          console.log('🟢 User online:', data);
        },
        onUserOffline: (data) => {
          console.log('🔴 User offline:', data);
        },
        onChatUpdated: (data) => {
          console.log('🔄 Chat updated:', data);
        },
        onError: (error) => {
          console.error('❌ Socket error:', error);
        }
      });

      // Join user room segera
      console.log('🚪 Joining user room immediately:', userData.id);
      joinChatRoom(newSocket, userData.id, 'user');

      newSocket.on('connect', () => {
        console.log('✅ Socket connected successfully');
        // Re-join room setelah connected
        joinChatRoom(newSocket, userData.id, 'user');
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });

    } catch (error) {
      console.error('❌ Failed to initialize chat socket:', error);
    }
  }, [userData, chatId]);

  // Load user chat dengan useCallback
  const loadUserChat = useCallback(async () => {
    if (!userData?.id) {
      console.log('❌ Cannot load chat: No user ID');
      return;
    }
    
    try {
      console.log('📥 Loading user chat for:', userData.id);
      setIsLoading(true);
      const chatData = await getOrCreateUserChat(userData.id);
      
      console.log('✅ Chat data loaded:', chatData);
      setChatId(chatData.chatId);
      setMessages(chatData.messages || []);
      
    } catch (error) {
      console.error('❌ Error loading chat:', error);
      // Fallback messages
      setMessages([
        {
          id: 1,
          sender: 'admin',
          message: `Hallo ${userData.name}, selamat datang! Ada yang bisa saya bantu?`,
          time: new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          read: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [userData]);

  // Load chat ketika userData tersedia
  useEffect(() => {
    if (userData && userData.id) {
      console.log('🚀 Initializing chat for user:', userData.id);
      loadUserChat();
      initializeChatSocketConnection();
    }

    return () => {
      if (chatSocket.current) {
        console.log('🧹 Cleaning up chat socket');
        cleanupChatSocket(chatSocket.current);
        if (chatSocket.current.connected) {
          chatSocket.current.disconnect();
        }
      }
    };
  }, [userData, loadUserChat, initializeChatSocketConnection]);

  // Handle image viewer click outside
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

  // Handle keyboard events for image viewer
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatId || !userData?.id || isSending) {
      console.log('❌ Cannot send message:', {
        hasMessage: !!newMessage.trim(),
        hasChatId: !!chatId,
        hasUserId: !!userData?.id,
        isSending
      });
      return;
    }

    const messageText = newMessage.trim();
    
    try {
      console.log('📤 Sending message:', messageText);
      setIsSending(true);
      
      // Add message optimistically - TANPA DELAY
      const tempMessage = {
        id: `temp-${Date.now()}`,
        sender: 'user',
        message: messageText,
        time: new Date().toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        read: false
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Stop typing indicator
      handleTyping(false);
      
      // Prepare message payload
      const messagePayload = {
        chatId,
        userId: userData.id,
        message: messageText,
        sender: 'user'
      };

      console.log('📦 Message payload:', messagePayload);
      
      // Send via API - REAL TIME
      console.log('🌐 Sending via API...');
      await sendMessage(chatId, userData.id, {
        message: messageText,
        sender: 'user'
      });
      
      // Send via socket juga - REAL TIME
      if (chatSocket.current) {
        console.log('🔌 Sending via socket...');
        sendMessageViaSocket(chatSocket.current, messagePayload);
      } else {
        console.log('⚠️ Socket not available for sending');
      }
      
      // Remove temporary flag langsung
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, id: `confirmed-${Date.now()}` }
            : msg
        )
      );
      
      console.log('✅ Message sent successfully');
      
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
    if (!file || !chatId || !userData?.id) {
      console.log('❌ Cannot upload file: Missing required data');
      return;
    }

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
        sender: 'user',
        message: `Mengupload file: ${file.name}`,
        time: new Date().toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        read: false,
        fileUrl: null,
        fileName: file.name,
        fileType: file.type,
        isUploading: true
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      // Upload file dan kirim message
      console.log('📎 Uploading file:', file.name);
      const result = await sendMessageWithFile(
        chatId, 
        userData.id, 
        {
          message: `[File: ${file.name}]`,
          sender: 'user'
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
      
      // Kirim via socket juga
      if (chatSocket.current) {
        const messagePayload = {
          chatId,
          userId: userData.id,
          message: `[File: ${file.name}]`,
          sender: 'user',
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
    if (!chatSocket.current || !userData?.id || !chatId) {
      console.log('❌ Cannot send typing indicator:', {
        hasSocket: !!chatSocket.current,
        hasUserId: !!userData?.id,
        hasChatId: !!chatId
      });
      return;
    }
    
    console.log('⌨️ Sending typing indicator:', typing);
    sendTypingIndicator(chatSocket.current, userData.id, typing, chatId);
    
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

  const handleImageClick = (fileUrl, fileName) => {
    setSelectedImage({ fileUrl, fileName });
    setZoomLevel(1);
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

  // Render message content - DIPERBAIKI PADDING GAMBAR
  const renderMessageContent = (msg) => {
    if (msg.fileUrl && msg.fileName) {
      return (
        <div className="space-y-1">
          <p className="text-xs xs:text-sm sm:text-base break-words">
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
      <p className="text-xs xs:text-sm sm:text-base break-words">
        {msg.message}
      </p>
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

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Debug info
  useEffect(() => {
    console.log('🔍 Chat State:', {
      chatId,
      messagesCount: messages.length,
      isLoading,
      isSending,
      uploadingFile,
      adminTyping,
      userData: userData ? { id: userData.id, name: userData.name } : null,
      socketConnected: chatSocket.current?.connected || false
    });
  }, [chatId, messages, isLoading, isSending, uploadingFile, adminTyping, userData]);

  return (
    <>
      <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-amber-100 
                      shadow-[0_10px_30px_rgba(186,118,48,0.1),0_4px_12px_rgba(186,118,48,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]
                      transform transition-all duration-500 hover:shadow-[0_20px_40px_rgba(186,118,48,0.15),0_8px_24px_rgba(186,118,48,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]
                      hover:-translate-y-1 relative
                      max-[470px]:w-[calc(100vw-24px)] max-[470px]:mx-auto max-[470px]:max-w-full
                      max-[440px]:w-[calc(100vw-20px)]
                      max-[420px]:w-[calc(100vw-16px)]
                      max-[401px]:w-[calc(100vw-12px)]
                      max-[380px]:w-[calc(100vw-8px)] max-[380px]:rounded-xl max-[380px]:border max-[380px]:border-amber-100">

        {/* Efek 3D Border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-white/50 pointer-events-none 
                       max-[380px]:rounded-xl"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-3 xs:px-4 sm:px-6 py-3 xs:py-4 border-b border-amber-100 
                       bg-gradient-to-r from-white to-amber-50 rounded-t-2xl
                       shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_2px_8px_rgba(186,118,48,0.1)]
                       max-[470px]:px-3 max-[470px]:py-3
                       max-[440px]:px-3 max-[440px]:py-3
                       max-[420px]:px-2.5 max-[420px]:py-2.5
                       max-[401px]:px-2 max-[401px]:py-2
                       max-[400px]:px-3 max-[380px]:px-2 max-[380px]:py-2 max-[380px]:rounded-t-xl">
          <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 
                         max-[470px]:gap-2
                         max-[440px]:gap-2
                         max-[420px]:gap-1.5
                         max-[401px]:gap-1.5
                         max-[400px]:gap-2 max-[380px]:gap-1.5">
            {/* Profile 3D Effect */}
            <div className="relative">
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-2xl 
                             bg-gradient-to-br from-amber-600 to-amber-700 
                             shadow-[0_8px_20px_rgba(186,118,48,0.3),inset_0_2px_4px_rgba(255,255,255,0.3)]
                             flex items-center justify-center text-white text-lg xs:text-xl sm:text-2xl 
                             transform transition-transform hover:scale-110 hover:rotate-3
                             max-[470px]:w-9 max-[470px]:h-9 max-[470px]:text-base
                             max-[440px]:w-9 max-[440px]:h-9 max-[440px]:text-base
                             max-[420px]:w-9 max-[420px]:h-9 max-[420px]:text-base
                             max-[401px]:w-8 max-[401px]:h-8 max-[401px]:text-sm
                             max-[400px]:w-9 max-[400px]:h-9 max-[400px]:text-base
                             max-[380px]:w-8 max-[380px]:h-8 max-[380px]:text-sm max-[380px]:rounded-lg">
                <i className="bx bx-user"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 
                             bg-green-400 rounded-full border-2 border-white 
                             shadow-[0_2px_8px_rgba(34,197,94,0.5)]
                             max-[470px]:w-2.5 max-[470px]:h-2.5
                             max-[440px]:w-2.5 max-[440px]:h-2.5
                             max-[420px]:w-2.5 max-[420px]:h-2.5
                             max-[401px]:w-2 max-[401px]:h-2 max-[401px]:-bottom-0.5 max-[401px]:-right-0.5
                             max-[400px]:w-2.5 max-[400px]:h-2.5
                             max-[380px]:w-2 max-[380px]:h-2 max-[380px]:-bottom-0.5 max-[380px]:-right-0.5"></div>
            </div>
            
            <div className="max-[470px]:flex-1 max-[470px]:min-w-0
                           max-[440px]:flex-1 max-[440px]:min-w-0
                           max-[420px]:flex-1 max-[420px]:min-w-0
                           max-[401px]:flex-1 max-[401px]:min-w-0
                           max-[400px]:flex-1 max-[400px]:min-w-0 max-[380px]:min-w-0 max-[380px]:flex-1">
              <h1 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 
                            drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]
                            max-[470px]:text-sm max-[470px]:truncate
                            max-[440px]:text-sm max-[440px]:truncate
                            max-[420px]:text-sm max-[420px]:truncate
                            max-[401px]:text-xs max-[401px]:truncate max-[401px]:leading-4
                            max-[400px]:text-sm max-[400px]:truncate
                            max-[380px]:text-xs max-[380px]:leading-tight">
                Live Chat Room
              </h1>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1
                           max-[470px]:text-[10px] max-[470px]:mt-0.5
                           max-[440px]:text-[10px] max-[440px]:mt-0.5
                           max-[420px]:text-[10px] max-[420px]:mt-0.5
                           max-[401px]:text-[9px] max-[401px]:mt-0 max-[401px]:gap-0.5
                           max-[400px]:text-[10px] max-[400px]:mt-0.5
                           max-[380px]:text-[9px] max-[380px]:mt-0 max-[380px]:gap-0.5">
                <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-green-500 rounded-full animate-pulse 
                                shadow-[0_0_8px_rgba(34,197,94,0.6)]
                                max-[470px]:w-1.5 max-[470px]:h-1.5
                                max-[440px]:w-1.5 max-[440px]:h-1.5
                                max-[420px]:w-1.5 max-[420px]:h-1.5
                                max-[401px]:w-1 max-[401px]:h-1
                                max-[400px]:w-1.5 max-[400px]:h-1.5
                                max-[380px]:w-1 max-[380px]:h-1"></span>
                Admin • Online
                {adminTyping && (
                  <span className="text-amber-600 italic ml-1">mengetik...</span>
                )}
              </p>
            </div>
          </div>

          <button 
            onClick={() => setShowWishlist(!showWishlist)}
            className="p-2 xs:p-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 
                     text-white shadow-[0_6px_16px_rgba(186,118,48,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)]
                     transform transition-all duration-300 hover:scale-110 
                     hover:shadow-[0_8px_24px_rgba(186,118,48,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)] lg:hidden
                     flex items-center justify-center
                     max-[470px]:p-2 max-[470px]:w-9 max-[470px]:h-9
                     max-[440px]:p-2 max-[440px]:w-9 max-[440px]:h-9
                     max-[420px]:p-2 max-[420px]:w-9 max-[420px]:h-9
                     max-[401px]:p-1.5 max-[401px]:w-8 max-[401px]:h-8
                     max-[400px]:p-2 max-[400px]:w-9 max-[400px]:h-9
                     max-[380px]:p-1.5 max-[380px]:w-8 max-[380px]:h-8 max-[380px]:rounded-lg"
          >
            <i className="bx bx-heart text-base xs:text-lg sm:text-xl 
                       max-[470px]:text-sm 
                       max-[440px]:text-sm
                       max-[420px]:text-sm 
                       max-[401px]:text-xs
                       max-[400px]:text-sm max-[380px]:text-xs"></i>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-3 xs:p-4 sm:p-6 overflow-y-auto space-y-3 xs:space-y-4 sm:space-y-6 
                       bg-gradient-to-b from-white to-amber-25
                       shadow-[inset_0_2px_8px_rgba(186,118,48,0.05)]
                       [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                       max-[470px]:p-3 max-[470px]:space-y-3
                       max-[440px]:p-3 max-[440px]:space-y-3
                       max-[420px]:p-2.5 max-[420px]:space-y-2.5
                       max-[401px]:p-2 max-[401px]:space-y-2
                       max-[400px]:px-3 max-[380px]:p-2 max-[380px]:space-y-2">
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <i className="bx bx-message-rounded text-3xl mb-2"></i>
                  <p className="text-sm">Belum ada pesan</p>
                  <p className="text-xs">Mulai percakapan dengan admin</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 xs:gap-3 sm:gap-4 transform transition-transform
                               ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}
                               max-[470px]:gap-2
                               max-[440px]:gap-2
                               max-[420px]:gap-1.5
                               max-[401px]:gap-1.5
                               max-[400px]:gap-2 max-[380px]:gap-1.5`}
                  >
                    {msg.sender === 'admin' && (
                      <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl 
                                     bg-gradient-to-br from-gray-400 to-gray-600 
                                     flex items-center justify-center text-white flex-shrink-0
                                     max-[470px]:w-7 max-[470px]:h-7
                                     max-[440px]:w-7 max-[440px]:h-7
                                     max-[420px]:w-7 max-[420px]:h-7
                                     max-[401px]:w-6 max-[401px]:h-6
                                     max-[400px]:w-7 max-[400px]:h-7
                                     max-[380px]:w-6 max-[380px]:h-6 max-[380px]:rounded-lg">
                        <i className="bx bx-user text-xs xs:text-sm sm:text-base 
                                     max-[470px]:text-xs
                                     max-[440px]:text-xs
                                     max-[420px]:text-xs
                                     max-[401px]:text-[10px]
                                     max-[400px]:text-xs max-[380px]:text-[10px]"></i>
                      </div>
                    )}
                    
                    <div className={`${msg.sender === 'user' ? 'text-right' : 'text-left'} flex-1 min-w-0`}>
                      <p className="text-xs font-semibold text-gray-600 mb-1 
                                   max-[470px]:text-[10px] max-[470px]:mb-0.5
                                   max-[440px]:text-[10px] max-[440px]:mb-0.5
                                   max-[420px]:text-[10px] max-[420px]:mb-0.5
                                   max-[401px]:text-[9px] max-[401px]:mb-0
                                   max-[400px]:text-[10px] max-[400px]:mb-0.5 max-[380px]:text-[9px] max-[380px]:mb-0">
                        {msg.sender === 'admin' ? 'Admin' : 'You'} • {msg.time}
                        {msg.isUploading && (
                          <span className="text-amber-600 text-xs ml-1">mengupload...</span>
                        )}
                      </p>
                      <div className={`${msg.sender === 'user' 
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl rounded-tr-none' 
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none'
                      } px-2 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-3 
                      shadow-lg
                      transform transition-all duration-300 
                      hover:shadow-[0_6px_20px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.9)] 
                      inline-block max-w-[80%] xs:max-w-[85%] sm:max-w-xs
                      max-[470px]:max-w-[90%] max-[470px]:px-2 max-[470px]:py-1.5
                      max-[440px]:max-w-[90%] max-[440px]:px-2 max-[440px]:py-1.5
                      max-[420px]:max-w-[92%] max-[420px]:px-2 max-[420px]:py-1.5
                      max-[401px]:max-w-[94%] max-[401px]:px-1.5 max-[401px]:py-1
                      max-[400px]:max-w-[calc(100%-10px)] max-[400px]:px-2 max-[400px]:py-1.5
                      max-[380px]:max-w-[calc(100%-8px)] max-[380px]:px-1.5 max-[380px]:py-1 max-[380px]:rounded-xl`}>
                        {renderMessageContent(msg)}
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl 
                                     bg-gradient-to-br from-amber-600 to-amber-700 
                                     flex items-center justify-center text-white flex-shrink-0
                                     max-[470px]:w-7 max-[470px]:h-7
                                     max-[440px]:w-7 max-[440px]:h-7
                                     max-[420px]:w-7 max-[420px]:h-7
                                     max-[401px]:w-6 max-[401px]:h-6
                                     max-[400px]:w-7 max-[400px]:h-7
                                     max-[380px]:w-6 max-[380px]:h-6 max-[380px]:rounded-lg">
                        <i className="bx bx-user text-xs xs:text-sm sm:text-base 
                                     max-[470px]:text-xs
                                     max-[440px]:text-xs
                                     max-[420px]:text-xs
                                     max-[401px]:text-[10px]
                                     max-[400px]:text-xs max-[380px]:text-[10px]"></i>
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {/* Typing Indicator */}
              {adminTyping && (
                <div className="flex items-start gap-2 xs:gap-3 sm:gap-4 transform transition-transform
                               max-[470px]:gap-2
                               max-[440px]:gap-2
                               max-[420px]:gap-1.5
                               max-[401px]:gap-1.5
                               max-[400px]:gap-2 max-[380px]:gap-1.5">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl 
                                 bg-gradient-to-br from-gray-400 to-gray-600 
                                 flex items-center justify-center text-white shadow-lg flex-shrink-0
                                 max-[470px]:w-7 max-[470px]:h-7
                                 max-[440px]:w-7 max-[440px]:h-7
                                 max-[420px]:w-7 max-[420px]:h-7
                                 max-[401px]:w-6 max-[401px]:h-6
                                 max-[400px]:w-7 max-[400px]:h-7
                                 max-[380px]:w-6 max-[380px]:h-6 max-[380px]:rounded-lg">
                    <i className="bx bx-user text-xs xs:text-sm sm:text-base"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 
                                   px-4 py-3 rounded-2xl rounded-tl-none 
                                   shadow-lg
                                   border border-gray-200 inline-block">
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
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-2 xs:p-3 sm:p-4 border-t border-amber-100 bg-white rounded-b-2xl
                       shadow-[inset_0_2px_8px_rgba(186,118,48,0.05)]
                       max-[470px]:p-3
                       max-[440px]:p-3
                       max-[420px]:p-2.5
                       max-[401px]:p-2
                       max-[400px]:px-3 max-[400px]:py-2 max-[380px]:p-2 max-[380px]:rounded-b-xl">
          <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 
                         bg-gradient-to-r from-amber-50 to-white p-1.5 xs:p-2 rounded-2xl 
                         shadow-[inset_0_2px_8px_rgba(186,118,48,0.1),0_2px_8px_rgba(186,118,48,0.05)]
                         border border-amber-100
                         max-[470px]:gap-1.5 max-[470px]:p-1.5
                         max-[440px]:gap-1.5 max-[440px]:p-1.5
                         max-[420px]:gap-1.5 max-[420px]:p-1.5
                         max-[401px]:gap-1 max-[401px]:p-1
                         max-[400px]:gap-1.5 max-[400px]:p-1.5
                         max-[380px]:gap-1 max-[380px]:p-1 max-[380px]:rounded-lg">
            
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              disabled={uploadingFile || isSending || !userData}
            />
            
            {/* File Upload Button */}
            <button 
              type="button"
              onClick={handleFileButtonClick}
              disabled={uploadingFile || isSending || !userData}
              className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 flex items-center justify-center 
                         rounded-2xl bg-white text-amber-600 
                         shadow-[0_4px_12px_rgba(186,118,48,0.2),inset_0_1px_2px_rgba(255,255,255,0.8)]
                         transform transition-all duration-300 hover:scale-110 hover:bg-amber-50 
                         hover:shadow-[0_6px_16px_rgba(186,118,48,0.3),inset_0_1px_2px_rgba(255,255,255,0.9)] 
                         flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         max-[470px]:w-8 max-[470px]:h-8
                         max-[440px]:w-8 max-[440px]:h-8
                         max-[420px]:w-8 max-[420px]:h-8
                         max-[401px]:w-7 max-[401px]:h-7
                         max-[400px]:w-7 max-[400px]:h-7
                         max-[380px]:w-6 max-[380px]:h-6 max-[380px]:rounded-lg"
            >
              {uploadingFile ? (
                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i className="bx bx-paperclip text-lg xs:text-xl sm:text-2xl 
                           max-[470px]:text-base
                           max-[440px]:text-base
                           max-[420px]:text-base
                           max-[401px]:text-sm
                           max-[400px]:text-sm max-[380px]:text-xs"></i>
              )}
            </button>
            
            {/* Message Input */}
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
              placeholder="Type your message..."
              className="flex-1 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 bg-transparent 
                         outline-none text-gray-700 placeholder-gray-400 text-xs xs:text-sm sm:text-base 
                         min-w-0 shadow-[inset_0_2px_4px_rgba(186,118,48,0.05)] rounded-xl
                         max-[470px]:px-2 max-[470px]:py-1.5 max-[470px]:text-xs
                         max-[440px]:px-2 max-[440px]:py-1.5 max-[440px]:text-xs
                         max-[420px]:px-2 max-[420px]:py-1.5 max-[420px]:text-xs
                         max-[401px]:px-1.5 max-[401px]:py-1 max-[401px]:text-[11px]
                         max-[400px]:px-2 max-[400px]:py-1.5 max-[400px]:text-xs
                         max-[380px]:px-1.5 max-[380px]:py-1 max-[380px]:text-[11px] max-[380px]:rounded-lg"
              disabled={isSending || uploadingFile || !userData}
            />
            
            {/* Send Button */}
            <button 
              type="submit"
              disabled={!newMessage.trim() || isSending || uploadingFile || !userData}
              className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 flex items-center justify-center 
                              rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white 
                              shadow-[0_4px_12px_rgba(186,118,48,0.3),inset_0_1px_2px_rgba(255,255,255,0.2)]
                              transform transition-all duration-300 hover:scale-110 
                              hover:shadow-[0_6px_20px_rgba(186,118,48,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] 
                              flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                              max-[470px]:w-8 max-[470px]:h-8
                              max-[440px]:w-8 max-[440px]:h-8
                              max-[420px]:w-8 max-[420px]:h-8
                              max-[401px]:w-7 max-[401px]:h-7
                              max-[400px]:w-7 max-[400px]:h-7
                              max-[380px]:w-6 max-[380px]:h-6 max-[380px]:rounded-lg"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i className="bx bx-send text-sm xs:text-lg sm:text-xl 
                             max-[470px]:text-sm
                             max-[440px]:text-sm
                             max-[420px]:text-sm
                             max-[401px]:text-xs
                             max-[400px]:text-xs max-[380px]:text-[10px]"></i>
              )}
            </button>
          </form>
          
          {/* File Type Info */}
          <p className="text-[10px] xs:text-xs text-gray-500 text-center mt-3 xs:mt-2
                       drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]
                       max-[470px]:text-[10px] max-[470px]:mt-2
                       max-[440px]:text-[10px] max-[440px]:mt-2
                       max-[420px]:text-[10px] max-[420px]:mt-2
                       max-[401px]:text-[9px] max-[401px]:mt-1.5
                       max-[400px]:text-[9px] max-[400px]:mt-2
                       max-[380px]:text-[8px] max-[380px]:mt-1">
            Support: JPG, PNG, GIF, WEBP (Max 5MB)
            {(isSending || uploadingFile) && (
              <span className="text-amber-600 ml-1">• Mengirim...</span>
            )}
          </p>
        </div>

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
                  // Show error message
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
  );
};

export default ChatRoom;