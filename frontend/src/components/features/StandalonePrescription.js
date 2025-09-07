import React, { useState, useEffect } from 'react';
import './PrescriptionWriter.css';

function StandalonePrescription({ doctorData, language = 'bn', onClose, onSave }) {
  const t = {
    bn: {
      title: 'স্বতন্ত্র প্রেসক্রিপশন',
      selectFarmer: 'কৃষক নির্বাচন করুন',
      searchFarmer: 'কৃষক খুঁজুন...',
      farmer: 'কৃষক',
      phone: 'ফোন',
      address: 'ঠিকানা',
      farmType: 'খামারের ধরন',
      diagnosis: 'রোগ নির্ণয়',
      treatment: 'চিকিৎসা পরামর্শ',
      medicines: 'ওষুধসমূহ',
      vaccines: 'ভ্যাকসিনসমূহ',
      selectMedicine: 'ওষুধ নির্বাচন করুন',
      selectVaccine: 'ভ্যাকসিন নির্বাচন করুন',
      dosage: 'মাত্রা',
      duration: 'সময়কাল',
      instructions: 'নির্দেশনা',
      followUp: 'পরবর্তী ভিজিট',
      notes: 'অতিরিক্ত নোট',
      addMedicine: 'ওষুধ যোগ করুন',
      addVaccine: 'ভ্যাকসিন যোগ করুন',
      save: 'প্রেসক্রিপশন সংরক্ষণ করুন',
      cancel: 'বাতিল',
      loading: 'লোড হচ্ছে...',
      noFarmerSelected: 'কৃষক নির্বাচন করুন',
      farmTypes: {
        rice: 'ধান চাষ',
        vegetables: 'সবজি চাষ', 
        fruits: 'ফল চাষ',
        livestock: 'পশুপালন',
        poultry: 'মুরগি পালন',
        fish: 'মাছ চাষ'
      },
      placeholders: {
        diagnosis: 'রোগের নাম বা সমস্যা লিখুন',
        treatment: 'চিকিৎসা পরামর্শ বিস্তারিত লিখুন',
        dosage: 'যেমন: দিনে ২ বার, ১ চামচ',
        duration: 'যেমন: ৭ দিন, ২ সপ্তাহ',
        instructions: 'বিশেষ নির্দেশনা',
        notes: 'অতিরিক্ত মন্তব্য'
      }
    },
    en: {
      title: 'Standalone Prescription',
      selectFarmer: 'Select Farmer',
      searchFarmer: 'Search farmer...',
      farmer: 'Farmer',
      phone: 'Phone',
      address: 'Address',
      farmType: 'Farm Type',
      diagnosis: 'Diagnosis',
      treatment: 'Treatment Advice',
      medicines: 'Medicines',
      vaccines: 'Vaccines',
      selectMedicine: 'Select Medicine',
      selectVaccine: 'Select Vaccine',
      dosage: 'Dosage',
      duration: 'Duration',
      instructions: 'Instructions',
      followUp: 'Follow-up Visit',
      notes: 'Additional Notes',
      addMedicine: 'Add Medicine',
      addVaccine: 'Add Vaccine',
      save: 'Save Prescription',
      cancel: 'Cancel',
      loading: 'Loading...',
      noFarmerSelected: 'Select a farmer',
      farmTypes: {
        rice: 'Rice Farming',
        vegetables: 'Vegetable Farming',
        fruits: 'Fruit Farming',
        livestock: 'Livestock',
        poultry: 'Poultry',
        fish: 'Fish Farming'
      },
      placeholders: {
        diagnosis: 'Enter diagnosis or problem',
        treatment: 'Enter detailed treatment advice',
        dosage: 'e.g., 2 times daily, 1 spoon',
        duration: 'e.g., 7 days, 2 weeks',
        instructions: 'Special instructions',
        notes: 'Additional comments'
      }
    }
  }[language];

  const [farmers, setFarmers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [prescription, setPrescription] = useState({
    diagnosis: '',
    treatment: '',
    selectedMedicines: [],
    selectedVaccines: [],
    instructions: '',
    followUpDate: '',
    notes: ''
  });

  // API call helper
  const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('doctorToken');
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [farmersData, medicinesData, vaccinesData] = await Promise.all([
          apiCall('/api/farmers/all'),
          apiCall('/api/medicines'),
          apiCall('/api/vaccines')
        ]);

        setFarmers(farmersData);
        setMedicines(medicinesData);
        setVaccines(vaccinesData);
      } catch (error) {
        console.error('Error loading data:', error);
        alert(language === 'bn' ? 'ডেটা লোড করতে সমস্যা হয়েছে' : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [language]);

  // Filter farmers based on search
  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.phone.includes(searchTerm)
  );

  // Add medicine to prescription
  const addMedicine = (medicine) => {
    const newMedicine = {
      id: medicine.id,
      name: medicine.name,
      generic_name: medicine.generic_name,
      category: medicine.category,
      dosage: '',
      duration: '',
      instructions: medicine.usage_instructions || ''
    };

    setPrescription(prev => ({
      ...prev,
      selectedMedicines: [...prev.selectedMedicines, newMedicine]
    }));
  };

  // Add vaccine to prescription
  const addVaccine = (vaccine) => {
    const newVaccine = {
      id: vaccine.id,
      name: vaccine.name,
      disease_target: vaccine.disease_target,
      animal_type: vaccine.animal_type,
      dosage: vaccine.dosage || '',
      duration: '',
      instructions: vaccine.usage_instructions || ''
    };

    setPrescription(prev => ({
      ...prev,
      selectedVaccines: [...prev.selectedVaccines, newVaccine]
    }));
  };

  // Update medicine in prescription
  const updateMedicine = (index, field, value) => {
    setPrescription(prev => ({
      ...prev,
      selectedMedicines: prev.selectedMedicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  // Update vaccine in prescription
  const updateVaccine = (index, field, value) => {
    setPrescription(prev => ({
      ...prev,
      selectedVaccines: prev.selectedVaccines.map((vac, i) => 
        i === index ? { ...vac, [field]: value } : vac
      )
    }));
  };

  // Remove medicine from prescription
  const removeMedicine = (index) => {
    setPrescription(prev => ({
      ...prev,
      selectedMedicines: prev.selectedMedicines.filter((_, i) => i !== index)
    }));
  };

  // Remove vaccine from prescription
  const removeVaccine = (index) => {
    setPrescription(prev => ({
      ...prev,
      selectedVaccines: prev.selectedVaccines.filter((_, i) => i !== index)
    }));
  };

  // Save prescription
  const handleSave = async () => {
    if (!selectedFarmer) {
      alert(t.noFarmerSelected);
      return;
    }

    if (!prescription.diagnosis.trim() || !prescription.treatment.trim()) {
      alert(language === 'bn' ? 'রোগ নির্ণয় এবং চিকিৎসা পরামর্শ আবশ্যক' : 'Diagnosis and treatment are required');
      return;
    }

    try {
      const prescriptionData = {
        farmerId: selectedFarmer.id,
        diagnosis: prescription.diagnosis,
        treatment: prescription.treatment,
        medicines: prescription.selectedMedicines,
        vaccines: prescription.selectedVaccines,
        instructions: prescription.instructions,
        followUpDate: prescription.followUpDate || null,
        notes: prescription.notes
      };

      await apiCall('/api/prescriptions/standalone', {
        method: 'POST',
        body: JSON.stringify(prescriptionData)
      });

      alert(language === 'bn' ? 
        'প্রেসক্রিপশন সফলভাবে তৈরি হয়েছে এবং কৃষকের কাছে পাঠানো হয়েছে!' :
        'Prescription created successfully and sent to farmer!'
      );
      
      onSave && onSave(prescriptionData);
      onClose && onClose();
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert(language === 'bn' ? 'প্রেসক্রিপশন সংরক্ষণে সমস্যা হয়েছে' : 'Failed to save prescription');
    }
  };

  if (loading) {
    return (
      <div className="prescription-modal">
        <div className="prescription-container">
          <div className="loading-container">
            <p>{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="prescription-modal">
      <div className="prescription-container standalone-prescription">
        <div className="prescription-header">
          <h2>📋 {t.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="prescription-content">
          {/* Farmer Selection */}
          <div className="farmer-selection-section">
            <h3>👤 {t.selectFarmer}</h3>
            <div className="farmer-search">
              <input
                type="text"
                placeholder={t.searchFarmer}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="farmers-list">
              {filteredFarmers.map(farmer => (
                <div
                  key={farmer.id}
                  className={`farmer-item ${selectedFarmer?.id === farmer.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFarmer(farmer)}
                >
                  <div className="farmer-info">
                    <strong>{farmer.name}</strong>
                    <span>{farmer.phone}</span>
                    <small>{t.farmTypes[farmer.farm_type] || farmer.farm_type}</small>
                  </div>
                </div>
              ))}
            </div>

            {selectedFarmer && (
              <div className="selected-farmer-info">
                <h4>নির্বাচিত কৃষক:</h4>
                <p><strong>{t.farmer}:</strong> {selectedFarmer.name}</p>
                <p><strong>{t.phone}:</strong> {selectedFarmer.phone}</p>
                <p><strong>{t.address}:</strong> {selectedFarmer.address || 'N/A'}</p>
                <p><strong>{t.farmType}:</strong> {t.farmTypes[selectedFarmer.farm_type] || selectedFarmer.farm_type}</p>
              </div>
            )}
          </div>

          {selectedFarmer && (
            <>
              {/* Prescription Form */}
              <form className="prescription-form">
                <div className="form-section">
                  <label htmlFor="diagnosis">🔍 {t.diagnosis} *</label>
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
                  <label htmlFor="treatment">💊 {t.treatment} *</label>
                  <textarea
                    id="treatment"
                    value={prescription.treatment}
                    onChange={(e) => setPrescription(prev => ({ ...prev, treatment: e.target.value }))}
                    placeholder={t.placeholders.treatment}
                    rows="3"
                    required
                  />
                </div>

                {/* Medicine Selection */}
                <div className="medicines-section">
                  <div className="section-header">
                    <h4>💉 {t.medicines}</h4>
                  </div>
                  
                  <div className="medicine-selector">
                    <select onChange={(e) => {
                      const selectedMedicine = medicines.find(m => m.id === parseInt(e.target.value));
                      if (selectedMedicine) {
                        addMedicine(selectedMedicine);
                        e.target.value = '';
                      }
                    }}>
                      <option value="">{t.selectMedicine}</option>
                      {medicines.map(medicine => (
                        <option key={medicine.id} value={medicine.id}>
                          {medicine.name} ({medicine.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {prescription.selectedMedicines.map((medicine, index) => (
                    <div key={index} className="medicine-row">
                      <div className="medicine-info">
                        <strong>{medicine.name}</strong>
                        <small>({medicine.generic_name}) - {medicine.category}</small>
                      </div>
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
                      <input
                        type="text"
                        value={medicine.instructions}
                        onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                        placeholder={t.placeholders.instructions}
                      />
                      <button
                        type="button"
                        className="remove-medicine-btn"
                        onClick={() => removeMedicine(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Vaccine Selection */}
                <div className="vaccines-section">
                  <div className="section-header">
                    <h4>💉 {t.vaccines}</h4>
                  </div>
                  
                  <div className="vaccine-selector">
                    <select onChange={(e) => {
                      const selectedVaccine = vaccines.find(v => v.id === parseInt(e.target.value));
                      if (selectedVaccine) {
                        addVaccine(selectedVaccine);
                        e.target.value = '';
                      }
                    }}>
                      <option value="">{t.selectVaccine}</option>
                      {vaccines.map(vaccine => (
                        <option key={vaccine.id} value={vaccine.id}>
                          {vaccine.name} ({vaccine.animal_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {prescription.selectedVaccines.map((vaccine, index) => (
                    <div key={index} className="vaccine-row">
                      <div className="vaccine-info">
                        <strong>{vaccine.name}</strong>
                        <small>{vaccine.disease_target} - {vaccine.animal_type}</small>
                      </div>
                      <input
                        type="text"
                        value={vaccine.dosage}
                        onChange={(e) => updateVaccine(index, 'dosage', e.target.value)}
                        placeholder={t.placeholders.dosage}
                        required
                      />
                      <input
                        type="text"
                        value={vaccine.duration}
                        onChange={(e) => updateVaccine(index, 'duration', e.target.value)}
                        placeholder={t.placeholders.duration}
                        required
                      />
                      <input
                        type="text"
                        value={vaccine.instructions}
                        onChange={(e) => updateVaccine(index, 'instructions', e.target.value)}
                        placeholder={t.placeholders.instructions}
                      />
                      <button
                        type="button"
                        className="remove-vaccine-btn"
                        onClick={() => removeVaccine(index)}
                      >
                        ×
                      </button>
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

                <div className="form-section">
                  <label htmlFor="notes">📝 {t.notes}</label>
                  <textarea
                    id="notes"
                    value={prescription.notes}
                    onChange={(e) => setPrescription(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={t.placeholders.notes}
                    rows="2"
                  />
                </div>
              </form>

              {/* Signature */}
              <div className="signature-section">
                <div className="signature-line">
                  <span>✍️ ডাক্তার: {doctorData.name}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="prescription-actions">
          {selectedFarmer && (
            <button className="save-btn" onClick={handleSave}>
              💾 {t.save}
            </button>
          )}
          <button className="cancel-btn" onClick={onClose}>
            ❌ {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StandalonePrescription;
