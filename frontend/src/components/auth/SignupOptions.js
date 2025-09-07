import React from 'react';
import './SignupOptions.css';

function SignupOptions({ language, onClose, onSelectFarmer, onSelectDoctor }) {
  const content = {
    bn: {
      title: 'সাইন আপ করুন',
      subtitle: 'আপনি কোন ধরনের অ্যাকাউন্ট তৈরি করতে চান?',
      farmer: 'কৃষক',
      farmerDesc: 'আপনি যদি একজন কৃষক হন এবং বিশেষজ্ঞদের পরামর্শ নিতে চান',
      doctor: 'ডাক্তার',
      doctorDesc: 'আপনি যদি একজন কৃষি বিশেষজ্ঞ হন এবং কৃষকদের সাহায্য করতে চান',
      cancel: 'বাতিল'
    },
    en: {
      title: 'Sign Up',
      subtitle: 'What type of account would you like to create?',
      farmer: 'Farmer',
      farmerDesc: 'If you are a farmer looking for expert advice',
      doctor: 'Doctor',
      doctorDesc: 'If you are an agricultural expert looking to help farmers',
      cancel: 'Cancel'
    }
  };

  const t = content[language];

  return (
    <div className="signup-options-overlay">
      <div className="signup-options-modal">
        <div className="signup-options-header">
          <h2>{t.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="signup-options-content">
          <p className="signup-subtitle">{t.subtitle}</p>
          
          <div className="signup-cards">
            <div className="signup-card farmer-card" onClick={onSelectFarmer}>
              <div className="card-icon">🌾</div>
              <h3>{t.farmer}</h3>
              <p>{t.farmerDesc}</p>
              <button className="select-btn farmer-btn">
                {language === 'bn' ? 'কৃষক হিসেবে সাইন আপ' : 'Sign up as Farmer'}
              </button>
            </div>

            <div className="signup-card doctor-card" onClick={onSelectDoctor}>
              <div className="card-icon">👨‍⚕️</div>
              <h3>{t.doctor}</h3>
              <p>{t.doctorDesc}</p>
              <button className="select-btn doctor-btn">
                {language === 'bn' ? 'ডাক্তার হিসেবে সাইন আপ' : 'Sign up as Doctor'}
              </button>
            </div>
          </div>

          <div className="signup-actions">
            <button className="btn-cancel" onClick={onClose}>
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupOptions;
