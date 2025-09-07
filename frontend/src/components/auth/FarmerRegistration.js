import React, { useState } from 'react';
import './FarmerRegistration.css';

function FarmerRegistration({ language, onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    farmType: '',
  customFarmType: '',
    password: '',
    confirmPassword: ''
  });

  const content = {
    bn: {
      title: 'কৃষক নিবন্ধন',
      name: 'নাম',
      phone: 'ফোন নম্বর',
      address: 'ঠিকানা',
      farmType: 'খামারের ধরন',
  specifyFarmType: 'খামারের ধরন লিখুন',
      password: 'পাসওয়ার্ড',
      confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
      register: 'নিবন্ধন করুন',
      cancel: 'বাতিল',
      haveAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
      login: 'লগইন করুন',
      farmTypes: [
        { value: '', label: 'খামারের ধরন নির্বাচন করুন' },
        { value: 'rice', label: 'ধান চাষ' },
        { value: 'wheat', label: 'গম চাষ' },
        { value: 'vegetables', label: 'সবজি চাষ' },
        { value: 'fruits', label: 'ফল চাষ' },
        { value: 'livestock', label: 'পশুপালন' },
        { value: 'poultry', label: 'মুরগি পালন' },
        { value: 'fish', label: 'মাছ চাষ' },
        { value: 'mixed', label: 'মিশ্র চাষ' }
      ]
    },
    en: {
      title: 'Farmer Registration',
      name: 'Name',
      phone: 'Phone Number',
      address: 'Address',
      farmType: 'Farm Type',
  specifyFarmType: 'Specify Farm Type',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      register: 'Register',
      cancel: 'Cancel',
      haveAccount: 'Already have an account?',
      login: 'Login',
      farmTypes: [
        { value: '', label: 'Select Farm Type' },
        { value: 'rice', label: 'Rice Farming' },
        { value: 'wheat', label: 'Wheat Farming' },
        { value: 'vegetables', label: 'Vegetable Farming' },
        { value: 'fruits', label: 'Fruit Farming' },
        { value: 'livestock', label: 'Livestock' },
        { value: 'poultry', label: 'Poultry' },
        { value: 'fish', label: 'Fish Farming' },
        { value: 'mixed', label: 'Mixed Farming' }
      ]
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
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert(language === 'bn' ? 'পাসওয়ার্ড মিলছে না!' : 'Passwords do not match!');
      return;
    }
    // If other is selected, custom is required
    if (formData.farmType === 'other' && !formData.customFarmType.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে খামারের ধরন লিখুন' : 'Please specify the farm type');
      return;
    }
    
    // Send registration to backend
    (async () => {
      try {
        const payload = {
          name: formData.name,
          phone: formData.phone,
          email: '',
          password: formData.password,
          userType: 'farmer',
          address: formData.address,
          farmType: formData.farmType,
          farmSize: null,
          experienceYears: null
        };

        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.status === 201) {
          // Save profile locally for dashboard
          const profile = { name: formData.name, phone: formData.phone, address: formData.address, farmType: formData.farmType, customFarmType: formData.customFarmType || '' };
          localStorage.setItem('farmerProfile', JSON.stringify(profile));
          alert(language === 'bn' ? 'সফলভাবে নিবন্ধন সম্পন্ন হয়েছে!' : 'Registration completed successfully!');
          onClose();
        } else {
          alert(data.error || 'Registration failed');
        }
      } catch (err) {
        console.error('Registration error:', err);
        alert(language === 'bn' ? 'নিবন্ধনে সমস্যা হয়েছে' : 'Registration error');
      }
    })();
  };

  return (
    <div className="registration-overlay">
      <div className="registration-modal">
        <div className="registration-header">
          <h2>{t.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t.name}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder={t.name}
            />
          </div>

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
            <label htmlFor="address">{t.address}</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder={t.address}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="farmType">{t.farmType}</label>
            <select
              id="farmType"
              name="farmType"
              value={formData.farmType}
              onChange={handleInputChange}
              required
            >
              {t.farmTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          {formData.farmType === 'other' && (
            <div className="form-group">
              <label htmlFor="customFarmType">{t.specifyFarmType}</label>
              <input
                type="text"
                id="customFarmType"
                name="customFarmType"
                value={formData.customFarmType}
                onChange={handleInputChange}
                placeholder={t.specifyFarmType}
                required
              />
            </div>
          )}

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

          <div className="form-group">
            <label htmlFor="confirmPassword">{t.confirmPassword}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              placeholder={t.confirmPassword}
              minLength="6"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-register">
              {t.register}
            </button>
          </div>

          <div className="login-prompt">
            <p>
              {t.haveAccount} 
              <button 
                type="button" 
                className="login-link" 
                onClick={onSwitchToLogin}
              >
                {t.login}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FarmerRegistration;
