import React, { useState } from 'react';
import './FarmerLogin.css';

function FarmerLogin({ language, onClose, onSwitchToRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  const content = {
    bn: {
      title: 'কৃষক লগইন',
      phone: 'ফোন নম্বর',
      password: 'পাসওয়ার্ড',
      login: 'লগইন',
      cancel: 'বাতিল',
      forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
      noAccount: 'কোনো অ্যাকাউন্ট নেই?',
      register: 'নিবন্ধন করুন',
      rememberMe: 'আমাকে মনে রাখুন'
    },
    en: {
      title: 'Farmer Login',
      phone: 'Phone Number',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call backend login
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formData.phone, password: formData.password, userType: 'farmer' })
        });
        const data = await res.json();
        if (res.status === 200 && data.token) {
          // store token and profile
          localStorage.setItem('token', data.token);
          localStorage.setItem('farmerProfile', JSON.stringify({ name: data.user.name, phone: data.user.phone, address: data.user.address || '' }));
          onClose();
          if (onLoginSuccess) onLoginSuccess('farmer', { name: data.user.name, phone: data.user.phone });
        } else {
          alert(data.error || 'Login failed');
        }
      } catch (err) {
        console.error('Login request failed:', err);
        alert(language === 'bn' ? 'লগইনে সমস্যা হয়েছে!' : 'Login error occurred!');
      }
    })();
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <div className="login-header">
          <h2>{t.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phone">{t.phone}</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="01XXXXXXXXX"
              pattern="[0-9]{11}"
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

export default FarmerLogin;
