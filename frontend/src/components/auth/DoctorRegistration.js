import React, { useState } from 'react';
import './DoctorRegistration.css';

function DoctorRegistration({ language, onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
    experience: '',
    licenseNumber: '',
    workplace: '',
    availableTimeFrom: '',
    availableTimeTo: '',
    availableDays: [],
    password: '',
    confirmPassword: ''
  });

  const content = {
    bn: {
      title: 'ডাক্তার নিবন্ধন',
      fullName: 'পূর্ণ নাম',
      email: 'ইমেইল',
      phone: 'ফোন নম্বর',
      qualification: 'শিক্ষাগত যোগ্যতা',
      specialization: 'বিশেষত্ব',
      experience: 'অভিজ্ঞতা (বছর)',
      licenseNumber: 'লাইসেন্স/রেজিস্ট্রেশন নম্বর',
      workplace: 'কর্মক্ষেত্র',
      availableTimeFrom: 'সেবার সময় (শুরু)',
      availableTimeTo: 'সেবার সময় (শেষ)',
      availableDays: 'সেবার দিন',
      password: 'পাসওয়ার্ড',
      confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
      register: 'নিবন্ধন করুন',
      cancel: 'বাতিল',
      haveAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
      login: 'লগইন করুন',
      qualifications: [
        { value: '', label: 'শিক্ষাগত যোগ্যতা নির্বাচন করুন' },
        { value: 'phd_agriculture', label: 'পিএইচডি (কৃষি)' },
        { value: 'masters_agriculture', label: 'মাস্টার্স (কৃষি)' },
        { value: 'bachelors_agriculture', label: 'ব্যাচেলর্স (কৃষি)' },
        { value: 'diploma_agriculture', label: 'ডিপ্লোমা (কৃষি)' },
        { value: 'phd_veterinary', label: 'পিএইচডি (ভেটেরিনারি)' },
        { value: 'dvm', label: 'ডক্টর অফ ভেটেরিনারি মেডিসিন' },
        { value: 'masters_plant_pathology', label: 'মাস্টার্স (উদ্ভিদ রোগতত্ত্ব)' },
        { value: 'masters_entomology', label: 'মাস্টার্স (কীটতত্ত্ব)' },
        { value: 'masters_soil_science', label: 'মাস্টার্স (মৃত্তিকা বিজ্ঞান)' },
        { value: 'other', label: 'অন্যান্য' }
      ],
      specializations: [
        { value: '', label: 'বিশেষত্ব নির্বাচন করুন' },
        { value: 'crop_diseases', label: 'ফসলের রোগ' },
        { value: 'pest_management', label: 'পোকামাকড় ব্যবস্থাপনা' },
        { value: 'soil_fertility', label: 'মাটির উর্বরতা' },
        { value: 'plant_nutrition', label: 'উদ্ভিদ পুষ্টি' },
        { value: 'livestock_health', label: 'পশুস্বাস্থ্য' },
        { value: 'organic_farming', label: 'জৈবিক চাষাবাদ' }
      ],
      days: [
        { value: 'saturday', label: 'শনিবার' },
        { value: 'sunday', label: 'রবিবার' },
        { value: 'monday', label: 'সোমবার' },
        { value: 'tuesday', label: 'মঙ্গলবার' },
        { value: 'wednesday', label: 'বুধবার' },
        { value: 'thursday', label: 'বৃহস্পতিবার' },
        { value: 'friday', label: 'শুক্রবার' }
      ]
    },
    en: {
      title: 'Doctor Registration',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      qualification: 'Educational Qualification',
      specialization: 'Specialization',
      experience: 'Experience (Years)',
      licenseNumber: 'License/Registration Number',
      workplace: 'Workplace',
      availableTimeFrom: 'Available Time (From)',
      availableTimeTo: 'Available Time (To)',
      availableDays: 'Available Days',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      register: 'Register',
      cancel: 'Cancel',
      haveAccount: 'Already have an account?',
      login: 'Login',
      qualifications: [
        { value: '', label: 'Select Educational Qualification' },
        { value: 'phd_agriculture', label: 'PhD in Agriculture' },
        { value: 'masters_agriculture', label: 'Masters in Agriculture' },
        { value: 'bachelors_agriculture', label: 'Bachelors in Agriculture' },
        { value: 'diploma_agriculture', label: 'Diploma in Agriculture' },
        { value: 'phd_veterinary', label: 'PhD in Veterinary Science' },
        { value: 'dvm', label: 'Doctor of Veterinary Medicine' },
        { value: 'masters_plant_pathology', label: 'Masters in Plant Pathology' },
        { value: 'masters_entomology', label: 'Masters in Entomology' },
        { value: 'masters_soil_science', label: 'Masters in Soil Science' },
        { value: 'other', label: 'Other' }
      ],
      specializations: [
        { value: '', label: 'Select Specialization' },
        { value: 'crop_diseases', label: 'Crop Diseases' },
        { value: 'pest_management', label: 'Pest Management' },
        { value: 'soil_fertility', label: 'Soil Fertility' },
        { value: 'plant_nutrition', label: 'Plant Nutrition' },
        { value: 'livestock_health', label: 'Livestock Health' },
        { value: 'organic_farming', label: 'Organic Farming' }
      ],
      days: [
        { value: 'saturday', label: 'Saturday' },
        { value: 'sunday', label: 'Sunday' },
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' }
      ]
    }
  };

  const t = content[language];

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'availableDays') {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          availableDays: [...prev.availableDays, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          availableDays: prev.availableDays.filter(day => day !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert(language === 'bn' ? 'পাসওয়ার্ড মিলছে না!' : 'Passwords do not match!');
      return;
    }
    
    try {
      // Create request data
      const submitData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        qualification: formData.qualification,
        specialization: formData.specialization,
        experienceYears: parseInt(formData.experience),
        workplace: formData.workplace,
        licenseNumber: formData.licenseNumber,
        availableTimeStart: formData.availableTimeFrom,
        availableTimeEnd: formData.availableTimeTo,
        availableDays: JSON.stringify(formData.availableDays),
        consultationFee: 500 // Default fee
      };

      console.log('Submitting doctor registration to backend...', submitData);

      // Submit to backend API
      const response = await fetch('http://localhost:5000/api/doctor/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(language === 'bn' ? 'সফলভাবে নিবন্ধিত হয়েছেন!' : 'Registration successful!');
        console.log('Doctor registration successful:', result);
        onClose();
      } else {
        alert(language === 'bn' ? 'নিবন্ধন ব্যর্থ: ' + result.error : 'Registration failed: ' + result.error);
        console.error('Registration failed:', result);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(language === 'bn' ? 'নিবন্ধন ব্যর্থ! ইন্টারনেট সংযোগ পরীক্ষা করুন।' : 'Registration failed! Please check your internet connection.');
    }
  };

  return (
    <div className="doctor-registration-overlay">
      <div className="doctor-registration-modal">
        <div className="doctor-registration-header">
          <h2>{t.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form className="doctor-registration-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">{t.fullName}</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder={t.fullName}
              />
            </div>

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
          </div>

          <div className="form-row">
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
              <label htmlFor="experience">{t.experience}</label>
              <input
                type="number"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                required
                min="0"
                max="50"
                placeholder="5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="qualification">{t.qualification}</label>
              <select
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                required
              >
                {t.qualifications.map((qual) => (
                  <option key={qual.value} value={qual.value}>
                    {qual.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="specialization">{t.specialization}</label>
              <select
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                required
              >
                {t.specializations.map((spec) => (
                  <option key={spec.value} value={spec.value}>
                    {spec.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="licenseNumber">{t.licenseNumber}</label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              required
              placeholder={t.licenseNumber}
            />
          </div>

          <div className="form-group">
            <label htmlFor="workplace">{t.workplace}</label>
            <input
              type="text"
              id="workplace"
              name="workplace"
              value={formData.workplace}
              onChange={handleInputChange}
              required
              placeholder={language === 'bn' ? 'কৃষি বিশ্ববিদ্যালয়, সরকারি হাসপাতাল, কৃষি অফিস' : 'Agricultural University, Government Hospital, Agricultural Office'}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="availableTimeFrom">{t.availableTimeFrom}</label>
              <input
                type="time"
                id="availableTimeFrom"
                name="availableTimeFrom"
                value={formData.availableTimeFrom}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="availableTimeTo">{t.availableTimeTo}</label>
              <input
                type="time"
                id="availableTimeTo"
                name="availableTimeTo"
                value={formData.availableTimeTo}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t.availableDays}</label>
            <div className="checkbox-group">
              {t.days.map((day) => (
                <label key={day.value} className="checkbox-item">
                  <input
                    type="checkbox"
                    name="availableDays"
                    value={day.value}
                    checked={formData.availableDays.includes(day.value)}
                    onChange={handleInputChange}
                  />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
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

export default DoctorRegistration;
