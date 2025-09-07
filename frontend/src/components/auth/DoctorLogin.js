import React, { useState } from 'react';
import './DoctorLogin.css';

function DoctorLogin({ language, onClose, onSwitchToRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const content = {
    bn: {
      title: 'ডাক্তার লগইন',
      email: 'ইমেইল',
      password: 'পাসওয়ার্ড',
      login: 'লগইন',
      cancel: 'বাতিল',
      forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
      noAccount: 'কোনো অ্যাকাউন্ট নেই?',
      register: 'নিবন্ধন করুন',
      rememberMe: 'আমাকে মনে রাখুন'
    },
    en: {
      title: 'Doctor Login',
      email: 'Email',
      password: 'Password',
      login: 'Login',
      cancel: 'Cancel',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      register: 'Register',
      rememberMe: 'Remember me'
    }
  };

  const t = content[language];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Doctor Login Data:', formData);
    
    if (!formData.email || !formData.password) {
      alert(language === 'bn' ? 'ইমেইল এবং পাসওয়ার্ড দিন!' : 'Please enter email and password!');
      return;
    }

    try {
      console.log('Submitting doctor login to backend...');

      const response = await fetch('http://localhost:5000/api/doctor/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Store token and doctor profile
        localStorage.setItem('doctorToken', result.token);
        localStorage.setItem('doctorProfile', JSON.stringify(result.doctor));
        
        console.log('Doctor login successful:', result);
        alert(language === 'bn' ? 'সফলভাবে লগইন হয়েছেন!' : 'Login successful!');
        
        onLoginSuccess('doctor', result.doctor);
        onClose();
      } else {
        alert(language === 'bn' ? 'লগইন ব্যর্থ: ' + result.error : 'Login failed: ' + result.error);
        console.error('Login failed:', result);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(language === 'bn' ? 'লগইন ব্যর্থ! ইন্টারনেট সংযোগ পরীক্ষা করুন।' : 'Login failed! Please check your internet connection.');
    }
  };

  return (
    <div className="doctor-login-overlay">
      <div className="doctor-login-modal">
        <div className="doctor-login-header">
          <h2>{t.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form className="doctor-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t.email}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="doctor@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t.password}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder={t.password}
              minLength="6"
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>{t.rememberMe}</span>
            </label>
            <a href="#forgot" className="forgot-link">{t.forgotPassword}</a>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-login">
              {t.login}
            </button>
          </div>

          <div className="register-prompt">
            <p>
              {t.noAccount} 
              <button 
                type="button" 
                className="register-link" 
                onClick={onSwitchToRegister}
              >
                {t.register}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DoctorLogin;
