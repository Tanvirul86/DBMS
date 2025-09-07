import React, { useState } from 'react';
import './App.css';
import {
  FarmerLogin,
  FarmerRegistration,
  DoctorLogin,
  DoctorRegistration,
  SignupOptions,
  FarmerDashboard,
  DoctorDashboard
} from './components';

function App() {
  const [language, setLanguage] = useState('en'); // 'bn' for Bengali, 'en' for English
  const [showFarmerLogin, setShowFarmerLogin] = useState(false);
  const [showFarmerRegistration, setShowFarmerRegistration] = useState(false);
  const [showDoctorLogin, setShowDoctorLogin] = useState(false);
  const [showDoctorRegistration, setShowDoctorRegistration] = useState(false);
  const [showSignupOptions, setShowSignupOptions] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userData, setUserData] = useState(null);

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const openFarmerLogin = () => {
    setShowFarmerLogin(true);
    setShowFarmerRegistration(false);
    setShowDoctorLogin(false);
    setShowDoctorRegistration(false);
  };

  const openFarmerRegistration = () => {
    setShowFarmerRegistration(true);
    setShowFarmerLogin(false);
    setShowDoctorLogin(false);
    setShowDoctorRegistration(false);
  };

  const openDoctorLogin = () => {
    setShowDoctorLogin(true);
    setShowDoctorRegistration(false);
    setShowFarmerLogin(false);
    setShowFarmerRegistration(false);
  };

  const openDoctorRegistration = () => {
    setShowDoctorRegistration(true);
    setShowDoctorLogin(false);
    setShowFarmerLogin(false);
    setShowFarmerRegistration(false);
  };

  const closeFarmerLogin = () => {
    setShowFarmerLogin(false);
  };

  const closeFarmerRegistration = () => {
    setShowFarmerRegistration(false);
  };

  const closeDoctorLogin = () => {
    setShowDoctorLogin(false);
  };

  const closeDoctorRegistration = () => {
    setShowDoctorRegistration(false);
  };

  const openSignupOptions = () => {
    setShowSignupOptions(true);
  };

  const closeSignupOptions = () => {
    setShowSignupOptions(false);
  };

  const handleLoginSuccess = (type, data) => {
    setIsLoggedIn(true);
    setUserType(type);
    setUserData(data);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setUserData(null);
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorProfile');
    localStorage.removeItem('farmerToken');
    localStorage.removeItem('farmerProfile');
  };

  // If user is logged in, show dashboard
  if (isLoggedIn && userType === 'farmer') {
    return <FarmerDashboard language={language} onLogout={handleLogout} farmerData={userData} />;
  }

  if (isLoggedIn && userType === 'doctor') {
    return <DoctorDashboard language={language} onLogout={handleLogout} doctorData={userData} />;
  }

  const content = {
    bn: {
      navHome: 'হোম',
      navAbout: 'আমাদের সম্পর্কে',
      navServices: 'সেবা',
      navLogin: 'লগইন',
      navSignup: 'সাইন আপ',
      heroTitle: 'স্বাগতম গ্রামীণ কৃষি প্ল্যাটফর্মে',
      heroDesc1: 'একটি আধুনিক প্ল্যাটফর্ম যেখানে কৃষকরা কৃষি বিশেষজ্ঞ ও ডাক্তারদের থেকে তাদের ফসলের সমস্যার সমাধান পেতে পারেন।',
      btnFarmer: 'কৃষক হিসেবে যোগ দিন',
      btnExpert: 'ডাক্তার হিসেবে যোগ দিন',
      aboutTitle: 'আমাদের সম্পর্কে',
      aboutDesc: 'গ্রামীণ কৃষি একটি ডিজিটাল প্ল্যাটফর্ম যা কৃষকদের সাথে কৃষি বিশেষজ্ঞদের সংযোগ স্থাপন করে। এখানে কৃষকরা তাদের ফসলের যেকোনো সমস্যার সমাধান পেতে পারেন।',
      loginTitle: 'লগইন করুন',
      farmerCard: 'কৃষক',
      farmerDesc: 'আপনি যদি একজন কৃষক হন',
      farmerLogin: 'কৃষক হিসেবে লগইন',
      expertCard: 'ডাক্তার',
      expertDesc: 'আপনি যদি একজন কৃষি বিশেষজ্ঞ হন',
      expertLogin: 'ডাক্তার হিসেবে লগইন',
      footerDesc: 'কৃষকদের জন্য আধুনিক সমাধান'
    },
    en: {
      navHome: 'Home',
      navAbout: 'About',
      navServices: 'Services',
      navLogin: 'Login',
      navSignup: 'Sign Up',
      heroTitle: 'Welcome to Grameen Krishi Platform',
      heroDesc1: 'A modern platform where farmers can get solutions to their crop problems from agricultural experts and doctors.',
      btnFarmer: 'Join as Farmer',
      btnExpert: 'Join as Doctor',
      aboutTitle: 'About Us',
      aboutDesc: 'Grameen Krishi is a digital platform that connects farmers with agricultural experts. Here farmers can get solutions to any problems related to their crops.',
      loginTitle: 'Login to Your Account',
      farmerCard: 'Farmer',
      farmerDesc: 'If you are a farmer',
      farmerLogin: 'Login as Farmer',
      expertCard: 'Doctor',
      expertDesc: 'If you are an agricultural expert',
      expertLogin: 'Login as Doctor',
      footerDesc: 'Modern solutions for farmers'
    }
  };

  const t = content[language];

  return (
    <div className="App">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>গ্রামীণ কৃষি</h2>
            <span>Grameen Krishi</span>
          </div>
          <ul className="nav-menu">
            <li><a href="#home">{t.navHome}</a></li>
            <li><a href="#about">{t.navAbout}</a></li>
            <li><a href="#services">{t.navServices}</a></li>
            <li><a href="#login" className="login-btn">{t.navLogin}</a></li>
            <li><button onClick={openSignupOptions} className="signup-btn">{t.navSignup}</button></li>
            <li>
              <button className="language-toggle" onClick={toggleLanguage}>
                {language === 'bn' ? 'English' : 'বাংলা'}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1>{t.heroTitle}</h1>
          <p>{t.heroDesc1}</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={openFarmerLogin}>{t.btnFarmer}</button>
            <button className="btn-secondary" onClick={openDoctorLogin}>{t.btnExpert}</button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2>{t.aboutTitle}</h2>
          <div className="about-content">
            <div className="about-text">
              <p>{t.aboutDesc}</p>
            </div>
            <div className="features">
              <div className="feature">
                <h4>🌱 Expert Consultation</h4>
                <p>{language === 'bn' ? 'বিশেষজ্ঞদের পরামর্শ নিন' : 'Get expert advice'}</p>
              </div>
              <div className="feature">
                <h4>📱 Easy Access</h4>
                <p>{language === 'bn' ? 'সহজ ব্যবহার' : 'Easy to use'}</p>
              </div>
              <div className="feature">
                <h4>🚀 Quick Solution</h4>
                <p>{language === 'bn' ? 'দ্রুত সমাধান' : 'Fast solutions'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="container">
          <h2>{language === 'bn' ? 'আমাদের সেবাসমূহ' : 'Our Services'}</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🩺</div>
              <h4>{language === 'bn' ? 'ডাক্তার পরামর্শ (ভিডিও)' : 'Doctor Consultation (Video)'}</h4>
              <p>{language === 'bn' ? 'Google Meet দিয়ে বিশেষজ্ঞের সাথে টেলি-পরামর্শ' : 'Tele-consultation with specialists via Google Meet'}</p>
            </div>
            <div className="service-card">
              <div className="service-icon">⚡</div>
              <h4>{language === 'bn' ? 'দ্রুত অ্যাপয়েন্টমেন্ট' : 'Quick Appointment'}</h4>
              <p>{language === 'bn' ? 'খামারের ধরন, সমস্যা ও জরুরি অবস্থা দিয়ে তাৎক্ষণিক বুকিং' : 'Instant booking with farm type, problem, and urgency'}</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🌾</div>
              <h4>{language === 'bn' ? 'ফসল ও মাটি পরামর্শ' : 'Crop & Soil Advisory'}</h4>
              <p>{language === 'bn' ? 'রোগ নির্ণয়, পেস্ট ম্যানেজমেন্ট, মাটি ও সার পরিকল্পনা' : 'Disease diagnosis, pest management, soil & fertilizer planning'}</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🐄</div>
              <h4>{language === 'bn' ? 'পশু ও মুরগি চিকিৎসা' : 'Livestock & Poultry Care'}</h4>
              <p>{language === 'bn' ? 'ভেট টেলি-মেডিসিন, টিকাদান সূচি, ব্রুডিং টিপস' : 'Vet tele-medicine, vaccination schedule, brooding tips'}</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🔔</div>
              <h4>{language === 'bn' ? 'স্মার্ট নোটিফিকেশন' : 'Smart Notifications'}</h4>
              <p>{language === 'bn' ? 'অ্যাপয়েন্টমেন্ট স্বীকৃতি, Meet লিংক ও রিমাইন্ডার' : 'Appointment confirmation, Meet links & reminders'}</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📊</div>
              <h4>{language === 'bn' ? 'ফি ও বিলিং সাপোর্ট' : 'Fees & Billing Support'}</h4>
              <p>{language === 'bn' ? 'সাধারণ/জরুরি ফি, ডিজিটাল পেমেন্ট সুবিধা' : 'Normal/urgent fees, digital payment facilities'}</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📱</div>
              <h4>{language === 'bn' ? 'SMS/কল সাপোর্ট' : 'SMS/Call Support'}</h4>
              <p>{language === 'bn' ? 'অফলাইন রিমাইন্ডার ও হেল্পলাইন সেবা' : 'Offline reminders & helpline services'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Login Selection */}
      <section id="login" className="login-section">
        <div className="container">
          <h2>{t.loginTitle}</h2>
          <div className="login-options">
            <div className="login-card">
              <h4>{t.farmerCard}</h4>
              <p>{t.farmerDesc}</p>
              <button className="btn-farmer" onClick={openFarmerLogin}>{t.farmerLogin}</button>
            </div>
            <div className="login-card">
              <h4>{t.expertCard}</h4>
              <p>{t.expertDesc}</p>
              <button className="btn-expert" onClick={openDoctorLogin}>{t.expertLogin}</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>গ্রামীণ কৃষি</h4>
              <p>{t.footerDesc}</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">{t.navHome}</a></li>
                <li><a href="#about">{t.navAbout}</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>{t.navServices}</h4>
              <ul>
                <li>{language === 'bn' ? 'ফসল পরামর্শ' : 'Crop Consultation'}</li>
                <li>{language === 'bn' ? 'রোগ নির্ণয়' : 'Disease Diagnosis'}</li>
                <li>{language === 'bn' ? 'বিশেষজ্ঞ পরামর্শ' : 'Expert Advice'}</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Grameen Krishi. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Farmer Login Modal */}
      {showFarmerLogin && (
        <FarmerLogin 
          language={language} 
          onClose={closeFarmerLogin}
          onSwitchToRegister={openFarmerRegistration}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      
      {/* Farmer Registration Modal */}
      {showFarmerRegistration && (
        <FarmerRegistration 
          language={language} 
          onClose={closeFarmerRegistration}
          onSwitchToLogin={openFarmerLogin}
        />
      )}

      {/* Doctor Login Modal */}
      {showDoctorLogin && (
        <DoctorLogin 
          language={language} 
          onClose={closeDoctorLogin}
          onSwitchToRegister={openDoctorRegistration}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      
      {/* Doctor Registration Modal */}
      {showDoctorRegistration && (
        <DoctorRegistration 
          language={language} 
          onClose={closeDoctorRegistration}
          onSwitchToLogin={openDoctorLogin}
        />
      )}

      {/* Signup Options Modal */}
      {showSignupOptions && (
        <SignupOptions 
          language={language} 
          onClose={closeSignupOptions}
          onSelectFarmer={() => {
            closeSignupOptions();
            openFarmerRegistration();
          }}
          onSelectDoctor={() => {
            closeSignupOptions();
            openDoctorRegistration();
          }}
        />
      )}
    </div>
  );
}

export default App;
