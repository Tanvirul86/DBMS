import React, { useEffect, useState } from 'react';
import './FarmerDashboard.css';
import MedicineShops from '../features/MedicineShops';
import PaymentDashboard from '../features/PaymentDashboard';
import OrderConfirmation from '../features/OrderConfirmation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function FarmerDashboard({ language = 'bn', onLogout }) {
  const t = {
    bn: {
      title: 'কৃষক ড্যাশবোর্ড',
      book: 'অ্যাপয়েন্টমেন্ট বুক',
      notifications: 'নোটিফিকেশন',
      history: 'ইতিহাস',
      profile: 'প্রোফাইল',
      prescriptions: 'প্রেসক্রিপশন',
      orders: 'ওষুধ অর্ডার',
      medicineShops: 'ওষুধের দোকান',
      logout: 'লগআউট',
      bookTitle: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      problem: 'আপনার সমস্যা',
      doctorSelect: 'ডাক্তার নির্বাচন করুন',
      selectDoctor: 'একজন ডাক্তার নির্বাচন করুন',
      farmType: 'চাষাবাদের ধরন',
      details: 'বিস্তারিত (ঐচ্ছিক)',
      helper: 'তারিখ ও সময় স্বয়ংক্রিয়ভাবে ধরা হবে',
      select: 'নির্বাচন করুন',
  types: { rice: 'ধান', vegetables: 'সবজি', fruits: 'ফল', livestock: 'পশুপালন', poultry: 'মুরগি', fish: 'মৎস্য' },
  specifyFarmType: 'খামারের ধরন লিখুন',
      requestBtn: 'রিকোয়েস্ট সাবমিট করুন',
      requesting: 'রিকোয়েস্ট পাঠানো হচ্ছে…',
      none: 'এখনও কোন নোটিফিকেশন নেই',
      assignedTo: 'অ্যাসাইনড ডাক্তার',
      date: 'তারিখ',
      time: 'সময়',
      joinMeet: 'Google Meet যোগ দিন',
      histTitle: 'অ্যাপয়েন্টমেন্ট ইতিহাস',
      histNone: 'কোন ইতিহাস নেই',
      cols: { doctor: 'ডাক্তার', problem: 'সমস্যা', farmType: 'চাষাবাদ', status: 'অবস্থা', actions: 'অ্যাকশন' },
      urgency: 'অগ্রাধিকার',
      urgent: 'জরুরি',
      normal: 'সাধারণ',
  status: { 
    pending: 'অপেক্ষমান', 
    accepted: 'গ্রহণ করা হয়েছে',
    rejected: 'প্রত্যাখ্যান করা হয়েছে',
    confirmed: 'নিশ্চিত', 
    payment_pending: 'পেমেন্ট প্রয়োজন',
    completed: 'সম্পন্ন'
  },
      profTitle: 'প্রোফাইল তথ্য',
  name: 'নাম', phone: 'ফোন', address: 'ঠিকানা', save: 'সংরক্ষণ করুন', edit: 'এডিট', cancel: 'বাতিল',
  fee: 'ফি', estimatedFee: 'আনুমানিক ফি',
      prescTitle: 'আমার প্রেসক্রিপশনস',
      prescNone: 'কোন প্রেসক্রিপশন নেই',
      prescNo: 'প্রেসক্রিপশন নং',
      diagnosis: 'রোগ নির্ণয়',
      treatment: 'চিকিৎসা',
      medicines: 'ওষুধসমূহ',
      instructions: 'নির্দেশনা',
      followUp: 'পরবর্তী ভিজিট',
      download: 'ডাউনলোড',
      orderMedicine: 'ওষুধ অর্ডার করুন',
      medicineOrders: 'ওষুধ অর্ডার সমূহ',
      noOrders: 'কোন অর্ডার নেই',
      paymentRequired: 'পেমেন্ট প্রয়োজন',
      payNow: 'এখনই পেমেন্ট করুন',
      paymentCompleted: 'পেমেন্ট সম্পন্ন',
      appointmentConfirmed: 'অ্যাপয়েন্টমেন্ট নিশ্চিত',
      validation: { problem: 'সমস্যা লিখুন', farmType: 'চাষাবাদের ধরন নির্বাচন করুন' }
    },
    en: {
      title: 'Farmer Dashboard',
      book: 'Book',
      notifications: 'Notifications',
      history: 'History',
      profile: 'Profile',
      prescriptions: 'Prescriptions',
      orders: 'Medicine Orders',
      medicineShops: 'Medicine Shops',
      logout: 'Logout',
      bookTitle: 'Book Appointment',
      problem: 'Your Problem',
      doctorSelect: 'Select Doctor',
      selectDoctor: 'Please select a doctor',
      farmType: 'Farming Type',
      details: 'Details (optional)',
      helper: 'Date and time will be auto-assigned',
      select: 'Select',
  types: { rice: 'Rice', vegetables: 'Vegetables', fruits: 'Fruits', livestock: 'Livestock', poultry: 'Poultry', fish: 'Fish' },
  specifyFarmType: 'Specify Farm Type',
      requestBtn: 'Submit Request',
      requesting: 'Submitting…',
      none: 'No notifications yet',
      assignedTo: 'Assigned Doctor',
      date: 'Date',
      time: 'Time',
      joinMeet: 'Join Google Meet',
      histTitle: 'Appointment History',
      histNone: 'No history yet',
      cols: { doctor: 'Doctor', problem: 'Problem', farmType: 'Farming', status: 'Status', actions: 'Actions' },
      urgency: 'Priority',
      urgent: 'Urgent',
      normal: 'Normal',
  status: { 
    pending: 'Pending', 
    accepted: 'Accepted',
    rejected: 'Rejected',
    confirmed: 'Confirmed', 
    payment_pending: 'Payment Required',
    completed: 'Completed'
  },
      profTitle: 'Profile Info',
  name: 'Name', phone: 'Phone', address: 'Address', save: 'Save', edit: 'Edit', cancel: 'Cancel',
  fee: 'Fee', estimatedFee: 'Estimated Fee',
      prescTitle: 'My Prescriptions',
      prescNone: 'No prescriptions yet',
      prescNo: 'Prescription No',
      diagnosis: 'Diagnosis',
      treatment: 'Treatment',
      medicines: 'Medicines',
      instructions: 'Instructions',
      followUp: 'Follow-up',
      download: 'Download',
      orderMedicine: 'Order Medicine',
      medicineOrders: 'Medicine Orders',
      noOrders: 'No orders yet',
      paymentRequired: 'Payment Required',
      payNow: 'Pay Now',
      paymentCompleted: 'Payment Completed',
      appointmentConfirmed: 'Appointment Confirmed',
      validation: { problem: 'Please enter a problem', farmType: 'Please select a farming type' }
    }
  }[language];

  const [active, setActive] = useState('book');
  const [profile, setProfile] = useState({ 
    name: language==='bn' ? 'কৃষক' : 'Farmer', 
    phone: '01XXXXXXXXX', 
    address: language==='bn' ? 'বাংলাদেশ' : 'Bangladesh', 
    farmType: '', 
    customFarmType: '' 
  });
  const [editMode, setEditMode] = useState(false);

  // Form state: problem, farmType, urgency, doctorId
  const [form, setForm] = useState({ problem: '', farmType: '', urgency: 'normal', doctorId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingPayments, setPendingPayments] = useState([]);
  
  // Direct medicine shop access state
  const [directMedicineShop, setDirectMedicineShop] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [generalMedicines, setGeneralMedicines] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicineOrderingStage, setMedicineOrderingStage] = useState(null); // null, 'shops', 'payment', 'confirmation'
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [medicineOrders, setMedicineOrders] = useState([]);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Load from database if user is logged in
        const response = await fetch('http://localhost:5000/api/farmer/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile({
            name: data.name || (language==='bn' ? 'কৃষক' : 'Farmer'),
            phone: data.phone || '01XXXXXXXXX',
            address: data.address || (language==='bn' ? 'বাংলাদেশ' : 'Bangladesh'),
            farmType: data.farmType || '',
            customFarmType: data.customFarmType || '',
            farmSize: data.farmSize || 0,
            experienceYears: data.experienceYears || 0
          });
          // Also update localStorage for offline access
          localStorage.setItem('farmerProfile', JSON.stringify({
            name: data.name,
            phone: data.phone,
            address: data.address,
            farmType: data.farmType,
            customFarmType: data.customFarmType || ''
          }));
          return;
        }
      }
    } catch (error) {
      console.error('Error loading profile from database:', error);
    }

    // Fallback to localStorage
    const p = JSON.parse(localStorage.getItem('farmerProfile') || '{}');
    setProfile({
      name: p.name || (language==='bn' ? 'কৃষক' : 'Farmer'),
      phone: p.phone || '01XXXXXXXXX',
      address: p.address || (language==='bn' ? 'বাংলাদেশ' : 'Bangladesh'),
      farmType: p.farmType || '',
      customFarmType: p.customFarmType || '',
      farmSize: p.farmSize || 0,
      experienceYears: p.experienceYears || 0
    });
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Save to database
        const response = await fetch('http://localhost:5000/api/farmer/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: profile.name,
            address: profile.address,
            farmType: profile.farmType,
            farmSize: profile.farmSize,
            experienceYears: profile.experienceYears
          })
        });

        if (response.ok) {
          // Also update localStorage for offline access
          localStorage.setItem('farmerProfile', JSON.stringify(profile));
          setEditMode(false);
          alert(language === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!');
          return;
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error saving profile to database:', error);
      alert(language === 'bn' ? 'প্রোফাইল আপডেট করতে ব্যর্থ!' : 'Failed to update profile!');
    }

    // Fallback to localStorage only
    localStorage.setItem('farmerProfile', JSON.stringify(profile));
    setEditMode(false);
  };

  const loadAvailableDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const doctors = await response.json();
        console.log('Available doctors:', doctors);
        setAvailableDoctors(doctors);
      } else {
        console.warn('Failed to fetch doctors');
        // Fallback to demo doctors
        const demoDoctors = [
          { id: 1, name: 'Dr. Rahman Ahmed', specialization: 'crop_diseases', rating: 4.8 },
          { id: 2, name: 'Dr. Fatima Khan', specialization: 'livestock_health', rating: 4.6 },
          { id: 3, name: 'Dr. Mohammad Ali', specialization: 'fish_diseases', rating: 4.9 }
        ];
        setAvailableDoctors(demoDoctors);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      // Fallback to demo doctors
      const demoDoctors = [
        { id: 1, name: 'Dr. Rahman Ahmed', specialization: 'crop_diseases', rating: 4.8 },
        { id: 2, name: 'Dr. Fatima Khan', specialization: 'livestock_health', rating: 4.6 },
        { id: 3, name: 'Dr. Mohammad Ali', specialization: 'fish_diseases', rating: 4.9 }
      ];
      setAvailableDoctors(demoDoctors);
    }
  };

  const loadNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, cannot load notifications');
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/notifications/farmer', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('farmerProfile');
          alert(language === 'bn' ? 'লগইন সেশন শেষ হয়েছে। আবার লগইন করুন।' : 'Session expired. Please login again.');
          return;
        }
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const allNotifications = await response.json();
      console.log('Loaded notifications from backend:', allNotifications);
      
      // Filter for appointment-related notifications
      const appointmentNotifications = allNotifications.filter(n => 
        n.title && (n.title.includes('Appointment') || n.title.includes('অ্যাপয়েন্টমেন্ট'))
      );
      
      appointmentNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(appointmentNotifications);
      
      const unread = appointmentNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
      
    } catch (error) {
      console.error('Error loading notifications from backend:', error);
      // Fallback to localStorage if backend fails
      const all = JSON.parse(localStorage.getItem('farmerNotifications') || '[]');
      const accepted = all.filter(n => n.type === 'appointment_accepted');
      accepted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(accepted);
      const unread = accepted.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    }
  };

  const loadPendingPayments = () => {
    if (!profile || !profile.phone) return;
    
    const all = JSON.parse(localStorage.getItem('farmerNotifications') || '[]');
    const paymentRequired = all.filter(n => 
      n.type === 'payment_required' && 
      n.farmerPhone === profile.phone &&
      !n.isPaid
    );
    paymentRequired.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setPendingPayments(paymentRequired);
  };

  const loadHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, cannot load appointment history');
      setHistory([]);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/appointments/farmer', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('farmerProfile');
          alert(language === 'bn' ? 'লগইন সেশন শেষ হয়েছে। আবার লগইন করুন।' : 'Session expired. Please login again.');
          return;
        }
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }

      const appointments = await response.json();
      console.log('Loaded appointments from backend:', appointments);
      
      // Transform backend data to match frontend expectations
      const transformedHistory = appointments.map(apt => ({
        id: apt.id,
        createdAt: new Date().toISOString(), // Could be improved with backend created_at field
        doctorName: apt.doctor_name,
        doctorId: apt.doctor_id,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        problem: apt.problem_description,
        farmType: apt.farm_type,
        urgency: apt.urgency,
        googleMeetLink: apt.google_meet_link,
        status: apt.status,
        fee: apt.fee,
        specialization: apt.specialization
      }));

      transformedHistory.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
      setHistory(transformedHistory);
    } catch (error) {
      console.error('Error loading appointment history:', error);
      // Fallback to localStorage if backend fails
      const list = JSON.parse(localStorage.getItem('farmerAppointmentsHistory') || '[]');
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setHistory(list);
    }
  };

  const loadPrescriptions = async () => {
    console.log('LoadPrescriptions called - using backend API');
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, cannot load prescriptions');
      setPrescriptions([]);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/prescriptions/farmer', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('farmerProfile');
          alert(language === 'bn' ? 'লগইন সেশন শেষ হয়েছে। আবার লগইন করুন।' : 'Session expired. Please login again.');
          return;
        }
        throw new Error(`Failed to fetch prescriptions: ${response.status}`);
      }

      const prescriptions = await response.json();
      console.log('Loaded prescriptions from backend:', prescriptions);
      
      // Transform backend data to match frontend expectations if needed
      // Backend prescriptions should already be in the correct format
      prescriptions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPrescriptions(prescriptions);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      
      // Fallback: Add sample prescriptions for testing if backend fails
      const farmerPhone = profile.phone || '01700000000';
      const samplePrescriptions = [
        {
          id: `PRESC${Date.now()}`,
          prescriptionNo: `P001-${new Date().getFullYear()}`,
          farmerName: profile.name || 'কৃষক নাম',
          farmerPhone: farmerPhone,
          farmerAge: '35',
          farmerAddress: profile.address || 'ঢাকা, বাংলাদেশ',
          doctorName: 'Dr. Rahman Ahmed',
          diagnosis: 'গাছের পাতায় দাগ রোগ',
          treatment: 'ছত্রাকনাশক স্প্রে ও যত্ন',
          medicines: [
            {
              name: 'ম্যানকোজেব ৭৫% WP',
              dosage: '২ গ্রাম প্রতি লিটার পানিতে',
              duration: '৭ দিন',
              instructions: 'সকাল ও সন্ধ্যা স্প্রে করুন'
            }
          ],
          instructions: 'নিয়মিত স্প্রে করুন এবং ৭ দিন পর রিপোর্ট করুন',
          followUpDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10),
          created_at: new Date().toISOString(),
          date: new Date().toLocaleDateString('bn-BD')
        }
      ];
      
      // Store sample data temporarily if no backend data
      localStorage.setItem('prescriptions', JSON.stringify(samplePrescriptions));
      setPrescriptions(samplePrescriptions);
    }
  };

  const loadMedicineOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, cannot load medicine orders');
      setMedicineOrders([]);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/orders/farmer', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('farmerProfile');
          alert(language === 'bn' ? 'লগইন সেশন শেষ হয়েছে। আবার লগইন করুন।' : 'Session expired. Please login again.');
          return;
        }
        throw new Error(`Failed to fetch medicine orders: ${response.status}`);
      }

      const orders = await response.json();
      console.log('Loaded medicine orders from backend:', orders);
      
      orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setMedicineOrders(orders);
      
    } catch (error) {
      console.error('Error loading medicine orders from backend:', error);
      // Fallback to localStorage if backend fails
      if (!profile || !profile.phone) {
        setMedicineOrders([]);
        return;
      }
      
      try {
        const orders = JSON.parse(localStorage.getItem('medicineOrders') || '[]');
        const farmerOrders = orders.filter(order => 
          order && 
          order.deliveryInfo && 
          order.deliveryInfo.phone && 
          order.deliveryInfo.phone === profile.phone
        );
        farmerOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setMedicineOrders(farmerOrders);
      } catch (fallbackError) {
        console.error('Error with localStorage fallback:', fallbackError);
        setMedicineOrders([]);
      }
    }
  };

  const handlePayment = (paymentNotification) => {
    setSelectedPayment(paymentNotification);
    setShowPaymentModal(true);
  };

  const processPayment = (paymentMethod) => {
    if (!selectedPayment) return;

    // Mark payment as paid
    const all = JSON.parse(localStorage.getItem('farmerNotifications') || '[]');
    const updated = all.map(n => 
      n.id === selectedPayment.id 
        ? { ...n, isPaid: true, paymentMethod, paidAt: new Date().toISOString() }
        : n
    );
    localStorage.setItem('farmerNotifications', JSON.stringify(updated));

    // Auto-confirm appointment
    const appointments = JSON.parse(localStorage.getItem('farmerAppointmentsHistory') || '[]');
    const appointmentUpdated = appointments.map(appt => 
      appt.id === selectedPayment.appointmentId
        ? { ...appt, status: 'confirmed', confirmedAt: new Date().toISOString() }
        : appt
    );
    localStorage.setItem('farmerAppointmentsHistory', JSON.stringify(appointmentUpdated));

    // Create confirmation notification
    const confirmationNotification = {
      id: Date.now() + Math.random(),
      type: 'appointment_confirmed',
      title: language === 'bn' ? 'অ্যাপয়েন্টমেন্ট নিশ্চিত' : 'Appointment Confirmed',
      content: language === 'bn' 
        ? `আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে। ডাক্তার: ${selectedPayment.doctorName}`
        : `Your appointment has been confirmed. Doctor: ${selectedPayment.doctorName}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      doctorName: selectedPayment.doctorName,
      appointmentDate: selectedPayment.appointmentDate,
      appointmentTime: selectedPayment.appointmentTime,
      googleMeetLink: selectedPayment.googleMeetLink,
      fee: selectedPayment.fee
    };

    updated.unshift(confirmationNotification);
    localStorage.setItem('farmerNotifications', JSON.stringify(updated));

    // Refresh data
    loadPendingPayments();
    loadNotifications();
    loadHistory();
    
    // Close modal
    setShowPaymentModal(false);
    setSelectedPayment(null);

    alert(language === 'bn' ? 'পেমেন্ট সম্পন্ন! অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে।' : 'Payment completed! Appointment confirmed.');
  };

  // Delete appointment function
  const deleteAppointment = async (appointmentId) => {
    const confirmMessage = language === 'bn' 
      ? 'আপনি কি নিশ্চিত যে এই অ্যাপয়েন্টমেন্টটি মুছে ফেলতে চান?'
      : 'Are you sure you want to delete this appointment?';
    
    if (!window.confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(language === 'bn' ? 'লগইন করুন' : 'Please login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert(language === 'bn' ? 'অ্যাপয়েন্টমেন্ট মুছে ফেলা হয়েছে!' : 'Appointment deleted successfully!');
        loadHistory(); // Reload the appointment list
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert(language === 'bn' ? 'অ্যাপয়েন্টমেন্ট মুছতে ব্যর্থ!' : 'Failed to delete appointment!');
    }
  };

  // Edit appointment function (for rescheduling)
  const editAppointment = async (appointmentId, newDate, newTime) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(language === 'bn' ? 'লগইন করুন' : 'Please login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentDate: newDate,
          appointmentTime: newTime,
          status: 'pending' // Reset status when rescheduling
        })
      });

      if (response.ok) {
        alert(language === 'bn' ? 'অ্যাপয়েন্টমেন্ট আপডেট হয়েছে!' : 'Appointment updated successfully!');
        loadHistory(); // Reload the appointment list
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert(language === 'bn' ? 'অ্যাপয়েন্টমেন্ট আপডেট করতে ব্যর্থ!' : 'Failed to update appointment!');
      return false;
    }
  };

  useEffect(() => {
    loadProfile();
    loadAvailableDoctors(); // Load doctors for selection dropdown
    // Force add prescriptions immediately for testing
    const forcePrescriptions = [
      {
        id: 'FORCE1',
        prescriptionNo: 'P001-2025',
        farmerName: 'Test Farmer',
        farmerPhone: '01700000000',
        doctorName: 'Dr. Rahman Ahmed',
        diagnosis: 'গাছের পাতায় দাগ রোগ',
        treatment: 'ছত্রাকনাশক স্প্রে ও যত্ন',
        medicines: [
          {
            name: 'ম্যানকোজেব ৭৫% WP',
            dosage: '২ গ্রাম প্রতি লিটার পানিতে',
            duration: '৭ দিন',
            instructions: 'সকাল ও সন্ধ্যা স্প্রে করুন'
          }
        ],
        instructions: 'নিয়মিত স্প্রে করুন',
        followUp: '১ সপ্তাহ পর',
        createdAt: new Date().toISOString(),
        date: new Date().toLocaleDateString('bn-BD')
      }
    ];
    setPrescriptions(forcePrescriptions);
    localStorage.setItem('prescriptions', JSON.stringify(forcePrescriptions));
    
    // Load other data after a small delay to ensure profile is loaded
    setTimeout(() => {
      loadPrescriptions();
      loadMedicineOrders();
      loadNotifications();
      loadHistory();
    }, 100);
    // Seed a demo notification once
    const seeded = localStorage.getItem('farmerDemoSeeded');
    if (!seeded) {
      const now = new Date();
      const apptDate = now.toISOString().slice(0, 10);
      const apptTime = now.toTimeString().slice(0, 5);
      const doctors = ['Dr. Rahman Ahmed', 'Dr. Fatima Begum', 'Dr. Karim Hossain'];
      const doctorName = doctors[Math.floor(Math.random()*doctors.length)];
      const seg = () => Math.random().toString(36).slice(2,6);
      const googleMeetLink = `https://meet.google.com/${seg()}-${seg()}-${seg()}`;
      const demo = {
        id: Date.now(),
        type: 'appointment_accepted',
        title: language==='bn' ? 'ডেমো: অ্যাপয়েন্টমেন্ট গ্রহণ' : 'Demo: Appointment Accepted',
        content: language==='bn' ? `${apptDate} ${apptTime} — ডেমো নোটিফিকেশন` : `Demo notification for ${apptDate} ${apptTime}`,
        timestamp: now.toISOString(),
        isRead: false,
        doctorName,
        appointmentDate: apptDate,
        appointmentTime: apptTime,
        googleMeetLink,
        fee: 200
      };
      const existing = JSON.parse(localStorage.getItem('farmerNotifications') || '[]');
      existing.unshift(demo);
      localStorage.setItem('farmerNotifications', JSON.stringify(existing));
      localStorage.setItem('farmerDemoSeeded', '1');
    }
    // Seed sample appointments/history for understanding
    const samplesSeeded = localStorage.getItem('farmerSamplesSeeded');
    if (!samplesSeeded) {
      try {
        // Also seed demo doctors and login accounts if not already
        if (!localStorage.getItem('demoDoctorsSeeded')) {
          const demoDoctors = [
            { id: 1, fullName: 'Demo Doctor', specialization: 'crop_diseases', availableDays: ['saturday','sunday','monday','tuesday','wednesday','thursday'], availableTimeFrom: '09:00', availableTimeTo: '17:00' }
          ];
          const existingDocs = JSON.parse(localStorage.getItem('doctors') || '[]');
          const merged = [...existingDocs, ...demoDoctors.filter(d => !existingDocs.some(e => e.id === d.id))];
          localStorage.setItem('doctors', JSON.stringify(merged));
          const doctorAccounts = JSON.parse(localStorage.getItem('doctorAccounts') || '{}');
          const mergedAccounts = {
            ...doctorAccounts,
            'rahman.ahmed@demo.com': { password: '123456', id: 1001, name: 'Dr. Rahman Ahmed' },
            'fatima.begum@demo.com': { password: '123456', id: 1002, name: 'Dr. Fatima Begum' },
            'karim.hossain@demo.com': { password: '123456', id: 1003, name: 'Dr. Karim Hossain' }
          };
          localStorage.setItem('doctorAccounts', JSON.stringify(mergedAccounts));
          localStorage.setItem('demoDoctorsSeeded', '1');
        }
        const prof = JSON.parse(localStorage.getItem('farmerProfile') || '{}');
        const genId = () => Date.now() + Math.floor(Math.random()*10000);
        const pad = (n) => String(n).padStart(2,'0');
        const now = new Date();
        const today = now.toISOString().slice(0,10);
        const tPlus = (mins) => {
          const d = new Date(now.getTime() + mins*60000);
          return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };
        const yesterday = new Date(now.getTime() - 24*60*60000).toISOString().slice(0,10);
        const sampleA = {
          id: genId(),
          createdAt: now.toISOString(),
          doctorName: 'Demo Doctor',
          appointmentDate: today,
          appointmentTime: tPlus(60),
          problem: 'ধানের পাতায় বাদামী দাগ',
          problemDescription: 'ধানের পাতায় বাদামী দাগ পড়ছে, কী করতে হবে?',
          farmType: 'rice',
          urgency: 'normal',
          googleMeetLink: generateMeetLink(),
          status: 'pending',
          fee: calculateFee('normal'),
          doctorId: 1,
          farmerName: prof.name || 'Farmer', farmerPhone: prof.phone || '01XXXXXXXXX', farmerAddress: prof.address || 'Bangladesh'
        };
        const sampleB = {
          id: genId(),
          createdAt: now.toISOString(),
          doctorName: 'Demo Doctor',
          appointmentDate: today,
          appointmentTime: tPlus(120),
          problem: 'টমেটো গাছে পোকার আক্রমণ',
          problemDescription: 'টমেটো গাছে পোকার আক্রমণ হয়েছে',
          farmType: 'vegetables',
          urgency: 'urgent',
          googleMeetLink: generateMeetLink(),
          status: 'confirmed',
          fee: calculateFee('urgent'),
          doctorId: 1,
          farmerName: prof.name || 'Farmer', farmerPhone: prof.phone || '01XXXXXXXXX', farmerAddress: prof.address || 'Bangladesh'
        };
        const sampleC = {
          id: genId(),
          createdAt: now.toISOString(),
          doctorName: 'Demo Doctor',
          appointmentDate: yesterday,
          appointmentTime: '10:30',
          problem: 'গরুর দুধ কমে গেছে',
          problemDescription: 'গরুর দুধ উৎপাদন কমে গেছে',
          farmType: 'livestock',
          urgency: 'normal',
          googleMeetLink: generateMeetLink(),
          status: 'completed',
          fee: calculateFee('normal'),
          doctorId: 1,
          farmerName: prof.name || 'Farmer', farmerPhone: prof.phone || '01XXXXXXXXX', farmerAddress: prof.address || 'Bangladesh'
        };
        // Push to global appointments
        const allApts = JSON.parse(localStorage.getItem('appointments') || '[]');
        allApts.unshift(sampleA, sampleB, sampleC);
        localStorage.setItem('appointments', JSON.stringify(allApts));
        // Push to farmer history
        const hist = JSON.parse(localStorage.getItem('farmerAppointmentsHistory') || '[]');
        hist.unshift(sampleA, sampleB, sampleC);
        localStorage.setItem('farmerAppointmentsHistory', JSON.stringify(hist));
        // Add one accepted notification for the confirmed sample
        const farmerNotifs = JSON.parse(localStorage.getItem('farmerNotifications') || '[]');
        farmerNotifs.unshift({
          id: genId(),
          type: 'appointment_accepted',
          title: language==='bn' ? 'অ্যাপয়েন্টমেন্ট গ্রহণ করা হয়েছে' : 'Appointment Accepted',
          content: language==='bn' ? `${sampleB.appointmentDate} ${sampleB.appointmentTime} — জরুরি অনুরোধ গ্রহণ করা হয়েছে।` : `${sampleB.appointmentDate} ${sampleB.appointmentTime} — Urgent request accepted.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          doctorName: sampleB.doctorName,
          appointmentDate: sampleB.appointmentDate,
          appointmentTime: sampleB.appointmentTime,
          googleMeetLink: sampleB.googleMeetLink,
          fee: sampleB.fee
        });
        
        // Add a payment required notification for demo
        farmerNotifs.unshift({
          id: genId(),
          type: 'payment_required',
          title: language==='bn' ? 'পেমেন্ট প্রয়োজন' : 'Payment Required',
          content: language==='bn' ? `${sampleA.appointmentDate} ${sampleA.appointmentTime} — পেমেন্ট সম্পন্ন করে অ্যাপয়েন্টমেন্ট নিশ্চিত করুন।` : `${sampleA.appointmentDate} ${sampleA.appointmentTime} — Complete payment to confirm appointment.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          isPaid: false,
          doctorName: sampleA.doctorName,
          appointmentId: sampleA.id,
          appointmentDate: sampleA.appointmentDate,
          appointmentTime: sampleA.appointmentTime,
          googleMeetLink: sampleA.googleMeetLink,
          fee: sampleA.fee,
          farmerPhone: profile.phone || '01XXXXXXXXX'
        });
        
        localStorage.setItem('farmerNotifications', JSON.stringify(farmerNotifs));
        localStorage.setItem('farmerSamplesSeeded', '1');
      } catch (e) {
        console.warn('Sample appointments seeding failed', e);
      }
    }
    loadNotifications();
    loadHistory();
    loadPrescriptions();
    loadMedicineOrders();
    loadAvailableDoctors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Load prescriptions when profile phone is available
  useEffect(() => {
    if (profile.phone) {
      loadPrescriptions();
      loadMedicineOrders();
      loadPendingPayments();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.phone]);

  // Mark notifications as read when the tab is opened
  useEffect(() => {
    if (active === 'notifications' && unreadCount > 0) {
      markAllNotificationsAsRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const markAllNotificationsAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      for (const notification of unreadNotifications) {
        await fetch(`http://localhost:5000/api/notifications/${notification.id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      // Refresh notifications after marking as read
      loadNotifications();
      
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      // Fallback to localStorage
      const all = JSON.parse(localStorage.getItem('farmerNotifications') || '[]');
      const updated = all.map(n => ({ ...n, isRead: true }));
      localStorage.setItem('farmerNotifications', JSON.stringify(updated));
      loadNotifications();
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const generateMeetLink = () => {
    const seg = () => Math.random().toString(36).slice(2, 6);
    return `https://meet.google.com/${seg()}-${seg()}-${seg()}`;
  };

  const calculateFee = (urgency) => {
    const base = 200; // ৳200 normal
    return urgency === 'urgent' ? base + 100 : base; // urgent +৳100
  };
  const formatFee = (fee) => `${language==='bn' ? '৳' : '৳'}${fee}`;

  const displayFarmType = (code) => {
    const map = (language==='bn')
      ? { rice: 'ধান', vegetables: 'সবজি', fruits: 'ফল', livestock: 'পশুপালন', poultry: 'মুরগি', fish: 'মৎস্য' }
      : { rice: 'Rice', vegetables: 'Vegetables', fruits: 'Fruits', livestock: 'Livestock', poultry: 'Poultry', fish: 'Fish' };
    return map[code] || code || (language==='bn' ? 'নির্ধারিত নয়' : 'Not set');
  };

  const getSpecializationLabel = (specialization) => {
    const specializationMap = {
      bn: {
        crop_diseases: 'ফসলের রোগ বিশেষজ্ঞ',
        pest_management: 'পোকামাকড় নিয়ন্ত্রণ বিশেষজ্ঞ',
        soil_fertility: 'মাটির উর্বরতা বিশেষজ্ঞ',
        plant_nutrition: 'উদ্ভিদ পুষ্টি বিশেষজ্ঞ',
        livestock_health: 'পশু স্বাস্থ্য বিশেষজ্ঞ',
        organic_farming: 'জৈব চাষাবাদ বিশেষজ্ঞ'
      },
      en: {
        crop_diseases: 'Crop Disease Specialist',
        pest_management: 'Pest Management Expert',
        soil_fertility: 'Soil Fertility Expert',
        plant_nutrition: 'Plant Nutrition Expert',
        livestock_health: 'Livestock Health Expert',
        organic_farming: 'Organic Farming Expert'
      }
    };
    return specializationMap[language][specialization] || specialization;
  };

  const downloadPrescription = async (prescription, format = 'text') => {
    try {
      // Get full prescription details from API
      const token = localStorage.getItem('token');
      if (!token) {
        alert(language === 'bn' ? 'লগইন প্রয়োজন' : 'Login required');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescription.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prescription details');
      }

      const fullPrescription = await response.json();
      
      if (format === 'pdf') {
        // Generate PDF
        await downloadPrescriptionPDF(fullPrescription);
      } else {
        // Generate text file
        await downloadPrescriptionText(fullPrescription);
      }
      
      alert(language === 'bn' ? 
        `প্রেসক্রিপশন সফলভাবে ${format === 'pdf' ? 'পিডিএফ' : 'টেক্সট'} ফরম্যাটে ডাউনলোড হয়েছে!` :
        `Prescription downloaded successfully in ${format.toUpperCase()} format!`
      );

    } catch (error) {
      console.error('Error downloading prescription:', error);
      // Fallback to existing method if API fails
      const fallbackData = {
        prescription_no: prescription.prescriptionNo || prescription.prescription_no,
        created_at: prescription.date || new Date().toISOString(),
        doctor_name: prescription.doctorName || prescription.doctor_name,
        farmer_name: prescription.farmerName || 'কৃষক',
        farmer_phone: prescription.farmerPhone || '',
        problem_description: prescription.problem || '',
        diagnosis: prescription.diagnosis,
        treatment: prescription.treatment,
        medicines: JSON.stringify(prescription.medicines || []),
        instructions: prescription.instructions,
        follow_up_date: prescription.followUpDate
      };

      if (format === 'pdf') {
        await downloadPrescriptionPDF(fallbackData);
      } else {
        await downloadPrescriptionText(fallbackData);
      }
    }
  };

  const downloadPrescriptionText = async (fullPrescription) => {
    const content = `
গ্রামীণ কৃষি - ডিজিটাল প্রেসক্রিপশন
=====================================

প্রেসক্রিপশন নং: ${fullPrescription.prescription_no}
তারিখ: ${new Date(fullPrescription.created_at).toLocaleDateString('bn-BD')}
ডাক্তার: ${fullPrescription.doctor_name}
বিশেষত্ব: ${fullPrescription.specialization || 'কৃষি বিশেষজ্ঞ'}

রোগীর তথ্য:
-----------
নাম: ${fullPrescription.farmer_name}
ফোন: ${fullPrescription.farmer_phone}
ঠিকানা: ${fullPrescription.farmer_address || 'N/A'}
সমস্যা: ${fullPrescription.problem_description || 'N/A'}

${fullPrescription.appointment_date ? `পরামর্শের তথ্য:
--------------
তারিখ: ${fullPrescription.appointment_date}
সময়: ${fullPrescription.appointment_time}` : ''}

রোগ নির্ণয়:
-----------
${fullPrescription.diagnosis}

চিকিৎসা পরামর্শ:
--------------
${fullPrescription.treatment}

ওষুধসমূহ:
----------
${JSON.parse(fullPrescription.medicines || '[]').map((med, idx) => `${idx + 1}. ${med.name}
   মাত্রা: ${med.dosage}
   সময়কাল: ${med.duration}
   নির্দেশনা: ${med.instructions || ''}`).join('\n\n')}

${fullPrescription.instructions ? `অতিরিক্ত নির্দেশনা:
-------------------
${fullPrescription.instructions}` : ''}

${fullPrescription.follow_up_date ? `পরবর্তী ভিজিট:
--------------
${new Date(fullPrescription.follow_up_date).toLocaleDateString('bn-BD')}` : ''}

ডাক্তারের স্বাক্ষর: ${fullPrescription.doctor_name}

=====================================
গ্রামীণ কৃষি টেলি-মেডিসিন সেবা
www.grameen-krishi.com
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prescription-${fullPrescription.prescription_no}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadPrescriptionPDF = async (fullPrescription) => {
    const doc = new jsPDF();
    
    // Set font for Bengali support (fallback to default if not available)
    try {
      doc.setFont('Arial', 'normal');
    } catch (e) {
      // Use default font if Arial is not available
    }
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 30;
    
    // Header
    doc.setFontSize(16);
    doc.text('Grameen Krishi - Digital Prescription', margin, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('=====================================', margin, yPosition);
    yPosition += 15;
    
    // Prescription Info
    doc.text(`Prescription No: ${fullPrescription.prescription_no}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Date: ${new Date(fullPrescription.created_at).toLocaleDateString()}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Doctor: ${fullPrescription.doctor_name}`, margin, yPosition);
    yPosition += 8;
    if (fullPrescription.specialization) {
      doc.text(`Specialization: ${fullPrescription.specialization}`, margin, yPosition);
      yPosition += 8;
    }
    yPosition += 5;
    
    // Patient Info
    doc.setFontSize(14);
    doc.text('Patient Information:', margin, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Name: ${fullPrescription.farmer_name}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Phone: ${fullPrescription.farmer_phone}`, margin, yPosition);
    yPosition += 8;
    if (fullPrescription.farmer_address) {
      doc.text(`Address: ${fullPrescription.farmer_address}`, margin, yPosition);
      yPosition += 8;
    }
    if (fullPrescription.problem_description) {
      doc.text(`Problem: ${fullPrescription.problem_description}`, margin, yPosition);
      yPosition += 8;
    }
    yPosition += 5;
    
    // Consultation Info
    if (fullPrescription.appointment_date) {
      doc.setFontSize(14);
      doc.text('Consultation Information:', margin, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      doc.text(`Date: ${fullPrescription.appointment_date}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Time: ${fullPrescription.appointment_time}`, margin, yPosition);
      yPosition += 10;
    }
    
    // Diagnosis
    doc.setFontSize(14);
    doc.text('Diagnosis:', margin, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    const diagnosisLines = doc.splitTextToSize(fullPrescription.diagnosis, pageWidth - 2 * margin);
    doc.text(diagnosisLines, margin, yPosition);
    yPosition += diagnosisLines.length * 6 + 5;
    
    // Treatment
    doc.setFontSize(14);
    doc.text('Treatment Advice:', margin, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    const treatmentLines = doc.splitTextToSize(fullPrescription.treatment, pageWidth - 2 * margin);
    doc.text(treatmentLines, margin, yPosition);
    yPosition += treatmentLines.length * 6 + 10;
    
    // Medicines
    const medicines = JSON.parse(fullPrescription.medicines || '[]');
    if (medicines.length > 0) {
      doc.setFontSize(14);
      doc.text('Medicines:', margin, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      
      medicines.forEach((med, idx) => {
        if (yPosition > 250) { // Check if we need a new page
          doc.addPage();
          yPosition = 30;
        }
        
        doc.text(`${idx + 1}. ${med.name}`, margin, yPosition);
        yPosition += 8;
        doc.text(`   Dosage: ${med.dosage}`, margin + 5, yPosition);
        yPosition += 6;
        doc.text(`   Duration: ${med.duration}`, margin + 5, yPosition);
        yPosition += 6;
        if (med.instructions) {
          const instrLines = doc.splitTextToSize(`   Instructions: ${med.instructions}`, pageWidth - 2 * margin - 5);
          doc.text(instrLines, margin + 5, yPosition);
          yPosition += instrLines.length * 6;
        }
        yPosition += 5;
      });
    }
    
    // Instructions
    if (fullPrescription.instructions) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 30;
      }
      doc.setFontSize(14);
      doc.text('Additional Instructions:', margin, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      const instrLines = doc.splitTextToSize(fullPrescription.instructions, pageWidth - 2 * margin);
      doc.text(instrLines, margin, yPosition);
      yPosition += instrLines.length * 6 + 10;
    }
    
    // Follow-up
    if (fullPrescription.follow_up_date) {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 30;
      }
      doc.setFontSize(14);
      doc.text('Next Visit:', margin, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      doc.text(new Date(fullPrescription.follow_up_date).toLocaleDateString(), margin, yPosition);
      yPosition += 15;
    }
    
    // Signature
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 30;
    }
    doc.setFontSize(12);
    doc.text(`Doctor's Signature: ${fullPrescription.doctor_name}`, margin, yPosition);
    yPosition += 15;
    
    // Footer
    doc.text('=====================================', margin, yPosition);
    yPosition += 8;
    doc.text('Grameen Krishi Tele-Medicine Service', margin, yPosition);
    yPosition += 6;
    doc.text('www.grameen-krishi.com', margin, yPosition);
    
    // Save PDF
    doc.save(`prescription-${fullPrescription.prescription_no}.pdf`);
  };

  const handleOrderMedicine = (prescription) => {
    console.log('Order medicine clicked for prescription:', prescription);
    setSelectedPrescription(prescription);
    setMedicineOrderingStage('shops');
    console.log('Medicine ordering stage set to: shops');
  };

  // Handle direct medicine shop access (without prescription)
  const handleDirectMedicineShop = () => {
    console.log('🌱 Direct medicine shop access clicked - navigating to shops...');
    
    // Create a simple prescription for general medicines
    const generalMedicinesPrescription = {
      id: 'direct-order-' + Date.now(),
      prescription_no: 'DIRECT-' + Date.now(),
      doctor_name: language === 'bn' ? 'সাধারণ অর্ডার' : 'General Order',
      medicines: [
        {
          name: 'Mancozeb 75% WP',
          dosage: '2g per liter',
          duration: 'As needed',
          instructions: language === 'bn' ? 'প্রয়োজন অনুযায়ী ব্যবহার করুন' : 'Use as needed'
        },
        {
          name: 'Carbendazim 50% WP',
          dosage: '1g per liter',
          duration: 'As needed',
          instructions: language === 'bn' ? 'প্রয়োজন অনুযায়ী ব্যবহার করুন' : 'Use as needed'
        },
        {
          name: 'Imidacloprid 17.8% SL',
          dosage: '0.5ml per liter',
          duration: 'As needed',
          instructions: language === 'bn' ? 'প্রয়োজন অনুযায়ী ব্যবহার করুন' : 'Use as needed'
        },
        {
          name: 'Urea Fertilizer',
          dosage: '20-30g per plant',
          duration: 'Weekly',
          instructions: language === 'bn' ? 'সাপ্তাহিক ব্যবহার করুন' : 'Use weekly'
        }
      ]
    };
    
    console.log('Setting prescription:', generalMedicinesPrescription);
    console.log('Setting medicine ordering stage to: shops');
    
    // Set all required states
    setSelectedPrescription(generalMedicinesPrescription);
    setDirectMedicineShop(true);
    setMedicineOrderingStage('shops');
    
    console.log('✅ Navigation state set - should show medicine shops now');
  };

  // eslint-disable-next-line no-unused-vars
  const handleBackFromDirectShop = () => {
    setDirectMedicineShop(false);
    setSelectedPrescription(null);
    setMedicineOrderingStage(null);
    setActive('medicineShops'); // Go back to medicine shops section
  };

  const handleOrderShopSelected = (orderDetails) => {
    setOrderData(orderDetails);
    setMedicineOrderingStage('payment');
  };

  const handlePaymentComplete = (paymentInfo) => {
    setPaymentData(paymentInfo);
    setMedicineOrderingStage('confirmation');
  };

  const handleBackToShops = () => {
    if (directMedicineShop) {
      // Go back to medicine shops section for direct orders
      setActive('medicineShops');
      setDirectMedicineShop(false);
      setSelectedPrescription(null);
      setMedicineOrderingStage(null);
    } else {
      // Go back to prescriptions for prescription-based orders
      setMedicineOrderingStage('shops');
    }
    setOrderData(null);
  };

  const handleBackToDashboard = () => {
    setMedicineOrderingStage(null);
    setSelectedPrescription(null);
    setOrderData(null);
    setPaymentData(null);
    
    if (directMedicineShop) {
      // Go back to medicine shops section for direct orders
      setActive('medicineShops');
      setDirectMedicineShop(false);
    } else {
      // Go back to prescriptions section for prescription-based orders
      setActive('prescriptions');
    }
  };

  // const handleOrderComplete = (orderData) => {
  //   loadMedicineOrders();
  //   loadNotifications(); // Refresh notifications for order confirmation
  // };

  const validate = () => {
    if (!form.problem) return t.validation.problem;
    if (!form.farmType) return t.validation.farmType;
    if (!form.doctorId) return language==='bn' ? 'অনুগ্রহ করে একজন ডাক্তার নির্বাচন করুন' : 'Please select a doctor';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { console.warn('Validation:', err); return; }
    
    // Require doctor selection
    if (!form.doctorId) {
      alert(language === 'bn' ? 'অনুগ্রহ করে একজন ডাক্তার নির্বাচন করুন' : 'Please select a doctor');
      return;
    }
    
    setSubmitting(true);

    const now = new Date();
    
    // Get selected doctor details
    const selectedDoctor = availableDoctors.find(d => d.id === parseInt(form.doctorId));
    if (!selectedDoctor) {
      alert(language === 'bn' ? 'নির্বাচিত ডাক্তার পাওয়া যায়নি' : 'Selected doctor not found');
      setSubmitting(false);
      return;
    }
    
    const doctorId = selectedDoctor.id;
    const doctorName = selectedDoctor.name || selectedDoctor.fullName || 'Doctor';

    // Generate appointment time (next available slot)
    const apptDate = now.toISOString().slice(0,10);
    const apptTime = now.toTimeString().slice(0,5);
    const meet = generateMeetLink();
    const farmTypeForSave = form.farmType;

    // Prepare payload for backend (remove fee since no payment required)
    const payload = {
      doctorId: doctorId,
      doctorName,
      appointmentDate: apptDate,
      appointmentTime: apptTime,
      problem: form.problem,
      problemDescription: form.problem,
      farmType: farmTypeForSave,
      urgency: form.urgency,
      googleMeetLink: meet,
      farmerName: profile.name,
      farmerPhone: profile.phone,
      farmerAddress: profile.address,
      status: 'pending' // Doctor needs to accept/reject
    };

    console.log('Sending appointment request to doctor:', doctorName);
    console.log('Payload:', payload);

    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitting(false);
      alert(language === 'bn' ? 'অনুগ্রহ করে প্রথমে লগইন করুন' : 'Please login first');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.status === 201) {
        // Backend created appointment request — update local UI
        const nowIso = new Date().toISOString();
        const notif = {
          id: data.appointmentId || Date.now(),
          type: 'appointment_pending',
          title: language==='bn' ? 'অ্যাপয়েন্টমেন্ট রিকোয়েস্ট পাঠানো হয়েছে' : 'Appointment Request Sent',
          content: language==='bn' ? `${doctorName} এর কাছে ${apptDate} ${apptTime} এর জন্য অ্যাপয়েন্টমেন্ট রিকোয়েস্ট পাঠানো হয়েছে। ডাক্তারের অনুমোদনের অপেক্ষায়।` : `Appointment request sent to ${doctorName} for ${apptDate} ${apptTime}. Waiting for doctor approval.`,
          timestamp: nowIso,
          isRead: false,
          doctorName,
          doctorId: doctorId,
          appointmentDate: apptDate,
          appointmentTime: apptTime,
          googleMeetLink: meet,
          status: 'pending'
        };
        const notifs = JSON.parse(localStorage.getItem('farmerNotifications') || '[]');
        notifs.unshift(notif);
        localStorage.setItem('farmerNotifications', JSON.stringify(notifs));

        const record = {
          id: notif.id,
          createdAt: nowIso,
          doctorName,
          doctorId: doctorId,
          appointmentDate: apptDate,
          appointmentTime: apptTime,
          problem: form.problem,
          farmType: farmTypeForSave,
          urgency: form.urgency,
          googleMeetLink: meet,
          status: 'pending' // Waiting for doctor approval
        };
        const hist = JSON.parse(localStorage.getItem('farmerAppointmentsHistory') || '[]');
        hist.unshift(record);
        localStorage.setItem('farmerAppointmentsHistory', JSON.stringify(hist));

        // Also persist for doctor dashboards locally as fallback
        const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        allAppointments.unshift({ ...record, farmerName: profile.name, farmerPhone: profile.phone, farmerAddress: profile.address, problemDescription: form.problem });
        localStorage.setItem('appointments', JSON.stringify(allAppointments));

        setForm({ problem: '', farmType: '', urgency: 'normal', doctorId: '' });
        loadNotifications();
        loadHistory();
        setActive('notifications');
        
        // Show success message
        alert(language === 'bn' ? 
          `সফলভাবে অ্যাপয়েন্টমেন্ট রিকোয়েস্ট পাঠানো হয়েছে! ডাক্তার ${doctorName} এর অনুমোদনের অপেক্ষায়।` :
          `Appointment request sent successfully! Waiting for Dr. ${doctorName}'s approval.`
        );
      } else {
        console.warn('Appointment API failed', data);
        alert(data.error || 'Appointment request failed');
      }
    } catch (err) {
      console.error('Appointment request error', err);
      alert(language === 'bn' ? 'অ্যাপয়েন্টমেন্ট পাঠাতে সমস্যা হয়েছে' : 'Failed to submit appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="farmer-dashboard simple-layout">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>{t.title}</h1>
            {profile.name && <p>{profile.name}</p>}
          </div>
          <div className="header-actions">
            <button className="notification-btn" onClick={() => setActive('notifications')} aria-label="Notifications">
              🔔
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            <button className="logout-btn" onClick={onLogout}>{t.logout}</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="app-shell">
          <aside className="sidebar">
            <nav className="nav">
              {/* Sidebar order fixed */}
              <button className={`nav-item ${active==='book'?'active':''}`} onClick={() => setActive('book')}>📅 {language==='bn'?'অ্যাপয়েন্টমেন্ট':'Book'}</button>
              <button className={`nav-item ${active==='notifications'?'active':''}`} onClick={() => setActive('notifications')}>
                🔔 {t.notifications}
                {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
              </button>
              <button className={`nav-item ${active==='history'?'active':''}`} onClick={() => setActive('history')}>🗂️ {t.history}</button>
              <button className={`nav-item ${active==='prescriptions'?'active':''}`} onClick={() => setActive('prescriptions')}>📋 {t.prescriptions}</button>
              <button className={`nav-item ${active==='medicineShops'?'active':''}`} onClick={() => setActive('medicineShops')}>🏪 {t.medicineShops}</button>
              <button className={`nav-item ${active==='orders'?'active':''}`} onClick={() => setActive('orders')}>
                🛒 {t.orders}
                {medicineOrders.length > 0 && <span className="nav-badge">{medicineOrders.length}</span>}
              </button>
              <button className={`nav-item ${active==='profile'?'active':''}`} onClick={() => setActive('profile')}>👤 {t.profile}</button>
            </nav>
          </aside>

          <section className="main-pane">
            {active === 'book' && (
              <div className="card">
                <h2 style={{marginBottom: 8}}>{t.bookTitle}</h2>
                <p className="muted" style={{marginTop: 0}}>{t.helper}</p>
                
                {/* Doctor Information Panel */}
                <div className="info-panel" style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{margin: '0 0 0.75rem 0', color: '#16a34a', fontSize: '1rem'}}>
                    👨‍⚕️ {language === 'bn' ? 'নিবন্ধিত ডাক্তারগণ' : 'Registered Doctors'}
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.75rem',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{color: '#047857'}}>
                      <strong>{language === 'bn' ? '🌾 ফসলের রোগ বিশেষজ্ঞ' : '🌾 Crop Disease Specialists'}</strong>
                      <br />
                      {language === 'bn' ? 'ধান, সবজি, ফলের রোগ নিয়ে পরামর্শ' : 'Rice, vegetable, fruit disease consultation'}
                    </div>
                    <div style={{color: '#047857'}}>
                      <strong>{language === 'bn' ? '🐛 পোকামাকড় নিয়ন্ত্রণ বিশেষজ্ঞ' : '🐛 Pest Management Experts'}</strong>
                      <br />
                      {language === 'bn' ? 'কীটপতঙ্গ ও পোকা নিয়ন্ত্রণে সহায়তা' : 'Insect and pest control assistance'}
                    </div>
                    <div style={{color: '#047857'}}>
                      <strong>{language === 'bn' ? '🌱 মাটির উর্বরতা বিশেষজ্ঞ' : '🌱 Soil Fertility Experts'}</strong>
                      <br />
                      {language === 'bn' ? 'মাটি পরীক্ষা ও সার ব্যবহারে পরামর্শ' : 'Soil testing and fertilizer advice'}
                    </div>
                    <div style={{color: '#047857'}}>
                      <strong>{language === 'bn' ? '🐄 পশু স্বাস্থ্য বিশেষজ্ঞ' : '🐄 Livestock Health Experts'}</strong>
                      <br />
                      {language === 'bn' ? 'গবাদিপশু ও পোল্ট্রির যত্নে সহায়তা' : 'Livestock and poultry care assistance'}
                    </div>
                  </div>
                  <div style={{
                    marginTop: '0.75rem',
                    fontSize: '0.8rem',
                    color: '#059669',
                    textAlign: 'center'
                  }}>
                    💡 {language === 'bn' 
                      ? 'আপনার সমস্যার ধরন অনুযায়ী উপযুক্ত বিশেষজ্ঞ নির্বাচন করুন'
                      : 'Select the appropriate specialist based on your problem type'}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="simple-form">
                  <div className="form-row">
                    <label htmlFor="farmType">{t.farmType}</label>
                    <select id="farmType" name="farmType" value={form.farmType} onChange={handleFormChange} required>
                      <option value="">{t.select}</option>
                      <option value="rice">{language==='bn'?'ধান':'Rice'}</option>
                      <option value="vegetables">{language==='bn'?'সবজি':'Vegetables'}</option>
                      <option value="fruits">{language==='bn'?'ফল':'Fruits'}</option>
                      <option value="livestock">{language==='bn'?'পশুপালন':'Livestock'}</option>
                      <option value="poultry">{language==='bn'?'মুরগি':'Poultry'}</option>
                      <option value="fish">{language==='bn'?'মৎস্য':'Fish'}</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label htmlFor="problem">{t.problem}</label>
                    <input id="problem" name="problem" type="text" value={form.problem} onChange={handleFormChange} placeholder={language==='bn'?'সমস্যা লিখুন':'Describe your problem'} required />
                  </div>
                  <div className="form-row">
                    <label htmlFor="doctorId">{t.doctorSelect} *</label>
                    <select id="doctorId" name="doctorId" value={form.doctorId} onChange={handleFormChange} required>
                      <option value="">{t.selectDoctor}</option>
                      {availableDoctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name || doctor.fullName} ({getSpecializationLabel(doctor.specialization)}) {doctor.is_verified ? (language === 'bn' ? '✅ যাচাইকৃত' : '✅ Verified') : (language === 'bn' ? '⏳ নিবন্ধিত' : '⏳ Registered')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <label htmlFor="urgency">{t.urgency}</label>
                    <select id="urgency" name="urgency" value={form.urgency} onChange={handleFormChange}>
                      <option value="normal">{t.normal}</option>
                      <option value="urgent">{t.urgent}</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="primary-btn" disabled={submitting}>{submitting ? (language==='bn'?'রিকোয়েস্ট পাঠানো হচ্ছে…':'Submitting…') : (language==='bn'?'রিকোয়েস্ট সাবমিট করুন':'Submit Request')}</button>
                  </div>
                </form>
              </div>
            )}

            {active === 'notifications' && (
              <div className="card">
                <h2 style={{marginBottom: 16}}>{t.notifications}</h2>

                {notifications.length === 0 ? (
                  <div className="no-notifications">{t.none}</div>
                ) : (
                  <ul className="notification-list">
        {notifications.map(n => (
                      <li key={n.id} className="notification-item">
                        <div className="notification-main">
                          <div className="notification-title">{n.title}</div>
                          <div className="notification-content">
                            <div><strong>{t.assignedTo}:</strong> {n.doctorName}</div>
                            <div><strong>{t.date}:</strong> {n.appointmentDate} &nbsp; <strong>{t.time}:</strong> {n.appointmentTime}</div>
                            <div><strong>Status:</strong> {t.status[n.status] || n.status}</div>
                          </div>
                        </div>
                        <div className="notification-actions">
                          {n.status === 'accepted' && n.googleMeetLink && (
                            <a className="meet-btn" href={n.googleMeetLink} target="_blank" rel="noreferrer">{t.joinMeet}</a>
                          )}
                          {n.status === 'pending' && (
                            <span className="status-pending">Waiting for doctor approval...</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {active === 'history' && (
              <div className="card">
                <h2 style={{marginBottom: 16}}>{t.histTitle}</h2>
                {history.length === 0 ? (
                  <div className="no-notifications">{t.histNone}</div>
                ) : (
                  <div className="table-wrap">
                    <table className="simple-table">
                      <thead>
                        <tr>
                          <th>{t.date}</th>
                          <th>{t.time}</th>
                          <th>{language==='bn'?'অগ্রাধিকার':'Priority'}</th>
                          <th>{language==='bn'?'ডাক্তার':'Doctor'}</th>
                          <th>{language==='bn'?'সমস্যা':'Problem'}</th>
                          <th>{language==='bn'?'চাষাবাদ':'Farming'}</th>
                          <th>{language==='bn'?'অবস্থা':'Status'}</th>
                          <th>{language==='bn'?'অ্যাকশন':'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map(item => (
                          <tr key={item.id}>
                            <td>{item.appointmentDate}</td>
                            <td>{item.appointmentTime}</td>
                            <td>{item.urgency === 'urgent' ? (language==='bn'?'জরুরি':'Urgent') : (language==='bn'?'সাধারণ':'Normal')}</td>
                            <td>{item.doctorName}</td>
                            <td>{item.problem}</td>
                            <td>{item.farmType}</td>
                            <td><span className={`badge ${item.status}`}>{t.status[item.status] || item.status}</span></td>
                            <td>
                              <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                {item.status === 'accepted' && item.googleMeetLink && (
                                  <a href={item.googleMeetLink} target="_blank" rel="noreferrer" className="link">Meet</a>
                                )}
                                {item.status === 'pending' && (
                                  <>
                                    <button 
                                      onClick={() => {
                                        const newDate = prompt(language === 'bn' ? 'নতুন তারিখ (YYYY-MM-DD):' : 'New date (YYYY-MM-DD):', item.appointmentDate);
                                        const newTime = prompt(language === 'bn' ? 'নতুন সময় (HH:MM):' : 'New time (HH:MM):', item.appointmentTime);
                                        if (newDate && newTime) {
                                          editAppointment(item.id, newDate, newTime);
                                        }
                                      }}
                                      className="small-btn edit-btn"
                                      style={{fontSize: '0.7rem', padding: '2px 6px'}}
                                    >
                                      {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
                                    </button>
                                    <button 
                                      onClick={() => deleteAppointment(item.id)}
                                      className="small-btn delete-btn"
                                      style={{fontSize: '0.7rem', padding: '2px 6px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px'}}
                                    >
                                      {language === 'bn' ? 'মুছুন' : 'Delete'}
                                    </button>
                                  </>
                                )}
                                {item.status === 'pending' && !item.googleMeetLink && (
                                  <span style={{fontSize: '0.8rem', color: '#6c757d'}}>
                                    {language === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Waiting approval'}
                                  </span>
                                )}
                                {item.status !== 'pending' && item.status !== 'accepted' && '-'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {active === 'profile' && (
              <div className="card">
                <h2 style={{marginBottom: 16}}>{t.profTitle}</h2>
                {!editMode ? (
                  <div className="simple-form">
                    <div className="form-row"><label>{t.name}</label><div>{profile.name}</div></div>
                    <div className="form-row"><label>{t.phone}</label><div>{profile.phone}</div></div>
                    <div className="form-row"><label>{t.address}</label><div>{profile.address}</div></div>
                    <div className="form-row"><label>{t.farmType}</label><div>{displayFarmType(profile.farmType)}</div></div>
                    <div className="form-actions">
                      <button className="primary-btn" onClick={()=>setEditMode(true)}>{t.edit}</button>
                    </div>
                  </div>
                ) : (
                  <form className="simple-form" onSubmit={(e)=>{e.preventDefault(); saveProfile();}}>
                    <div className="form-row">
                      <label htmlFor="name">{t.name}</label>
                      <input id="name" name="name" value={profile.name} onChange={(e)=>setProfile(p=>({...p,name:e.target.value}))} />
                    </div>
                    <div className="form-row">
                      <label htmlFor="phone">{t.phone}</label>
                      <input id="phone" name="phone" value={profile.phone} onChange={(e)=>setProfile(p=>({...p,phone:e.target.value}))} />
                    </div>
                    <div className="form-row">
                      <label htmlFor="address">{t.address}</label>
                      <input id="address" name="address" value={profile.address} onChange={(e)=>setProfile(p=>({...p,address:e.target.value}))} />
                    </div>
                    <div className="form-row">
                      <label htmlFor="farmType">{t.farmType}</label>
                      <select id="farmType" name="farmType" value={profile.farmType} onChange={(e)=>setProfile(p=>({...p,farmType:e.target.value}))}>
                        <option value="">{t.select}</option>
                        <option value="rice">{language==='bn'?'ধান':'Rice'}</option>
                        <option value="vegetables">{language==='bn'?'সবজি':'Vegetables'}</option>
                        <option value="fruits">{language==='bn'?'ফল':'Fruits'}</option>
                        <option value="livestock">{language==='bn'?'পশুপালন':'Livestock'}</option>
                        <option value="poultry">{language==='bn'?'মুরগি':'Poultry'}</option>
                        <option value="fish">{language==='bn'?'মৎস্য':'Fish'}</option>
                      </select>
                    </div>
                    <div className="form-actions" style={{gap: '0.5rem'}}>
                      <button className="primary-btn" type="submit">{t.save}</button>
                      <button type="button" className="back-btn" onClick={()=>{setEditMode(false); loadProfile();}}>{t.cancel}</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {active === 'prescriptions' && (
              <div className="card">
                <h2 style={{marginBottom: 16, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between'}}>
                  <span>📋 {t.prescTitle}</span>
                  <button 
                    onClick={loadPrescriptions} 
                    style={{
                      background: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    🔄 Refresh
                  </button>
                </h2>
                {prescriptions.length === 0 ? (
                  <div className="no-notifications">
                    <div className="empty-state">
                      <div className="empty-icon">💊</div>
                      <h3>{t.prescNone}</h3>
                      <p>{language === 'bn' ? 'ডাক্তারের সাথে পরামর্শের পর এখানে প্রেসক্রিপশন দেখা যাবে' : 'Prescriptions will appear here after doctor consultations'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="prescriptions-list">
                    {prescriptions.map(p => (
                      <div key={p.prescriptionNo} className="prescription-card">
                        <div className="prescription-header">
                          <div className="prescription-info">
                            <h3>📋 {t.prescNo}: {p.prescriptionNo}</h3>
                            <div className="prescription-meta">
                              <span className="date">📅 {p.date}</span>
                              <span className="doctor">👨‍⚕️ {t.doctor}: {p.doctorName}</span>
                            </div>
                          </div>
                          <div className="prescription-status">
                            <span className="status-badge">✅ {language === 'bn' ? 'সম্পূর্ণ' : 'Complete'}</span>
                          </div>
                        </div>
                        
                        <div className="prescription-body">
                          <div className="diagnosis-section">
                            <h4>🔍 {t.diagnosis}</h4>
                            <p className="diagnosis-text">{p.diagnosis}</p>
                          </div>
                          
                          <div className="treatment-section">
                            <h4>💊 {t.treatment}</h4>
                            <p className="treatment-text">{p.treatment}</p>
                          </div>
                          
                          <div className="medicines-section">
                            <h4>💉 {t.medicines}</h4>
                            <div className="medicines-grid">
                              {p.medicines.map((med, idx) => (
                                <div key={idx} className="medicine-item">
                                  <div className="medicine-name">💊 {med.name}</div>
                                  <div className="medicine-details">
                                    <span className="dosage">⏰ {med.dosage}</span>
                                    <span className="duration">📅 {med.duration}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {p.instructions && (
                            <div className="instructions-section">
                              <h4>📝 {t.instructions}</h4>
                              <p className="instructions-text">{p.instructions}</p>
                            </div>
                          )}
                          
                          {p.followUpDate && (
                            <div className="followup-section">
                              <h4>📅 {t.followUp}</h4>
                              <p className="followup-date">{p.followUpDate}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="prescription-actions">
                          <button className="download-btn text-download" onClick={() => downloadPrescription(p, 'text')}>
                            � {language === 'bn' ? 'টেক্সট ডাউনলোড' : 'Download Text'}
                          </button>
                          <button className="download-btn pdf-download" onClick={() => downloadPrescription(p, 'pdf')}>
                            📋 {language === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF'}
                          </button>
                          <button className="view-btn" onClick={() => window.print()}>
                            🖨️ {language === 'bn' ? 'প্রিন্ট' : 'Print'}
                          </button>
                          <button className="order-medicine-btn" onClick={() => handleOrderMedicine(p)}>
                            🛒 {t.orderMedicine}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {active === 'medicineShops' && (
              <div className="card">
                <h2 style={{marginBottom: 16, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between'}}>
                  <span>🏪 {t.medicineShops}</span>
                </h2>
                
                <div className="medicine-shop-intro">
                  <div className="info-banner" style={{
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%)',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    border: '1px solid #d1fae5'
                  }}>
                    <h3 style={{margin: '0 0 0.5rem 0', color: '#065f46'}}>
                      🌾 {language === 'bn' ? 'কৃষি ওষুধ কিনুন' : 'Buy Agricultural Medicines'}
                    </h3>
                    <p style={{margin: 0, color: '#047857', fontSize: '0.95rem'}}>
                      {language === 'bn' 
                        ? 'প্রেসক্রিপশন ছাড়াই সাধারণ কৃষি ওষুধ সরাসরি অর্ডার করুন। বিশ্বস্ত দোকান থেকে গুণগত ওষুধ পান।' 
                        : 'Order common agricultural medicines directly without prescription. Get quality medicines from trusted shops.'
                      }
                    </p>
                  </div>
                  
                  <div className="medicine-categories" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                  }}>
                    <div className="category-card" style={{
                      background: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}
                    onClick={handleDirectMedicineShop}
                    onMouseEnter={(e) => {
                      const card = e.currentTarget;
                      card.style.borderColor = '#10b981';
                      card.style.transform = 'translateY(-2px)';
                      card.style.boxShadow = '0 4px 12px rgba(16,185,129,0.15)';
                      
                      // Show medicine preview
                      const preview = card.querySelector('.medicine-preview');
                      if (preview) {
                        preview.style.opacity = '1';
                        preview.style.pointerEvents = 'auto'; // Enable clicking on preview
                        preview.style.transform = 'translateY(0)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const card = e.currentTarget;
                      card.style.borderColor = '#e5e7eb';
                      card.style.transform = 'translateY(0)';
                      card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      
                      // Hide medicine preview
                      const preview = card.querySelector('.medicine-preview');
                      if (preview) {
                        preview.style.opacity = '0';
                        preview.style.pointerEvents = 'none';
                        preview.style.transform = 'translateY(-10px)';
                      }
                    }}>
                      <div style={{fontSize: '2.5rem', marginBottom: '0.75rem'}}>🌱</div>
                      <h4 style={{margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.1rem', fontWeight: '700'}}>
                        {language === 'bn' ? 'সাধারণ কৃষি ওষুধ' : 'General Farm Medicines'}
                      </h4>
                      <p style={{margin: '0 0 0.75rem 0', color: '#6b7280', fontSize: '0.85rem', lineHeight: '1.4'}}>
                        {language === 'bn' 
                          ? 'ছত্রাকনাশক, কীটনাশক, সার এবং প্রয়োজনীয় কৃষি রাসায়নিক পণ্য' 
                          : 'Fungicides, pesticides, fertilizers & essential agricultural chemicals'
                        }
                      </p>
                      
                      {/* Medicine Categories */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '0.25rem',
                          justifyContent: 'center',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ 
                            background: '#dcfce7', 
                            color: '#166534', 
                            padding: '0.125rem 0.5rem', 
                            borderRadius: '12px', 
                            fontSize: '0.7rem',
                            fontWeight: '500'
                          }}>
                            {language === 'bn' ? 'ছত্রাকনাশক' : 'Fungicides'}
                          </span>
                          <span style={{ 
                            background: '#fef3c7', 
                            color: '#92400e', 
                            padding: '0.125rem 0.5rem', 
                            borderRadius: '12px', 
                            fontSize: '0.7rem',
                            fontWeight: '500'
                          }}>
                            {language === 'bn' ? 'কীটনাশক' : 'Pesticides'}
                          </span>
                          <span style={{ 
                            background: '#dbeafe', 
                            color: '#1e40af', 
                            padding: '0.125rem 0.5rem', 
                            borderRadius: '12px', 
                            fontSize: '0.7rem',
                            fontWeight: '500'
                          }}>
                            {language === 'bn' ? 'সার' : 'Fertilizers'}
                          </span>
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#059669', 
                          fontWeight: '600',
                          textAlign: 'center'
                        }}>
                          {language === 'bn' ? '৮+ পণ্য উপলব্ধ' : '8+ Products Available'}
                        </div>
                      </div>
                      
                      <div className="category-button" style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        console.log('🛒 Shop Now button clicked directly!');
                        handleDirectMedicineShop(); // Navigate to medicine shops
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #059669, #047857)';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                      }}>
                        🛒 {language === 'bn' ? 'এখনই কিনুন' : 'Shop Now'}
                      </div>
                      
                      {/* Quick Preview - Shows on hover */}
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        right: '0',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '1rem',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        opacity: '0',
                        pointerEvents: 'none',
                        transform: 'translateY(-10px)',
                        transition: 'all 0.3s ease',
                        zIndex: '10',
                        marginTop: '0.5rem'
                      }} 
                      className="medicine-preview"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleDirectMedicineShop(); // Navigate to medicine shops
                      }}>
                        <h5 style={{ 
                          margin: '0 0 0.75rem 0', 
                          color: '#1f2937',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {language === 'bn' ? '🔥 জনপ্রিয় পণ্যসমূহ' : '🔥 Popular Products'}
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#374151' }}>
                              {language === 'bn' ? 'ম্যানকোজেব ৭৫%' : 'Mancozeb 75% WP'}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>৳২৫০</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#374151' }}>
                              {language === 'bn' ? 'ইমিডাক্লোপ্রিড' : 'Imidacloprid 17.8%'}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>৳৩২০</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#374151' }}>
                              {language === 'bn' ? 'ইউরিয়া সার' : 'Urea Fertilizer'}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>৳৮০০</span>
                          </div>
                        </div>
                        <div style={{ 
                          marginTop: '0.75rem', 
                          paddingTop: '0.75rem', 
                          borderTop: '1px solid #f3f4f6',
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          textAlign: 'center'
                        }}>
                          {language === 'bn' ? '👆 এখানে ক্লিক করুন দেখতে' : '👆 Click here to view all'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="category-card" style={{
                      background: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      textAlign: 'center',
                      opacity: '0.7'
                    }}>
                      <div style={{fontSize: '2.5rem', marginBottom: '0.75rem'}}>💊</div>
                      <h4 style={{margin: '0 0 0.5rem 0', color: '#1f2937'}}>
                        {language === 'bn' ? 'প্রেসক্রিপশন ওষুধ' : 'Prescription Medicines'}
                      </h4>
                      <p style={{margin: 0, color: '#6b7280', fontSize: '0.9rem'}}>
                        {language === 'bn' 
                          ? 'ডাক্তারের পরামর্শে নির্দিষ্ট ওষুধ' 
                          : 'Specific medicines as per doctor consultation'
                        }
                      </p>
                      <div className="category-button" style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: '#6b7280',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                      }}>
                        {language === 'bn' ? 'প্রেসক্রিপশন থেকে' : 'From Prescriptions'}
                      </div>
                    </div>
                  </div>

                  <div className="quick-info" style={{
                    background: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <p style={{margin: 0, color: '#92400e', fontSize: '0.9rem'}}>
                      💡 <strong>{language === 'bn' ? 'সহায়ক তথ্য:' : 'Helpful Info:'}</strong> {' '}
                      {language === 'bn' 
                        ? 'সাধারণ কৃষি ওষুধ প্রেসক্রিপশন ছাড়াই কিনতে পারেন। তবে সঠিক ব্যবহারের জন্য নির্দেশাবলী মেনে চলুন।' 
                        : 'You can buy common agricultural medicines without prescription. However, follow instructions for proper usage.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {active === 'orders' && (
              <div className="card">
                <h2 style={{marginBottom: 16, display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  🛒 {t.medicineOrders}
                </h2>
                {medicineOrders.length === 0 ? (
                  <div className="no-notifications">
                    <div className="empty-state">
                      <div className="empty-icon">🛒</div>
                      <h3>{t.noOrders}</h3>
                      <p>{language === 'bn' ? 'প্রেসক্রিপশন থেকে ওষুধ অর্ডার করুন' : 'Order medicines from prescriptions'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="orders-list">
                    {medicineOrders.map(order => (
                      <div key={order.orderId} className="order-card">
                        <div className="order-header">
                          <div className="order-info">
                            <h3>🛒 অর্ডার ID: {order.orderId}</h3>
                            <div className="order-meta">
                              <span className="date">📅 {order.orderDate.slice(0,10)}</span>
                              <span className="pharmacy">🏪 {order.pharmacy.name}</span>
                              <span className="total">💰 ৳{order.grandTotal}</span>
                            </div>
                          </div>
                          <div className="order-status">
                            <span className="status-badge confirmed">✅ {order.status === 'confirmed' ? (language === 'bn' ? 'নিশ্চিত' : 'Confirmed') : order.status}</span>
                          </div>
                        </div>
                        
                        <div className="order-body">
                          <div className="medicines-summary">
                            <h4>💊 ওষুধ সমূহ ({order.medicines.length}টি)</h4>
                            <div className="medicine-items">
                              {order.medicines.map((med, idx) => (
                                <div key={idx} className="medicine-item-small">
                                  <span className="med-name">{med.name}</span>
                                  <span className="med-qty">×{med.quantity}</span>
                                  <span className="med-price">৳{med.total}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="delivery-info-summary">
                            <div><strong>🚚 ডেলিভারি:</strong> {order.estimatedDelivery}</div>
                            <div><strong>💳 পেমেন্ট:</strong> {order.paymentMethod === 'cod' ? 'ডেলিভারিতে পেমেন্ট' : order.paymentMethod}</div>
                          </div>
                        </div>
                        
                        <div className="order-actions">
                          <button className="track-btn">
                            📍 {language === 'bn' ? 'ট্র্যাক করুন' : 'Track Order'}
                          </button>
                          <button className="reorder-btn" onClick={() => handleOrderMedicine({ 
                            prescriptionNo: order.prescriptionNo,
                            medicines: order.medicines.map(m => ({ name: m.name, dosage: m.dosage, duration: m.duration })),
                            doctorName: 'Previous Order',
                            date: order.orderDate.slice(0,10)
                          })}>
                            🔄 {language === 'bn' ? 'আবার অর্ডার' : 'Reorder'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      
      {/* Multi-Dashboard Medicine Ordering System */}
      {medicineOrderingStage === 'shops' && selectedPrescription && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: 'white', 
          zIndex: 9999,
          overflow: 'auto',
          overflowY: 'scroll',
          padding: '10px'
        }}>
          <div style={{
            maxHeight: '100vh',
            overflowY: 'auto'
          }}>
            <MedicineShops
              prescription={selectedPrescription}
              onGoBack={handleBackToDashboard}
              onShopSelected={handleOrderShopSelected}
              language={language}
            />
          </div>
        </div>
      )}
      
      {medicineOrderingStage === 'payment' && orderData && (
        <PaymentDashboard
          orderData={orderData}
          onGoBack={handleBackToShops}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
      
      {medicineOrderingStage === 'confirmation' && orderData && paymentData && (
        <OrderConfirmation
          orderData={orderData}
          paymentData={paymentData}
          onGoBackToDashboard={handleBackToDashboard}
        />
      )}
      
      {/* Appointment Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-header">
              <h3>{t.paymentRequired}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="payment-modal-content">
              <div className="appointment-details">
                <h4>অ্যাপয়েন্টমেন্ট বিবরণ</h4>
                <p><strong>ডাক্তার:</strong> {selectedPayment.doctorName}</p>
                <p><strong>তারিখ:</strong> {selectedPayment.appointmentDate}</p>
                <p><strong>সময়:</strong> {selectedPayment.appointmentTime}</p>
                <p><strong>ফি:</strong> {formatFee(selectedPayment.fee || 200)}</p>
              </div>
              
              <div className="payment-methods">
                <h4>পেমেন্ট পদ্ধতি নির্বাচন করুন</h4>
                <div className="payment-options">
                  <button 
                    className="payment-method-btn bkash"
                    onClick={() => processPayment('bKash')}
                  >
                    bKash
                  </button>
                  <button 
                    className="payment-method-btn nagad"
                    onClick={() => processPayment('Nagad')}
                  >
                    Nagad
                  </button>
                  <button 
                    className="payment-method-btn rocket"
                    onClick={() => processPayment('Rocket')}
                  >
                    Rocket
                  </button>
                  <button 
                    className="payment-method-btn card"
                    onClick={() => processPayment('Card')}
                  >
                    Card
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmerDashboard;
