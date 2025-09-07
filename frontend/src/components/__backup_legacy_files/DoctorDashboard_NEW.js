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
