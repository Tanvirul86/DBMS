import React, { useState, useEffect, useRef } from 'react';
import './MessageCenter.css';

const MessageCenter = ({ language, userType, userData, onClose, directCommunication }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Mock conversations data
  const mockConversations = {
    farmer: [
      {
        id: 1,
        doctorId: 1,
        doctorName: 'Dr. Rahman Ahmed',
        doctorSpecialization: 'crop_diseases',
        lastMessage: 'আপনার ধানের সমস্যার জন্য এই ওষুধ ব্যবহার করুন।',
        lastMessageTime: '2025-08-09T10:30:00',
        unreadCount: 2,
        isOnline: true
      },
      {
        id: 2,
        doctorId: 2,
        doctorName: 'Dr. Fatima Begum',
        doctorSpecialization: 'pest_management',
        lastMessage: 'পোকামাকড়ের ছবি পাঠান।',
        lastMessageTime: '2025-08-08T16:45:00',
        unreadCount: 0,
        isOnline: false
      },
      {
        id: 3,
        doctorId: 3,
        doctorName: 'Dr. Karim Hossain',
        doctorSpecialization: 'soil_fertility',
        lastMessage: 'মাটি পরীক্ষার রিপোর্ট কেমন?',
        lastMessageTime: '2025-08-07T14:20:00',
        unreadCount: 1,
        isOnline: true
      }
    ],
    doctor: [
      {
        id: 1,
        farmerId: 1,
        farmerName: 'মোঃ করিম উদ্দিন',
        farmerLocation: 'গাজীপুর, ঢাকা',
        farmType: 'rice',
        lastMessage: 'ধন্যবাদ ডাক্তার সাহেব।',
        lastMessageTime: '2025-08-09T11:00:00',
        unreadCount: 0,
        isOnline: true
      },
      {
        id: 2,
        farmerId: 2,
        farmerName: 'আব্দুল রহিম',
        farmerLocation: 'নরসিংদী, ঢাকা',
        farmType: 'vegetables',
        lastMessage: 'টমেটো গাছে নতুন সমস্যা দেখা দিয়েছে।',
        lastMessageTime: '2025-08-09T09:15:00',
        unreadCount: 3,
        isOnline: false
      },
      {
        id: 3,
        farmerId: 3,
        farmerName: 'সালেহ আহমদ',
        farmerLocation: 'কুমিল্লা',
        farmType: 'fruits',
        lastMessage: 'আম গাছের পাতা হলুদ হয়ে যাচ্ছে।',
        lastMessageTime: '2025-08-08T20:30:00',
        unreadCount: 1,
        isOnline: true
      }
    ]
  };

  // Mock messages for selected conversation
  const getMockMessages = (conversationId) => {
    return [
      {
        id: 1,
        senderId: userType === 'farmer' ? 1 : 101,
        senderType: userType === 'farmer' ? 'doctor' : 'farmer',
        message: userType === 'farmer' 
          ? 'আসসালামু আলাইকুম! আপনার সমস্যা সম্পর্কে বলুন।'
          : 'আসসালামু আলাইকুম ডাক্তার সাহেব! আমার ধানের পাতায় দাগ দেখা যাচ্ছে।',
        timestamp: '2025-08-09T09:00:00',
        isRead: true,
        messageType: 'text'
      },
      {
        id: 2,
        senderId: userType === 'farmer' ? 201 : 1,
        senderType: userType === 'farmer' ? 'farmer' : 'doctor',
        message: userType === 'farmer'
          ? 'আমার ধানের পাতায় বাদামী দাগ দেখা যাচ্ছে। গত সপ্তাহ থেকে এই সমস্যা।'
          : 'এটি ব্লাস্ট রোগের লক্ষণ। আপনি ট্রাইসাইক্লাজল ফাংগিসাইড ব্যবহার করতে পারেন।',
        timestamp: '2025-08-09T09:05:00',
        isRead: true,
        messageType: 'text'
      },
      {
        id: 3,
        senderId: userType === 'farmer' ? 1 : 101,
        senderType: userType === 'farmer' ? 'doctor' : 'farmer',
        message: userType === 'farmer'
          ? 'আপনার ধানের ছবি পাঠান। আমি দেখে বলতে পারব।'
          : 'এই ওষুধ কোথায় পাব?',
        timestamp: '2025-08-09T09:10:00',
        isRead: true,
        messageType: 'text'
      },
      {
        id: 4,
        senderId: userType === 'farmer' ? 201 : 1,
        senderType: userType === 'farmer' ? 'farmer' : 'doctor',
        message: userType === 'farmer'
          ? 'ছবি পাঠাচ্ছি।'
          : 'যেকোনো কৃষি দোকানে পাবেন। ১৫ দিন পর পর স্প্রে করুন।',
        timestamp: '2025-08-09T09:15:00',
        isRead: false,
        messageType: 'text'
      }
    ];
  };

  const content = {
    bn: {
      title: 'বার্তা কেন্দ্র',
      searchPlaceholder: 'অনুসন্ধান করুন...',
      newMessage: 'নতুন বার্তা',
      typeMessage: 'বার্তা লিখুন...',
      send: 'পাঠান',
      online: 'অনলাইন',
      offline: 'অফলাইন',
      lastSeen: 'শেষ দেখা',
      today: 'আজ',
      yesterday: 'গতকাল',
      noConversations: 'কোন কথোপকথন নেই',
      selectConversation: 'একটি কথোপকথন নির্বাচন করুন',
      unreadMessages: 'অপঠিত বার্তা',
      markAsRead: 'পঠিত হিসেবে চিহ্নিত করুন',
      deleteConversation: 'কথোপকথন মুছুন',
      blockUser: 'ব্যবহারকারী ব্লক করুন',
      attachFile: 'ফাইল সংযুক্ত করুন',
      attachImage: 'ছবি সংযুক্ত করুন',
      call: 'কল করুন',
      videoCall: 'ভিডিও কল',
      close: 'বন্ধ করুন'
    },
    en: {
      title: 'Message Center',
      searchPlaceholder: 'Search conversations...',
      newMessage: 'New Message',
      typeMessage: 'Type a message...',
      send: 'Send',
      online: 'Online',
      offline: 'Offline',
      lastSeen: 'Last seen',
      today: 'Today',
      yesterday: 'Yesterday',
      noConversations: 'No conversations',
      selectConversation: 'Select a conversation',
      unreadMessages: 'Unread Messages',
      markAsRead: 'Mark as read',
      deleteConversation: 'Delete conversation',
      blockUser: 'Block user',
      attachFile: 'Attach file',
      attachImage: 'Attach image',
      call: 'Call',
      videoCall: 'Video Call',
      close: 'Close'
    }
  };

  const t = content[language];

  useEffect(() => {
    setConversations(mockConversations[userType] || []);
  }, [userType]);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(getMockMessages(selectedConversation.id));
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle direct communication from appointment notifications
  useEffect(() => {
    if (directCommunication && directCommunication.type === 'direct_appointment') {
      // Create or find conversation for this appointment
      const directConversation = {
        id: `appointment_${directCommunication.appointmentId}`,
        doctorId: directCommunication.doctorName,
        doctorName: directCommunication.doctorName,
        farmerName: directCommunication.farmerName,
        doctorSpecialization: 'appointment_consultation',
        lastMessage: language === 'bn' ? 'অ্যাপয়েন্টমেন্ট শুরু হয়েছে' : 'Appointment session started',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isOnline: true,
        isAppointment: true,
        appointmentTime: directCommunication.appointmentTime,
        appointmentDate: directCommunication.appointmentDate
      };

      // Select this conversation automatically
      setSelectedConversation(directConversation);
      
      // Add welcome message for appointment session
      const welcomeMessage = {
        id: Date.now(),
        text: language === 'bn' 
          ? `অ্যাপয়েন্টমেন্ট সেশন শুরু - ${directCommunication.appointmentDate} ${directCommunication.appointmentTime}`
          : `Appointment session started - ${directCommunication.appointmentDate} ${directCommunication.appointmentTime}`,
        sender: 'system',
        timestamp: new Date().toISOString(),
        type: 'appointment_start'
      };

      setMessages([welcomeMessage]);
    }
  }, [directCommunication, language]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Mark as read
    const updatedConversations = conversations.map(conv =>
      conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
    );
    setConversations(updatedConversations);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !selectedConversation) return;

    const message = {
      id: messages.length + 1,
      senderId: userType === 'farmer' ? 201 : 1,
      senderType: userType,
      message: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
      messageType: 'text'
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Update last message in conversation
    const updatedConversations = conversations.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, lastMessage: newMessage, lastMessageTime: new Date().toISOString() }
        : conv
    );
    setConversations(updatedConversations);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return t.today + ' ' + date.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays === 2) {
      return t.yesterday;
    } else {
      return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const name = userType === 'farmer' ? conv.doctorName : conv.farmerName;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="message-center-overlay">
      <div className="message-center">
        <div className="message-header">
          <h2>{t.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="message-content">
          {/* Conversations List */}
          <div className="conversations-panel">
            <div className="conversations-header">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="conversations-list">
              {filteredConversations.length === 0 ? (
                <div className="no-conversations">
                  <p>{t.noConversations}</p>
                </div>
              ) : (
                filteredConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="conversation-avatar">
                      <div className="avatar-circle">
                        {userType === 'farmer' ? '👨‍⚕️' : '👨‍🌾'}
                      </div>
                      <div className={`status-indicator ${conversation.isOnline ? 'online' : 'offline'}`}></div>
                    </div>

                    <div className="conversation-info">
                      <div className="conversation-header-info">
                        <h4>{userType === 'farmer' ? conversation.doctorName : conversation.farmerName}</h4>
                        <span className="conversation-time">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <div className="conversation-preview">
                        <p>{conversation.lastMessage}</p>
                        {conversation.unreadCount > 0 && (
                          <span className="unread-badge">{conversation.unreadCount}</span>
                        )}
                      </div>
                      {userType === 'farmer' && (
                        <div className="doctor-specialization">
                          <small>{conversation.doctorSpecialization}</small>
                        </div>
                      )}
                      {userType === 'doctor' && (
                        <div className="farmer-details">
                          <small>{conversation.farmerLocation} • {conversation.farmType}</small>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="chat-panel">
            {selectedConversation ? (
              <>
                <div className="chat-header">
                  <div className="chat-user-info">
                    <div className="chat-avatar">
                      {userType === 'farmer' ? '👨‍⚕️' : '👨‍🌾'}
                    </div>
                    <div className="chat-user-details">
                      <h3>{userType === 'farmer' ? selectedConversation.doctorName : selectedConversation.farmerName}</h3>
                      <span className={`status ${selectedConversation.isOnline ? 'online' : 'offline'}`}>
                        {selectedConversation.isOnline ? t.online : t.offline}
                      </span>
                      {selectedConversation.isAppointment && (
                        <div className="appointment-info">
                          <span className="appointment-badge">
                            📅 {language === 'bn' ? 'অ্যাপয়েন্টমেন্ট সেশন' : 'Appointment Session'}
                          </span>
                          <span className="appointment-time">
                            {selectedConversation.appointmentDate} {selectedConversation.appointmentTime}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="chat-actions">
                    <button className="action-btn call-btn" title={t.call}>📞</button>
                    <button className="action-btn video-btn" title={t.videoCall}>📹</button>
                    <button className="action-btn menu-btn">⋮</button>
                  </div>
                </div>

                <div className="messages-container">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`message ${message.senderType === userType ? 'own-message' : 'other-message'}`}
                    >
                      <div className="message-content">
                        <p>{message.message}</p>
                        <span className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="message-input-container">
                  <div className="input-actions">
                    <button className="attach-btn" title={t.attachFile}>📎</button>
                    <button className="image-btn" title={t.attachImage}>🖼️</button>
                  </div>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.typeMessage}
                    className="message-input"
                    rows="1"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="send-btn"
                    disabled={newMessage.trim() === ''}
                  >
                    {t.send}
                  </button>
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <p>{t.selectConversation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;
