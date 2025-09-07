import React, { useState, useEffect, useRef } from 'react';
import './ConsultationRoom.css';

const ConsultationRoom = ({ language, appointmentData, userType, onEndConsultation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isAudioCall, setIsAudioCall] = useState(false);
  const [consultationStatus, setConsultationStatus] = useState('active'); // active, ended
  const messagesEndRef = useRef(null);

  const content = {
    bn: {
      title: 'পরামর্শ কক্ষ',
      chatWith: userType === 'farmer' ? 'ডাক্তারের সাথে কথা বলুন' : 'কৃষকের সাথে কথা বলুন',
      messagePlaceholder: 'আপনার বার্তা লিখুন...',
      send: 'পাঠান',
      videoCall: 'ভিডিও কল',
      audioCall: 'অডিও কল',
      endCall: 'কল শেষ করুন',
      endConsultation: 'পরামর্শ শেষ করুন',
      consultationEnded: 'পরামর্শ শেষ হয়েছে',
      appointmentInfo: 'অ্যাপয়েন্টমেন্ট তথ্য',
      farmerName: 'কৃষকের নাম',
      doctorName: 'ডাক্তারের নাম',
      appointmentTime: 'অ্যাপয়েন্টমেন্ট সময়',
      problemDescription: 'সমস্যার বিবরণ',
      consultationNotes: 'পরামর্শের নোট',
      addNote: 'নোট যোগ করুন',
      saveNotes: 'নোট সংরক্ষণ করুন',
      typing: 'টাইপ করছেন...'
    },
    en: {
      title: 'Consultation Room',
      chatWith: userType === 'farmer' ? 'Chat with Doctor' : 'Chat with Farmer',
      messagePlaceholder: 'Type your message...',
      send: 'Send',
      videoCall: 'Video Call',
      audioCall: 'Audio Call',
      endCall: 'End Call',
      endConsultation: 'End Consultation',
      consultationEnded: 'Consultation Ended',
      appointmentInfo: 'Appointment Information',
      farmerName: 'Farmer Name',
      doctorName: 'Doctor Name',
      appointmentTime: 'Appointment Time',
      problemDescription: 'Problem Description',
      consultationNotes: 'Consultation Notes',
      addNote: 'Add Note',
      saveNotes: 'Save Notes',
      typing: 'typing...'
    }
  };

  const [consultationNotes, setConsultationNotes] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Mock initial messages
  useEffect(() => {
    const initialMessages = [
      {
        id: 1,
        sender: userType === 'farmer' ? 'doctor' : 'farmer',
        message: language === 'bn' ? 'আসসালামু আলাইকুম! আপনার সমস্যা সম্পর্কে বলুন।' : 'Hello! Please tell me about your problem.',
        timestamp: new Date(),
        senderName: userType === 'farmer' ? appointmentData?.doctorName : appointmentData?.farmerName
      }
    ];
    setMessages(initialMessages);
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      id: messages.length + 1,
      sender: userType,
      message: newMessage,
      timestamp: new Date(),
      senderName: userType === 'farmer' ? appointmentData?.farmerName : appointmentData?.doctorName
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate typing indicator and response (in real app, this would be real-time)
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate a response
      const responses = {
        farmer: {
          bn: ['আপনার সমস্যাটি বুঝতে পারছি। আরো বিস্তারিত বলুন।', 'এই সমস্যার জন্য আমি কিছু সমাধান সুজেশ করতে পারি।', 'আপনার জমির মাটির অবস্থা কেমন?'],
          en: ['I understand your problem. Please tell me more details.', 'I can suggest some solutions for this problem.', 'What is the condition of your soil?']
        },
        doctor: {
          bn: ['ধন্যবাদ ডাক্তার সাহেব। আমি আপনার পরামর্শ অনুসরণ করবো।', 'আমার জমিতে এই সমস্যা গত সপ্তাহ থেকে শুরু হয়েছে।', 'কখন এই চিকিৎসা প্রয়োগ করব?'],
          en: ['Thank you doctor. I will follow your advice.', 'This problem started in my field last week.', 'When should I apply this treatment?']
        }
      };

      const responseArray = responses[userType === 'farmer' ? 'doctor' : 'farmer'][language];
      const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];

      const responseMessage = {
        id: messages.length + 2,
        sender: userType === 'farmer' ? 'doctor' : 'farmer',
        message: randomResponse,
        timestamp: new Date(),
        senderName: userType === 'farmer' ? appointmentData?.doctorName : appointmentData?.farmerName
      };

      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVideoCall = () => {
    setIsVideoCall(true);
    setIsAudioCall(false);
  };

  const startAudioCall = () => {
    setIsAudioCall(true);
    setIsVideoCall(false);
  };

  const endCall = () => {
    setIsVideoCall(false);
    setIsAudioCall(false);
  };

  const endConsultation = () => {
    setConsultationStatus('ended');
    // In real app, save consultation data and notes
  };

  const saveConsultationNotes = () => {
    // In real app, save notes to database
    alert(language === 'bn' ? 'নোট সংরক্ষিত হয়েছে!' : 'Notes saved successfully!');
  };

  if (consultationStatus === 'ended') {
    return (
      <div className="consultation-room">
        <div className="consultation-ended">
          <h2>{content[language].consultationEnded}</h2>
          <button onClick={onEndConsultation} className="back-button">
            {language === 'bn' ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="consultation-room">
      <div className="consultation-header">
        <h2>{content[language].title}</h2>
        <div className="call-controls">
          {!isVideoCall && !isAudioCall && (
            <>
              <button onClick={startVideoCall} className="video-call-btn">
                📹 {content[language].videoCall}
              </button>
              <button onClick={startAudioCall} className="audio-call-btn">
                📞 {content[language].audioCall}
              </button>
            </>
          )}
          {(isVideoCall || isAudioCall) && (
            <button onClick={endCall} className="end-call-btn">
              {content[language].endCall}
            </button>
          )}
          <button onClick={endConsultation} className="end-consultation-btn">
            {content[language].endConsultation}
          </button>
        </div>
      </div>

      <div className="consultation-content">
        <div className="appointment-info">
          <h3>{content[language].appointmentInfo}</h3>
          <div className="info-details">
            <p><strong>{content[language].farmerName}:</strong> {appointmentData?.farmerName}</p>
            <p><strong>{content[language].doctorName}:</strong> {appointmentData?.doctorName}</p>
            <p><strong>{content[language].appointmentTime}:</strong> {appointmentData?.appointmentTime}</p>
            <p><strong>{content[language].problemDescription}:</strong> {appointmentData?.problemDescription}</p>
          </div>
        </div>

        <div className="chat-section">
          {(isVideoCall || isAudioCall) && (
            <div className="call-interface">
              {isVideoCall && (
                <div className="video-interface">
                  <div className="video-container">
                    <div className="remote-video">
                      <div className="video-placeholder">
                        {userType === 'farmer' ? appointmentData?.doctorName : appointmentData?.farmerName}
                        <br />
                        📹 {language === 'bn' ? 'ভিডিও কল চালু' : 'Video Call Active'}
                      </div>
                    </div>
                    <div className="local-video">
                      <div className="video-placeholder small">
                        {language === 'bn' ? 'আপনি' : 'You'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {isAudioCall && (
                <div className="audio-interface">
                  <div className="audio-indicator">
                    🔊 {language === 'bn' ? 'অডিও কল চালু' : 'Audio Call Active'}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="chat-container">
            <h3>{content[language].chatWith}</h3>
            <div className="messages-container">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender === userType ? 'own-message' : 'other-message'}`}>
                  <div className="message-header">
                    <span className="sender-name">{msg.senderName}</span>
                    <span className="message-time">
                      {msg.timestamp.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="message-content">{msg.message}</div>
                </div>
              ))}
              {isTyping && (
                <div className="message other-message typing-indicator">
                  <div className="message-content">
                    <em>{content[language].typing}</em>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={content[language].messagePlaceholder}
                className="message-input"
                rows="3"
              />
              <button onClick={handleSendMessage} className="send-button">
                {content[language].send}
              </button>
            </div>
          </div>
        </div>

        <div className="consultation-notes">
          <h3>{content[language].consultationNotes}</h3>
          <textarea
            value={consultationNotes}
            onChange={(e) => setConsultationNotes(e.target.value)}
            placeholder={content[language].addNote}
            className="notes-textarea"
            rows="4"
          />
          <button onClick={saveConsultationNotes} className="save-notes-btn">
            {content[language].saveNotes}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;
