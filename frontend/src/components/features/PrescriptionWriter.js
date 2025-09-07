import React, { useState } from 'react';
import './PrescriptionWriter.css';

function PrescriptionWriter({ appointment, doctorData, language = 'bn', onClose, onSave }) {
  const t = {
    bn: {
      title: 'ডিজিটাল প্রেসক্রিপশন',
      patient: 'রোগীর তথ্য',
      farmer: 'কৃষক',
      phone: 'ফোন',
      problem: 'সমস্যা',
      diagnosis: 'রোগ নির্ণয়',
      treatment: 'চিকিৎসা পরামর্শ',
      medicine: 'ওষুধ/স্প্রে',
      dosage: 'মাত্রা',
      duration: 'সময়কাল',
      instructions: 'নির্দেশনা',
      followUp: 'পরবর্তী ভিজিট',
      addMedicine: 'ওষুধ যোগ করুন',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল',
      prescriptionNo: 'প্রেসক্রিপশন নং',
      date: 'তারিখ',
      doctor: 'ডাক্তার',
      signature: 'স্বাক্ষর',
      placeholders: {
        diagnosis: 'রোগের নাম লিখুন',
        treatment: 'চিকিৎসা পরামর্শ লিখুন',
        medicine: 'ওষুধের নাম',
        dosage: 'যেমন: দিনে ২ বার',
        duration: 'যেমন: ৭ দিন',
        instructions: 'অতিরিক্ত নির্দেশনা',
        followUp: 'পরবর্তী ভিজিটের তারিখ'
      }
    },
    en: {
      title: 'Digital Prescription',
      patient: 'Patient Info',
      farmer: 'Farmer',
      phone: 'Phone',
      problem: 'Problem',
      diagnosis: 'Diagnosis',
      treatment: 'Treatment Advice',
      medicine: 'Medicine/Spray',
      dosage: 'Dosage',
      duration: 'Duration',
      instructions: 'Instructions',
      followUp: 'Follow-up Visit',
      addMedicine: 'Add Medicine',
      save: 'Save',
      cancel: 'Cancel',
      prescriptionNo: 'Prescription No',
      date: 'Date',
      doctor: 'Doctor',
      signature: 'Signature',
      placeholders: {
        diagnosis: 'Enter diagnosis',
        treatment: 'Enter treatment advice',
        medicine: 'Medicine name',
        dosage: 'e.g., 2 times daily',
        duration: 'e.g., 7 days',
        instructions: 'Additional instructions',
        followUp: 'Next visit date'
      }
    }
  }[language];

  const [prescription, setPrescription] = useState({
    prescriptionNo: `RX-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    diagnosis: '',
    treatment: '',
    medicines: [{ name: '', dosage: '', duration: '' }],
    instructions: '',
    followUpDate: ''
  });

  const addMedicine = () => {
    setPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', duration: '' }]
    }));
  };

  const updateMedicine = (index, field, value) => {
    setPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedicine = (index) => {
    setPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const prescriptionData = {
      ...prescription,
      appointmentId: appointment.id,
      farmerId: appointment.farmerId,
      farmerName: appointment.farmerName,
      farmerPhone: appointment.farmerPhone,
      problem: appointment.problem || appointment.problemDescription,
      farmType: appointment.farmType,
      doctorId: doctorData.id,
      doctorName: doctorData.name || doctorData.fullName,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    prescriptions.unshift(prescriptionData);
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));

    // Add notification to farmer
    const farmerNotifications = JSON.parse(localStorage.getItem('farmerNotifications') || '[]');
    farmerNotifications.unshift({
      id: Date.now(),
      type: 'prescription_received',
      title: language === 'bn' ? 'প্রেসক্রিপশন পেয়েছেন' : 'Prescription Received',
      content: language === 'bn' 
        ? `ডাঃ ${doctorData.name} আপনাকে একটি ডিজিটাল প্রেসক্রিপশন দিয়েছেন।`
        : `Dr. ${doctorData.name} has provided you a digital prescription.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      prescriptionNo: prescription.prescriptionNo,
      doctorName: doctorData.name || doctorData.fullName
    });
    localStorage.setItem('farmerNotifications', JSON.stringify(farmerNotifications));

    onSave && onSave(prescriptionData);
    onClose && onClose();
  };

  return (
    <div className="prescription-modal">
      <div className="prescription-container">
        <div className="prescription-header">
          <h2>📋 {t.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="prescription-content">
          {/* Header Info */}
          <div className="prescription-info">
            <div className="info-row">
              <span><strong>{t.prescriptionNo}:</strong> {prescription.prescriptionNo}</span>
              <span><strong>{t.date}:</strong> {prescription.date}</span>
            </div>
            <div className="info-row">
              <span><strong>{t.doctor}:</strong> {doctorData.name || doctorData.fullName}</span>
            </div>
          </div>

          {/* Patient Info */}
          <div className="patient-section">
            <h3>👤 {t.patient}</h3>
            <div className="patient-info">
              <div><strong>{t.farmer}:</strong> {appointment.farmerName}</div>
              <div><strong>{t.phone}:</strong> {appointment.farmerPhone}</div>
              <div><strong>{t.problem}:</strong> {appointment.problem || appointment.problemDescription}</div>
            </div>
          </div>

          {/* Prescription Form */}
          <form className="prescription-form">
            <div className="form-section">
              <label htmlFor="diagnosis">🔍 {t.diagnosis}</label>
              <input
                id="diagnosis"
                type="text"
                value={prescription.diagnosis}
                onChange={(e) => setPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder={t.placeholders.diagnosis}
                required
              />
            </div>

            <div className="form-section">
              <label htmlFor="treatment">💊 {t.treatment}</label>
              <textarea
                id="treatment"
                value={prescription.treatment}
                onChange={(e) => setPrescription(prev => ({ ...prev, treatment: e.target.value }))}
                placeholder={t.placeholders.treatment}
                rows="3"
                required
              />
            </div>

            <div className="medicines-section">
              <div className="section-header">
                <h4>💉 {t.medicine}</h4>
                <button type="button" className="add-medicine-btn" onClick={addMedicine}>
                  + {t.addMedicine}
                </button>
              </div>
              
              {prescription.medicines.map((medicine, index) => (
                <div key={index} className="medicine-row">
                  <input
                    type="text"
                    value={medicine.name}
                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                    placeholder={t.placeholders.medicine}
                    required
                  />
                  <input
                    type="text"
                    value={medicine.dosage}
                    onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                    placeholder={t.placeholders.dosage}
                    required
                  />
                  <input
                    type="text"
                    value={medicine.duration}
                    onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                    placeholder={t.placeholders.duration}
                    required
                  />
                  {prescription.medicines.length > 1 && (
                    <button
                      type="button"
                      className="remove-medicine-btn"
                      onClick={() => removeMedicine(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="form-section">
              <label htmlFor="instructions">📝 {t.instructions}</label>
              <textarea
                id="instructions"
                value={prescription.instructions}
                onChange={(e) => setPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder={t.placeholders.instructions}
                rows="2"
              />
            </div>

            <div className="form-section">
              <label htmlFor="followUp">📅 {t.followUp}</label>
              <input
                id="followUp"
                type="date"
                value={prescription.followUpDate}
                onChange={(e) => setPrescription(prev => ({ ...prev, followUpDate: e.target.value }))}
              />
            </div>
          </form>

          {/* Signature */}
          <div className="signature-section">
            <div className="signature-line">
              <span>✍️ {t.signature}: {doctorData.name || doctorData.fullName}</span>
            </div>
          </div>
        </div>

        <div className="prescription-actions">
          <button className="save-btn" onClick={handleSave}>
            💾 {t.save}
          </button>
          <button className="cancel-btn" onClick={onClose}>
            ❌ {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionWriter;
