import React, { useState, useEffect } from 'react';
import './MedicineShops.css';

function MedicineShops({ prescription, language = 'bn', onGoBack, onShopSelected }) {
  const [medicineShops, setMedicineShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopDetails, setShopDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const t = {
    bn: {
      title: 'ওষুধের দোকান নির্বাচন করুন',
      subtitle: 'আপনার এলাকার নির্ভরযোগ্য ওষুধের দোকান থেকে অর্ডার করুন',
      prescriptionInfo: 'প্রেসক্রিপশন তথ্য',
      availableShops: 'উপলব্ধ দোকানসমূহ',
      selectShop: 'দোকান নির্বাচন করুন',
      shopDetails: 'দোকানের বিস্তারিত',
      rating: 'রেটিং',
      location: 'অবস্থান',
      deliveryTime: 'ডেলিভারি সময়',
      medicines: 'ওষুধসমূহ',
      quantity: 'পরিমাণ',
      price: 'দাম',
      total: 'মোট',
      available: 'পাওয়া যাচ্ছে',
      notAvailable: 'পাওয়া যাচ্ছে না',
      proceedToOrder: 'অর্ডার করুন',
      back: 'ফিরে যান',
      subtotal: 'উপমোট',
      deliveryCharge: 'ডেলিভারি চার্জ',
      grandTotal: 'সর্বমোট',
      selectToOrder: 'অর্ডার করার জন্য দোকান নির্বাচন করুন',
      contact: 'যোগাযোগ'
    },
    en: {
      title: 'Select Medicine Shop',
      subtitle: 'Order from trusted medicine shops in your area',
      prescriptionInfo: 'Prescription Info',
      availableShops: 'Available Shops',
      selectShop: 'Select Shop',
      shopDetails: 'Shop Details',
      rating: 'Rating',
      location: 'Location',
      deliveryTime: 'Delivery Time',
      medicines: 'Medicines',
      quantity: 'Quantity',
      price: 'Price',
      total: 'Total',
      available: 'Available',
      notAvailable: 'Not Available',
      proceedToOrder: 'Proceed to Order',
      back: 'Back',
      subtotal: 'Subtotal',
      deliveryCharge: 'Delivery Charge',
      grandTotal: 'Grand Total',
      selectToOrder: 'Select a shop to place order',
      contact: 'Contact'
    }
  }[language];

  // Mock medicine shops data
  const medicineShops = [
    {
      id: 1,
      name: 'স্বাস্থ্য ফার্মেসি',
      location: 'ধানমন্ডি, ঢাকা',
      rating: 4.8,
      deliveryTime: '২-৪ ঘন্টা',
      contact: '01711-234567',
      image: '🏪',
      deliveryCharge: 50,
      medicines: [
        { name: 'Paracetamol', price: 8, available: true },
        { name: 'Amoxicillin', price: 120, available: true },
        { name: 'Metformin', price: 95, available: false },
        { name: 'Aspirin', price: 15, available: true }
      ]
    },
    {
      id: 2,
      name: 'লাজুক ফার্মেসি',
      location: 'গুলশান, ঢাকা',
      rating: 4.9,
      deliveryTime: '১-৩ ঘন্টা',
      contact: '01811-345678',
      image: '💊',
      deliveryCharge: 60,
      medicines: [
        { name: 'Paracetamol', price: 10, available: true },
        { name: 'Amoxicillin', price: 115, available: true },
        { name: 'Metformin', price: 90, available: true },
        { name: 'Aspirin', price: 18, available: true }
      ]
    },
    {
      id: 3,
      name: 'কৃষক ফার্মেসি',
      location: 'মিরপুর, ঢাকা',
      rating: 4.6,
      deliveryTime: '৩-৫ ঘন্টা',
      contact: '01911-456789',
      image: '🌿',
      deliveryCharge: 40,
      medicines: [
        { name: 'Paracetamol', price: 7, available: true },
        { name: 'Amoxicillin', price: 125, available: false },
        { name: 'Metformin', price: 100, available: true },
        { name: 'Aspirin', price: 12, available: true }
      ]
    },
    {
      id: 4,
      name: 'হেলথ প্লাস ফার্মেসি',
      location: 'বনানী, ঢাকা',
      rating: 4.7,
      deliveryTime: '২-৪ ঘন্টা',
      contact: '01611-567890',
      image: '🏥',
      deliveryCharge: 55,
      medicines: [
        { name: 'Paracetamol', price: 9, available: true },
        { name: 'Amoxicillin', price: 110, available: true },
        { name: 'Metformin', price: 85, available: true },
        { name: 'Aspirin', price: 16, available: true }
      ]
    }
  ];

  const [selectedShop, setSelectedShop] = useState(null);
  const [medicineQuantities, setMedicineQuantities] = useState({});

  // Initialize quantities
  React.useEffect(() => {
    if (prescription && prescription.medicines) {
      const quantities = {};
      prescription.medicines.forEach((med, idx) => {
        quantities[med.name] = 1;
      });
      setMedicineQuantities(quantities);
    }
  }, [prescription]);

  const handleQuantityChange = (medicineName, quantity) => {
    setMedicineQuantities(prev => ({
      ...prev,
      [medicineName]: Math.max(1, parseInt(quantity) || 1)
    }));
  };

  const getMedicinePrice = (shopId, medicineName) => {
    const shop = medicineShops.find(s => s.id === shopId);
    const medicine = shop?.medicines.find(m => m.name === medicineName);
    return medicine?.price || 50; // Default price if not found
  };

  const isMedicineAvailable = (shopId, medicineName) => {
    const shop = medicineShops.find(s => s.id === shopId);
    const medicine = shop?.medicines.find(m => m.name === medicineName);
    return medicine?.available || false;
  };

  const calculateSubtotal = (shopId) => {
    if (!prescription?.medicines) return 0;
    let total = 0;
    prescription.medicines.forEach(med => {
      const price = getMedicinePrice(shopId, med.name);
      const quantity = medicineQuantities[med.name] || 1;
      total += price * quantity;
    });
    return total;
  };

  const calculateGrandTotal = (shopId) => {
    const shop = medicineShops.find(s => s.id === shopId);
    const subtotal = calculateSubtotal(shopId);
    const deliveryCharge = shop?.deliveryCharge || 50;
    return subtotal + deliveryCharge;
  };

  const handleProceedToOrder = () => {
    if (!selectedShop) {
      alert(language === 'bn' ? 'দোকান নির্বাচন করুন' : 'Please select a shop');
      return;
    }

    const orderData = {
      shop: selectedShop,
      prescription: prescription,
      medicines: prescription.medicines.map(med => ({
        ...med,
        quantity: medicineQuantities[med.name] || 1,
        price: getMedicinePrice(selectedShop.id, med.name),
        total: (medicineQuantities[med.name] || 1) * getMedicinePrice(selectedShop.id, med.name),
        available: isMedicineAvailable(selectedShop.id, med.name)
      })),
      subtotal: calculateSubtotal(selectedShop.id),
      deliveryCharge: selectedShop.deliveryCharge,
      grandTotal: calculateGrandTotal(selectedShop.id)
    };

    onShopSelected(orderData);
  };

  return (
    <div className="medicine-shops">
      <div className="shops-header">
        <button className="back-btn" onClick={onGoBack}>
          ← {t.back}
        </button>
        <h1>🏪 {t.title}</h1>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      <div className="shops-content">
        {/* Prescription Info */}
        <div className="prescription-info-card">
          <h3>📋 {t.prescriptionInfo}</h3>
          <div className="prescription-summary">
            <div><strong>প্রেসক্রিপশন নং:</strong> {prescription?.prescriptionNo}</div>
            <div><strong>ডাক্তার:</strong> {prescription?.doctorName}</div>
            <div><strong>তারিখ:</strong> {prescription?.date}</div>
          </div>
        </div>

        {/* Available Shops */}
        <div className="shops-section">
          <h3>🏪 {t.availableShops}</h3>
          <div className="shops-grid">
            {medicineShops.map(shop => {
              const isSelected = selectedShop?.id === shop.id;
              const grandTotal = calculateGrandTotal(shop.id);
              
              return (
                <div 
                  key={shop.id} 
                  className={`shop-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedShop(shop)}
                >
                  <div className="shop-header">
                    <div className="shop-icon">{shop.image}</div>
                    <div className="shop-info">
                      <h4>{shop.name}</h4>
                      <div className="shop-meta">
                        <span>📍 {shop.location}</span>
                        <span>⭐ {shop.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shop-details">
                    <div className="detail-item">
                      <span>🚚 {t.deliveryTime}:</span>
                      <span>{shop.deliveryTime}</span>
                    </div>
                    <div className="detail-item">
                      <span>📞 {t.contact}:</span>
                      <span>{shop.contact}</span>
                    </div>
                    <div className="detail-item">
                      <span>💰 {t.deliveryCharge}:</span>
                      <span>৳{shop.deliveryCharge}</span>
                    </div>
                  </div>

                  {/* Medicine Availability */}
                  <div className="medicines-availability">
                    <h5>💊 {t.medicines}</h5>
                    {prescription?.medicines?.map((med, idx) => {
                      const available = isMedicineAvailable(shop.id, med.name);
                      const price = getMedicinePrice(shop.id, med.name);
                      return (
                        <div key={idx} className="medicine-availability-item">
                          <span className="med-name">{med.name}</span>
                          <span className={`availability ${available ? 'available' : 'unavailable'}`}>
                            {available ? `✅ ৳${price}` : '❌ স্টকে নেই'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="shop-total">
                    <div className="total-info">
                      <div>মোট: ৳{grandTotal}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Shop Details */}
        {selectedShop && (
          <div className="selected-shop-section">
            <h3>🛒 {selectedShop.name} - অর্ডার বিস্তারিত</h3>
            <div className="order-details-card">
              <div className="medicines-list">
                {prescription?.medicines?.map((med, idx) => {
                  const price = getMedicinePrice(selectedShop.id, med.name);
                  const available = isMedicineAvailable(selectedShop.id, med.name);
                  const quantity = medicineQuantities[med.name] || 1;
                  
                  return (
                    <div key={idx} className="medicine-order-row">
                      <div className="medicine-info">
                        <div className="medicine-name">{med.name}</div>
                        <div className="medicine-prescription">
                          <small>মাত্রা: {med.dosage} | সময়কাল: {med.duration}</small>
                        </div>
                      </div>
                      
                      {available ? (
                        <div className="medicine-controls">
                          <div className="quantity-control">
                            <label>পরিমাণ:</label>
                            <input 
                              type="number" 
                              min="1" 
                              value={quantity}
                              onChange={(e) => handleQuantityChange(med.name, e.target.value)}
                            />
                          </div>
                          <div className="price-info">
                            <div>৳{price} x {quantity}</div>
                            <div className="total-price">৳{price * quantity}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="unavailable-info">
                          <span className="unavailable-badge">❌ স্টকে নেই</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>{t.subtotal}:</span>
                  <span>৳{calculateSubtotal(selectedShop.id)}</span>
                </div>
                <div className="summary-row">
                  <span>{t.deliveryCharge}:</span>
                  <span>৳{selectedShop.deliveryCharge}</span>
                </div>
                <div className="summary-row total">
                  <span><strong>{t.grandTotal}:</strong></span>
                  <span><strong>৳{calculateGrandTotal(selectedShop.id)}</strong></span>
                </div>
              </div>

              <div className="order-actions">
                <button 
                  className="back-to-dashboard-btn"
                  onClick={onGoBack}
                >
                  ← ড্যাশবোর্ডে ফিরে যান
                </button>
                <button 
                  className="proceed-btn"
                  onClick={handleProceedToOrder}
                >
                  🛒 {t.proceedToOrder}
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedShop && (
          <div className="select-shop-message">
            <div className="message-card">
              <h3>📝 {t.selectToOrder}</h3>
              <p>উপরের দোকানগুলি থেকে একটি নির্বাচন করুন</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MedicineShops;
