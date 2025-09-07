import React, { useEffect, useMemo, useState } from 'react';
import './DoctorDashboard.css';
import PrescriptionWriter from './PrescriptionWriter';
// Chat/Consultation removed; doctors will join via Google Meet links attached to appointments

function DoctorDashboard({ language = 'bn', onLogout, doctorData }) {

import React, { useEffect, useMemo, useState } from 'react';
import './DoctorDashboard.css';
import PrescriptionWriter from './PrescriptionWriter';

function DoctorDashboard({ language = 'bn', onLogout, doctorData }) {
  // State management for appointments and doctor info from backend
  const [appointments, setAppointments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Prescription states
  const [showPrescription, setShowPrescription] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Get JWT token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('doctorToken');
  };

  // API call helper with authentication
  const apiCall = async (url, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`http://localhost:5000${url}`, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('doctorToken');
        localStorage.removeItem('doctorProfile');
        alert(language === 'bn' ? 'লগইন সেশন শেষ হয়েছে। আবার লগইন করুন।' : 'Session expired. Please login again.');
        onLogout();
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };

  // Load appointments from backend
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall('/api/doctor/appointments');
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError(language === 'bn' ? 'অ্যাপয়েন্টমেন্ট লোড করতে সমস্যা হয়েছে' : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard statistics from backend
  const loadDashboardStats = async () => {
    try {
      const data = await apiCall('/api/doctor/dashboard/stats');
      setDashboardStats({
        total: data.totalAppointments || 0,
        today: data.todayAppointments || 0,
        pending: data.pendingAppointments || 0,
        completed: data.completedAppointments || 0
      });
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    loadAppointments();
    loadDashboardStats();
  }, []);

  const content = {
    bn: {
      welcome: 'স্বাগতম',
      dashboard: 'ডাক্তার ড্যাশবোর্ড',
      myAppointments: 'আমার অ্যাপয়েন্টমেন্ট',
      todaysAppointments: 'আজকের অ্যাপয়েন্টমেন্ট',
      upcomingAppointments: 'আসন্ন অ্যাপয়েন্টমেন্ট',
      completedAppointments: 'সম্পন্ন অ্যাপয়েন্টমেন্ট',
      profile: 'প্রোফাইল',
      logout: 'লগআউট',
      appointmentStatus: {
        pending: 'অপেক্ষমান',
        confirmed: 'নিশ্চিত',
        accepted: 'গৃহীত',
        payment_pending: 'পেমেন্ট বাকি',
        completed: 'সম্পন্ন',
        cancelled: 'বাতিল'
      },
      urgencyLevels: {
        normal: 'সাধারণ',
        urgent: 'জরুরি',
        emergency: 'জরুরি অবস্থা'
      },
      farmTypes: {
        rice: 'ধান চাষ',
        vegetables: 'সবজি চাষ',
        fruits: 'ফল চাষ',
        livestock: 'পশুপালন',
        poultry: 'মুরগি পালন',
        fish: 'মাছ চাষ',
        fisheries: 'মৎস্য চাষ',
        other: 'অন্যান্য'
      },
      joinConsultation: 'পরামর্শে যোগ দিন',
      viewDetails: 'বিস্তারিত দেখুন',
      addNotes: 'নোট যোগ করুন',
      approveAppointment: 'অ্যাপয়েন্টমেন্ট অনুমোদন',
      acceptAppointment: 'গ্রহণ করুন',
      rejectAppointment: 'অ্যাপয়েন্টমেন্ট বাতিল',
      writePrescription: 'প্রেসক্রিপশন লিখুন',
      prescriptionGiven: 'প্রেসক্রিপশন দেওয়া হয়েছে',
      noAppointments: 'কোন অ্যাপয়েন্টমেন্ট নেই',
      loading: 'লোড করা হচ্ছে...',
      error: 'ত্রুটি',
      farmerName: 'কৃষকের নাম',
      farmerPhone: 'ফোন নম্বর',
      farmerAddress: 'ঠিকানা',
      appointmentDate: 'তারিখ',
      appointmentTime: 'সময়',
      problem: 'সমস্যা',
      urgency: 'জরুরি অবস্থা',
      farmType: 'খামারের ধরন',
      consultationNotes: 'পরামর্শের নোট',
      backToDashboard: 'ড্যাশবোর্ডে ফিরুন',
      totalAppointments: 'মোট অ্যাপয়েন্টমেন্ট',
      todayCount: 'আজকের',
      pendingCount: 'অপেক্ষমান',
      completedCount: 'সম্পন্ন',
      messages: 'বার্তা',
      chatWithFarmers: 'কৃষকদের সাথে কথা বলুন'
    },
    en: {
      welcome: 'Welcome',
      dashboard: 'Doctor Dashboard',
      myAppointments: 'My Appointments',
      todaysAppointments: "Today's Appointments",
      upcomingAppointments: 'Upcoming Appointments',
      completedAppointments: 'Completed Appointments',
      profile: 'Profile',
      logout: 'Logout',
      appointmentStatus: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        accepted: 'Accepted',
        payment_pending: 'Payment Pending',
        completed: 'Completed',
        cancelled: 'Cancelled'
      },
      urgencyLevels: {
        normal: 'Normal',
        urgent: 'Urgent',
        emergency: 'Emergency'
      },
      farmTypes: {
        rice: 'Rice Farming',
        vegetables: 'Vegetable Farming',
        fruits: 'Fruit Farming',
        livestock: 'Livestock',
        poultry: 'Poultry',
        fish: 'Fish Farming',
        fisheries: 'Fisheries',
        other: 'Other'
      },
      joinConsultation: 'Join Consultation',
      viewDetails: 'View Details',
      addNotes: 'Add Notes',
      approveAppointment: 'Approve',
      acceptAppointment: 'Accept',
      rejectAppointment: 'Reject',
      writePrescription: 'Write Prescription',
      prescriptionGiven: 'Prescription Given',
      noAppointments: 'No appointments found',
      loading: 'Loading...',
      error: 'Error',
      farmerName: 'Farmer Name',
      farmerPhone: 'Phone Number',
      farmerAddress: 'Address',
      appointmentDate: 'Date',
      appointmentTime: 'Time',
      problem: 'Problem',
      urgency: 'Urgency',
      farmType: 'Farm Type',
      consultationNotes: 'Consultation Notes',
      backToDashboard: 'Back to Dashboard',
      totalAppointments: 'Total Appointments',
      todayCount: 'Today',
      pendingCount: 'Pending',
      completedCount: 'Completed',
      messages: 'Messages',
      chatWithFarmers: 'Chat with Farmers'
    }
  };

  const t = content[language];

  // Update appointment status via backend API
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      await apiCall(`/api/doctor/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      
      // Reload appointments and stats after status update
      await loadAppointments();
      await loadDashboardStats();
      
      alert(language === 'bn' ? 'অ্যাপয়েন্টমেন্ট আপডেট হয়েছে' : 'Appointment updated successfully');
    } catch (err) {
      console.error('Failed to update appointment:', err);
      alert(language === 'bn' ? 'আপডেট করতে সমস্যা হয়েছে' : 'Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  // Add consultation notes via backend API  
  const addConsultationNotes = async (appointmentId, notes) => {
    try {
      await apiCall(`/api/doctor/appointments/${appointmentId}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({ consultationNotes: notes })
      });
      
      // Reload appointments after adding notes
      await loadAppointments();
      
      alert(language === 'bn' ? 'নোট যোগ হয়েছে' : 'Notes added successfully');
    } catch (err) {
      console.error('Failed to add notes:', err);
      alert(language === 'bn' ? 'নোট যোগ করতে সমস্যা হয়েছে' : 'Failed to add notes');
    }
  };

  // Appointment action handlers
  const approveAppointment = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'accepted');
  };

  const rejectAppointment = (appointmentId) => {
    if (window.confirm(language === 'bn' ? 'অ্যাপয়েন্টমেন্ট বাতিল করবেন?' : 'Are you sure you want to reject this appointment?')) {
      updateAppointmentStatus(appointmentId, 'cancelled');
    }
  };

  const completeAppointment = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'completed');
  };

  // Prescription handlers
  const handleCreatePrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescription(true);
  };

  const handlePrescriptionSave = async (prescriptionData) => {
    try {
      // Add prescription notes to the appointment
      await addConsultationNotes(selectedAppointment.id, 
        `Prescription: ${prescriptionData.prescriptionNo}\nMedicines: ${prescriptionData.medicines.map(m => m.name).join(', ')}\nInstructions: ${prescriptionData.instructions}`
      );
      
      setShowPrescription(false);
      setSelectedAppointment(null);
    } catch (e) {
      console.warn('handlePrescriptionSave failed', e);
    }
  };

  // Check if appointment is ready for consultation
  const isConsultationReady = (appointment) => {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff <= 15 && minutesDiff >= -120 && (appointment.status === 'confirmed' || appointment.status === 'accepted');
  };

  // Sort appointments by date and time
  const sortedAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    
    return [...appointments].sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
      return dateA - dateB;
    });
  }, [appointments]);

  if (loading && appointments.length === 0) {
    return (
      <div className="doctor-dashboard">
        <div className="loading-container">
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-dashboard">
        <div className="error-container">
          <p>{t.error}: {error}</p>
          <button onClick={loadAppointments}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>{t.welcome}, {doctorData?.name || 'ডাক্তার সাহেব'}!</h1>
            <p>{t.dashboard}</p>
          </div>
          <div className="header-actions">
            <button className="profile-btn">{t.profile}</button>
            <button className="logout-btn" onClick={onLogout}>{t.logout}</button>
          </div>
        </div>
      </header>

      {/* Dashboard Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{dashboardStats.total}</h3>
          <p>{t.totalAppointments}</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardStats.today}</h3>
          <p>{t.todayCount}</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardStats.pending}</h3>
          <p>{t.pendingCount}</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardStats.completed}</h3>
          <p>{t.completedCount}</p>
        </div>
      </div>

      <main className="dashboard-main">
        <div className="app-shell">
          <aside className="sidebar">
            <nav className="nav">
              <button className="nav-item active">🗓️ {t.myAppointments}</button>
            </nav>
          </aside>

          <section className="main-pane">
            {doctorData && (
              <div className="card" style={{marginBottom:'0.5rem'}}>
                <h3 style={{margin:'0 0 .5rem 0'}}>{language==='bn'?'আপনার প্রোফাইল':'Your Profile'}</h3>
                <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
                  <div><strong>{language==='bn'?'বিশেষত্ব':'Specialization'}:</strong> {doctorData.specialization}</div>
                  <div><strong>{language==='bn'?'অভিজ্ঞতা':'Experience'}:</strong> {doctorData.experienceYears} years</div>
                  <div><strong>{language==='bn'?'ফি':'Fee'}:</strong> ৳{doctorData.consultationFee}</div>
                </div>
              </div>
            )}

            <div className="card">
              <h2 style={{marginTop:0}}>{t.myAppointments}</h2>
              {loading ? (
                <div className="loading-appointments">
                  <p>{t.loading}</p>
                </div>
              ) : sortedAppointments.length === 0 ? (
                <div className="no-appointments">
                  <p>{t.noAppointments}</p>
                </div>
              ) : (
                <div className="appointments-grid">
                  {sortedAppointments.map(appointment => {
                    const canJoin = isConsultationReady(appointment) && !!appointment.google_meet_link;
                    return (
                      <div key={appointment.id} className={`appointment-card doctor-card ${appointment.status}`}>
                        <div className="appointment-header">
                          <h3>{appointment.farmer_name || 'Farmer'}</h3>
                          <div className="appointment-meta">
                            <span className={`status-badge ${appointment.status}`}>
                              {t.appointmentStatus[appointment.status] || appointment.status}
                            </span>
                            <span className={`urgency-badge ${appointment.urgency}`}>
                              {t.urgencyLevels[appointment.urgency] || appointment.urgency}
                            </span>
                          </div>
                        </div>
                        <div className="appointment-details">
                          <div className="detail-row">
                            <strong>{t.appointmentDate}:</strong>
                            <span>{appointment.appointment_date}</span>
                          </div>
                          <div className="detail-row">
                            <strong>{t.appointmentTime}:</strong>
                            <span>{appointment.appointment_time}</span>
                          </div>
                          <div className="detail-row">
                            <strong>{t.farmerPhone}:</strong>
                            <span>{appointment.farmer_phone}</span>
                          </div>
                          <div className="detail-row">
                            <strong>{t.farmType}:</strong>
                            <span>{t.farmTypes[appointment.farm_type] || appointment.farm_type}</span>
                          </div>
                          <div className="detail-row">
                            <strong>{t.problem}:</strong>
                            <span>{appointment.problem_description}</span>
                          </div>
                          {appointment.consultation_notes && (
                            <div className="detail-row">
                              <strong>{t.consultationNotes}:</strong>
                              <span>{appointment.consultation_notes}</span>
                            </div>
                          )}
                        </div>
                        <div className="appointment-actions">
                          {appointment.status === 'pending' && (
                            <>
                              <button 
                                className="approve-btn" 
                                onClick={() => approveAppointment(appointment.id)}
                                disabled={loading}
                              >
                                {t.acceptAppointment}
                              </button>
                              <button 
                                className="reject-btn" 
                                onClick={() => rejectAppointment(appointment.id)}
                                disabled={loading}
                              >
                                {t.rejectAppointment}
                              </button>
                            </>
                          )}
                          
                          {appointment.google_meet_link && (
                            <a
                              className={`join-consultation-btn ${canJoin ? 'active' : 'disabled'}`}
                              href={appointment.google_meet_link || '#'}
                              onClick={(e) => { 
                                if (!canJoin || !appointment.google_meet_link) { 
                                  e.preventDefault(); 
                                  alert(language === 'bn' ? 'Google Meet লিংক পাওয়া যায়নি বা সময় হয়নি' : 'Google Meet link not available or not time yet');
                                } 
                              }}
                              target="_blank" 
                              rel="noreferrer"
                              title={canJoin ? 
                                (language === 'bn' ? 'Google Meet এ যোগ দিন' : 'Join Google Meet consultation') : 
                                (language === 'bn' ? 'এখনো সময় হয়নি' : 'Not time yet or not confirmed')
                              }
                            >
                              🎥 {language === 'bn' ? 'Google Meet যোগ দিন' : 'Join Google Meet'}
                            </a>
                          )}
                          
                          {(appointment.status === 'confirmed' || appointment.status === 'accepted') && (
                            <>
                              <button 
                                className="view-details-btn" 
                                onClick={() => completeAppointment(appointment.id)}
                                disabled={loading}
                              >
                                {language === 'bn' ? 'সম্পন্ন করুন' : 'Mark Completed'}
                              </button>
                              
                              <button 
                                className="prescription-btn" 
                                onClick={() => handleCreatePrescription(appointment)}
                              >
                                📋 {t.writePrescription}
                              </button>
                              
                              <button 
                                className="notes-btn"
                                onClick={() => {
                                  const notes = prompt(language === 'bn' ? 'পরামর্শের নোট লিখুন:' : 'Enter consultation notes:');
                                  if (notes) {
                                    addConsultationNotes(appointment.id, notes);
                                  }
                                }}
                              >
                                📝 {t.addNotes}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      
      {/* Prescription Writer Modal */}
      {showPrescription && selectedAppointment && (
        <PrescriptionWriter
          appointment={selectedAppointment}
          doctorData={doctorData}
          language={language}
          onClose={() => setShowPrescription(false)}
          onSave={handlePrescriptionSave}
        />
      )}
    </div>
  );
}

export default DoctorDashboard;

  const content = {
    bn: {
      welcome: 'স্বাগতম',
      dashboard: 'ডাক্তার ড্যাশবোর্ড',
      myAppointments: 'আমার অ্যাপয়েন্টমেন্ট',
      todaysAppointments: 'আজকের অ্যাপয়েন্টমেন্ট',
      upcomingAppointments: 'আসন্ন অ্যাপয়েন্টমেন্ট',
      completedAppointments: 'সম্পন্ন অ্যাপয়েন্টমেন্ট',
      profile: 'প্রোফাইল',
      logout: 'লগআউট',
      appointmentStatus: {
        pending: 'অপেক্ষমান',
        confirmed: 'নিশ্চিত',
        completed: 'সম্পন্ন',
        cancelled: 'বাতিল'
      },
      urgencyLevels: {
        normal: 'সাধারণ',
        urgent: 'জরুরি',
        emergency: 'জরুরি অবস্থা'
      },
      farmTypes: {
        rice: 'ধান চাষ',
        vegetables: 'সবজি চাষ',
        fruits: 'ফল চাষ',
        livestock: 'পশুপালন',
        poultry: 'মুরগি পালন',
        fish: 'মাছ চাষ'
      },
      joinConsultation: 'পরামর্শে যোগ দিন',
      viewDetails: 'বিস্তারিত দেখুন',
      addNotes: 'নোট যোগ করুন',
      approveAppointment: 'অ্যাপয়েন্টমেন্ট অনুমোদন',
      rejectAppointment: 'অ্যাপয়েন্টমেন্ট বাতিল',
      writePrescription: 'প্রেসক্রিপশন লিখুন',
      prescriptionGiven: 'প্রেসক্রিপশন দেওয়া হয়েছে',
      noAppointments: 'কোন অ্যাপয়েন্টমেন্ট নেই',
      farmerName: 'কৃষকের নাম',
      farmerPhone: 'ফোন নম্বর',
      farmerAddress: 'ঠিকানা',
      appointmentDate: 'তারিখ',
      appointmentTime: 'সময়',
      problem: 'সমস্যা',
      urgency: 'জরুরি অবস্থা',
      farmType: 'খামারের ধরন',
      consultationNotes: 'পরামর্শের নোট',
      backToDashboard: 'ড্যাশবোর্ডে ফিরুন',
      totalAppointments: 'মোট অ্যাপয়েন্টমেন্ট',
      todayCount: 'আজকের',
      pendingCount: 'অপেক্ষমান',
      completedCount: 'সম্পন্ন',
      messages: 'বার্তা',
      chatWithFarmers: 'কৃষকদের সাথে কথা বলুন'
    },
    en: {
      welcome: 'Welcome',
      dashboard: 'Doctor Dashboard',
      myAppointments: 'My Appointments',
      todaysAppointments: "Today's Appointments",
      upcomingAppointments: 'Upcoming Appointments',
      completedAppointments: 'Completed Appointments',
      profile: 'Profile',
      logout: 'Logout',
      appointmentStatus: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        completed: 'Completed',
        cancelled: 'Cancelled'
      },
      urgencyLevels: {
        normal: 'Normal',
        urgent: 'Urgent',
        emergency: 'Emergency'
      },
      farmTypes: {
        rice: 'Rice Farming',
        vegetables: 'Vegetable Farming',
        fruits: 'Fruit Farming',
        livestock: 'Livestock',
        poultry: 'Poultry',
        fish: 'Fish Farming'
      },
      joinConsultation: 'Join Consultation',
      viewDetails: 'View Details',
      addNotes: 'Add Notes',
      approveAppointment: 'Approve',
      rejectAppointment: 'Reject',
      writePrescription: 'Write Prescription',
      prescriptionGiven: 'Prescription Given',
      noAppointments: 'No appointments found',
      farmerName: 'Farmer Name',
      farmerPhone: 'Phone Number',
      farmerAddress: 'Address',
      appointmentDate: 'Date',
      appointmentTime: 'Time',
      problem: 'Problem',
      urgency: 'Urgency',
      farmType: 'Farm Type',
      consultationNotes: 'Consultation Notes',
      backToDashboard: 'Back to Dashboard',
      totalAppointments: 'Total Appointments',
      todayCount: 'Today',
      pendingCount: 'Pending',
      completedCount: 'Completed',
      messages: 'Messages',
      chatWithFarmers: 'Chat with Farmers'
    }
  };

  const t = content[language];

  // Helpers to seed demo appointments for first-time doctor view
  const pad2 = (n) => String(n).padStart(2, '0');
  const genId = () => Date.now() + Math.floor(Math.random() * 10000);
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const tPlus = (mins) => {
    const d = new Date(Date.now() + mins * 60000);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };
  const generateMeetLink = () => {
    const seg = () => Math.random().toString(36).slice(2, 6);
    return `https://meet.google.com/${seg()}-${seg()}-${seg()}`;
  };

  // no separate views; doctors join via Meet link directly

  // Chat/Message center removed

  const updateFarmerHistoryStatus = (appointmentId, newStatus, patch = {}) => {
    try {
      const hist = JSON.parse(localStorage.getItem('farmerAppointmentsHistory') || '[]');
      const idx = hist.findIndex(h => h.id === appointmentId);
      if (idx !== -1) {
        hist[idx].status = newStatus;
        // apply any patch fields like new date/time/link
        hist[idx] = { ...hist[idx], ...patch };
        localStorage.setItem('farmerAppointmentsHistory', JSON.stringify(hist));
      }
    } catch (e) {
      console.warn('updateFarmerHistoryStatus failed', e);
    }
  };

  const approveAppointment = (appointmentId) => {
    try {
      const all = JSON.parse(localStorage.getItem('appointments') || '[]');
      const idx = all.findIndex(a => a.id === appointmentId);
      if (idx !== -1) {
        const appt = all[idx];
        // compute next available slot respecting doctor's availability and existing confirmed slots
        const findDoc = () => {
          if (doctorInfo) return doctorInfo;
          const list = JSON.parse(localStorage.getItem('doctors') || '[]');
          return doctorId ? list.find(d => d.id === doctorId) : list.find(d => d.fullName === doctorData?.name);
        };
        const doc = findDoc();
        const slotMinutes = 30; // each consultation = 30 minutes
        const addMinutes = (hm, add) => {
          const [h, m] = (hm || '00:00').split(':').map(Number);
          const total = h * 60 + m + add;
          const hh = String(Math.floor(total / 60)).padStart(2, '0');
          const mm = String(total % 60).padStart(2, '0');
          return `${hh}:${mm}`;
        };
        const roundUpToSlot = (timeHM) => {
          const [h, m] = (timeHM || '00:00').split(':').map(Number);
          const rem = m % slotMinutes;
          const add = rem === 0 ? 0 : (slotMinutes - rem);
          return addMinutes(timeHM, add);
        };
        const getDayName = (dateObj) => dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const getNextSlot = () => {
          const daysAllowed = (doc?.availableDays || []).map(d => d.toLowerCase());
          const from = doc?.availableTimeFrom || '09:00';
          const to = doc?.availableTimeTo || '17:00';
          const start = new Date();
          for (let add=0; add<=14; add++) {
            const d = new Date(start.getTime() + add*24*60*60000);
            const dayName = getDayName(d);
            if (daysAllowed.length && !daysAllowed.includes(dayName)) continue;
            const dateISO = d.toISOString().slice(0,10);
            const todaysConfirmed = all.filter(x => (doctorId ? x.doctorId === doctorId : x.doctorName === doctorData?.name) && x.status === 'confirmed' && x.appointmentDate === dateISO);
            const taken = new Set(todaysConfirmed.map(x => x.appointmentTime));
            let startHM = from;
            if (add === 0) {
              const nowHM = roundUpToSlot(new Date().toTimeString().slice(0,5));
              if (nowHM > startHM) startHM = nowHM;
            }
            // iterate slots
            for (let t=startHM; t<=to; t = addMinutes(t, slotMinutes)) {
              // ensure t+slot within window
              const endHM = addMinutes(t, slotMinutes);
              if (endHM > to) break;
              if (!taken.has(t)) return { date: dateISO, time: t };
            }
          }
          // fallback: keep existing
          return { date: appt.appointmentDate || todayISO(), time: appt.appointmentTime || '10:00' };
        };
        const next = getNextSlot();
        all[idx] = {
          ...appt,
          status: 'payment_pending',
          appointmentDate: next.date,
          appointmentTime: next.time,
          googleMeetLink: appt.googleMeetLink || generateMeetLink()
        };
        localStorage.setItem('appointments', JSON.stringify(all));
        updateFarmerHistoryStatus(appointmentId, 'payment_pending', { appointmentDate: next.date, appointmentTime: next.time, googleMeetLink: all[idx].googleMeetLink });
      }
      // Notify farmer: send payment required notification instead of acceptance
      const apt = all[idx];
      if (apt) {
        const paymentNotif = {
          id: Date.now(),
          type: 'payment_required',
          title: language === 'bn' ? 'পেমেন্ট প্রয়োজন' : 'Payment Required',
          content: language === 'bn' ? `${apt.appointmentDate} ${apt.appointmentTime} — পেমেন্ট সম্পন্ন করে অ্যাপয়েন্টমেন্ট নিশ্চিত করুন।` : `${apt.appointmentDate} ${apt.appointmentTime} — Complete payment to confirm appointment.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          isPaid: false,
          doctorName: apt.doctorName,
          appointmentId: apt.id,
          appointmentDate: apt.appointmentDate,
          appointmentTime: apt.appointmentTime,
          googleMeetLink: apt.googleMeetLink,
          fee: apt.fee,
          farmerPhone: apt.farmerPhone
        };
        const farmerNotifs = JSON.parse(localStorage.getItem('farmerNotifications') || '[]');
        farmerNotifs.unshift(paymentNotif);
        localStorage.setItem('farmerNotifications', JSON.stringify(farmerNotifs));
      }
      // Refresh local state
      const refreshed = JSON.parse(localStorage.getItem('appointments') || '[]').filter(a => (doctorId ? a.doctorId === doctorId : (doctorData?.name ? a.doctorName === doctorData.name : true)));
      setAppointments(refreshed);
    } catch (e) {
      console.warn('approveAppointment failed', e);
    }
  };

  // Prescription handlers
  const handleCreatePrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescription(true);
  };

  const handlePrescriptionSave = (prescriptionData) => {
    try {
      // Update appointment status to include prescription
      const allApts = JSON.parse(localStorage.getItem('appointments') || '[]');
      const updated = allApts.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, prescriptionGiven: true, prescriptionNo: prescriptionData.prescriptionNo }
          : apt
      );
      localStorage.setItem('appointments', JSON.stringify(updated));
      
      // Update farmer history as well
      updateFarmerHistoryStatus(selectedAppointment.id, null, { prescriptionGiven: true, prescriptionNo: prescriptionData.prescriptionNo });
      
      setShowPrescription(false);
      setSelectedAppointment(null);
      
      // Refresh appointments
      const refreshed = JSON.parse(localStorage.getItem('appointments') || '[]').filter(a => (doctorId ? a.doctorId === doctorId : (doctorData?.name ? a.doctorName === doctorData.name : true)));
      setAppointments(refreshed);
    } catch (e) {
      console.warn('handlePrescriptionSave failed', e);
    }
  };

  const rejectAppointment = (appointmentId) => {
    try {
      const all = JSON.parse(localStorage.getItem('appointments') || '[]');
      const idx = all.findIndex(a => a.id === appointmentId);
      if (idx !== -1) {
        all[idx].status = 'cancelled';
        localStorage.setItem('appointments', JSON.stringify(all));
        updateFarmerHistoryStatus(appointmentId, 'cancelled');
      }
      const refreshed = JSON.parse(localStorage.getItem('appointments') || '[]').filter(a => (doctorId ? a.doctorId === doctorId : (doctorData?.name ? a.doctorName === doctorData.name : true)));
      setAppointments(refreshed);
    } catch (e) {
      console.warn('rejectAppointment failed', e);
    }
  };

  const completeAppointment = (appointmentId) => {
    try {
      const all = JSON.parse(localStorage.getItem('appointments') || '[]');
      const idx = all.findIndex(a => a.id === appointmentId);
      if (idx !== -1) {
        all[idx].status = 'completed';
        localStorage.setItem('appointments', JSON.stringify(all));
        updateFarmerHistoryStatus(appointmentId, 'completed');
      }
      const refreshed = JSON.parse(localStorage.getItem('appointments') || '[]').filter(a => (doctorId ? a.doctorId === doctorId : (doctorData?.name ? a.doctorName === doctorData.name : true)));
      setAppointments(refreshed);
    } catch (e) {
      console.warn('completeAppointment failed', e);
    }
  };

  // Check if appointment is ready for consultation
  const isConsultationReady = (appointment) => {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff <= 15 && minutesDiff >= -120 && appointment.status === 'confirmed';
  };

  // Get today's date
  // Sort by date then time
  const sortedAppointments = useMemo(() => {
    const toKey = (a) => `${a.appointmentDate || ''} ${a.appointmentTime || ''}`;
    return [...appointments].sort((x, y) => (toKey(x) > toKey(y) ? 1 : -1));
  }, [appointments]);

  // Consultation room removed; doctors use Meet link directly

  // Unified single-page view with sidebar
  return (
    <div className="doctor-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>{t.welcome}, {doctorData?.name || 'ডাক্তার সাহেব'}!</h1>
            <p>{t.dashboard}</p>
          </div>
          <div className="header-actions">
            <button className="profile-btn">{t.profile}</button>
            <button className="logout-btn" onClick={onLogout}>{t.logout}</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="app-shell">
          <aside className="sidebar">
            <nav className="nav">
              <button className="nav-item active">🗓️ {t.myAppointments}</button>
            </nav>
          </aside>

          <section className="main-pane">
            {doctorInfo && (
              <div className="card" style={{marginBottom:'0.5rem'}}>
                <h3 style={{margin:'0 0 .5rem 0'}}>{language==='bn'?'আপনার সেবার সময়সূচি':'Your Availability'}</h3>
                <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
                  <div><strong>{language==='bn'?'দিন':'Days'}:</strong> {doctorInfo.availableDays?.join(', ') || '-'}</div>
                  <div><strong>{language==='bn'?'সময়':'Time'}:</strong> {doctorInfo.availableTimeFrom} - {doctorInfo.availableTimeTo}</div>
                  <div><strong>{language==='bn'?'বিশেষত্ব':'Specialization'}:</strong> {doctorInfo.specialization}</div>
                </div>
              </div>
            )}

            <div className="card">
              <h2 style={{marginTop:0}}>{t.myAppointments}</h2>
              {sortedAppointments.length === 0 ? (
                <div className="no-appointments"><p>{t.noAppointments}</p></div>
              ) : (
                <div className="appointments-grid">
                  {sortedAppointments.map(appointment => {
                    const canJoin = appointment.status === 'confirmed' && !!appointment.googleMeetLink;
                    return (
                      <div key={appointment.id} className={`appointment-card doctor-card ${appointment.status}`}>
                        <div className="appointment-header">
                          <h3>{appointment.farmerName || 'Farmer'}</h3>
                          <div className="appointment-meta">
                            <span className={`status-badge ${appointment.status}`}>{t.appointmentStatus[appointment.status]}</span>
                            <span className={`urgency-badge ${appointment.urgency}`}>{t.urgencyLevels[appointment.urgency]}</span>
                          </div>
                        </div>
                        <div className="appointment-details">
                          <div className="detail-row"><strong>{t.appointmentDate}:</strong><span>{appointment.appointmentDate}</span></div>
                          <div className="detail-row"><strong>{t.appointmentTime}:</strong><span>{appointment.appointmentTime}</span></div>
                          <div className="detail-row"><strong>{t.farmerPhone}:</strong><span>{appointment.farmerPhone}</span></div>
                          <div className="detail-row"><strong>{t.farmType}:</strong><span>{t.farmTypes[appointment.farmType] || appointment.farmType}</span></div>
                          <div className="detail-row"><strong>{t.problem}:</strong><span>{appointment.problemDescription}</span></div>
                        </div>
                        <div className="appointment-actions">
                          {appointment.status === 'pending' && (
                            <>
                              <button className="approve-btn" onClick={() => approveAppointment(appointment.id)}>{t.approveAppointment}</button>
                              <button className="reject-btn" onClick={() => rejectAppointment(appointment.id)}>{t.rejectAppointment}</button>
                            </>
                          )}
                          <a
                            className={`join-consultation-btn ${canJoin ? 'active' : 'disabled'}`}
                            href={appointment.googleMeetLink || '#'}
                            onClick={(e)=>{ 
                              if(!canJoin || !appointment.googleMeetLink){ 
                                e.preventDefault(); 
                                alert(language==='bn' ? 'Google Meet লিংক পাওয়া যায়নি' : 'Google Meet link not available');
                              } 
                            }}
                            target="_blank" rel="noreferrer"
                            title={canJoin ? (language==='bn'?'Google Meet এ যোগ দিন':'Join Google Meet consultation') : (language==='bn'?'প্রথমে অ্যাপয়েন্টমেন্ট কনফার্ম করুন':'Please confirm appointment first')}
                          >
                            🎥 {language==='bn'?'Google Meet যোগ দিন':'Join Google Meet'}
                          </a>
                          {appointment.status === 'confirmed' && (
                            <>
                              <button className="view-details-btn" onClick={() => completeAppointment(appointment.id)}>{language==='bn'?'সম্পন্ন করুন':'Mark Completed'}</button>
                              {appointment.prescriptionGiven ? (
                                <div className="prescription-status">
                                  ✅ {t.prescriptionGiven}
                                </div>
                              ) : (
                                <button className="prescription-btn" onClick={() => handleCreatePrescription(appointment)}>
                                  📋 {t.writePrescription}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      {/* Simplified: single page, no chat, no extra filters */}
      
      {/* Prescription Writer Modal */}
      {showPrescription && selectedAppointment && (
        <PrescriptionWriter
          appointment={selectedAppointment}
          doctorData={doctorData}
          language={language}
          onClose={() => setShowPrescription(false)}
          onSave={handlePrescriptionSave}
        />
      )}
    </div>
  );
}

export default DoctorDashboard;
