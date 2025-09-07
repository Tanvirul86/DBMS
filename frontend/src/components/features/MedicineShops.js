import React, { useState, useEffect } from 'react';
import './MedicineShops.css';

function MedicineShops({ prescription, language = 'bn', onGoBack, onShopSelected }) {
  const [medicineShops, setMedicineShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicineQuantities, setMedicineQuantities] = useState({});
  const [availabilityData, setAvailabilityData] = useState({});

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
      contact: 'যোগাযোগ',
      loading: 'লোড হচ্ছে...',
      error: 'ত্রুটি ঘটেছে',
      openingHours: 'খোলার সময়'
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
      contact: 'Contact',
      loading: 'Loading...',
      error: 'Error occurred',
      openingHours: 'Opening Hours'
    }
  }[language];

  // Load medicine shops from backend
  useEffect(() => {
    loadMedicineShops();
  }, []);

  // Initialize quantities when prescription changes
  useEffect(() => {
    if (prescription && prescription.medicines) {
      const quantities = {};
      prescription.medicines.forEach((med) => {
        quantities[med.name] = 1;
      });
      setMedicineQuantities(quantities);
    }
  }, [prescription]);

  const loadMedicineShops = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading medicine shops from API...');
      const response = await fetch('http://localhost:5000/api/medicine-shops');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch shops: ${response.status}`);
      }
      
      const shops = await response.json();
      console.log('Loaded shops from API:', shops);
      
      // Add enhanced data for better UX
      const enhancedShops = shops.map((shop, index) => ({
        ...shop,
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        deliveryTime: ['১-২ ঘন্টা', '২-৩ ঘন্টা', '২-৪ ঘন্টা'][index % 3],
        deliveryTimeEn: ['1-2 hours', '2-3 hours', '2-4 hours'][index % 3],
        deliveryCharge: [40, 50, 60][index % 3],
        image: ['🏪', '💊', '🌿', '🏥', '🏬'][index % 5]
      }));
      
      console.log('Enhanced shops:', enhancedShops);
      setMedicineShops(enhancedShops);
      
    } catch (error) {
      console.error('Error loading medicine shops:', error);
      setError(error.message);
      
      // Fallback to demo data if API fails
      const fallbackShops = [
        {
          id: 999,
          name: 'Demo Pharmacy',
          address: 'Demo Location',
          phone: '01700000000',
          opening_hours: '24/7',
          rating: '4.5',
          deliveryTime: '২ ঘন্টা',
          deliveryTimeEn: '2 hours',
          deliveryCharge: 50,
          image: '🏪'
        }
      ];
      setMedicineShops(fallbackShops);
    } finally {
      setLoading(false);
    }
  };

  const checkMedicineAvailability = async (shopId) => {
    console.log('📋 Loading all available medicines for shop:', shopId);
    
    // Always show general farm medicines catalog (no API call needed)
    const allAvailableMedicines = [
      { name: 'Mancozeb 75% WP', available: true, price: 250, stock: 50, dosage: '2g/L', duration: 'As needed', category: 'Fungicide' },
      { name: 'Carbendazim 50% WP', available: true, price: 180, stock: 30, dosage: '1g/L', duration: 'As needed', category: 'Fungicide' },
      { name: 'Imidacloprid 17.8% SL', available: true, price: 320, stock: 25, dosage: '0.5ml/L', duration: 'As needed', category: 'Insecticide' },
      { name: 'Lambda Cyhalothrin 5% EC', available: true, price: 280, stock: 40, dosage: '1ml/L', duration: 'As needed', category: 'Insecticide' },
      { name: 'Copper Sulfate', available: true, price: 150, stock: 100, dosage: '2g/L', duration: 'As needed', category: 'Fungicide' },
      { name: 'Urea Fertilizer', available: true, price: 800, stock: 200, dosage: '20-30g/plant', duration: 'Weekly', category: 'Fertilizer' },
      { name: 'NPK 20-20-20', available: true, price: 450, stock: 80, dosage: '10g/L', duration: 'Bi-weekly', category: 'Fertilizer' },
      { name: 'Potash (K2O)', available: true, price: 350, stock: 60, dosage: '15g/plant', duration: 'Monthly', category: 'Fertilizer' },
      { name: 'Organic Pesticide', available: true, price: 420, stock: 35, dosage: '3ml/L', duration: 'As needed', category: 'Organic' },
      { name: 'Growth Hormone', available: true, price: 600, stock: 25, dosage: '1ml/L', duration: 'Monthly', category: 'Growth' }
    ];
    
    setAvailabilityData(prev => ({
      ...prev,
      [shopId]: allAvailableMedicines
    }));
    
    console.log('✅ All medicines loaded successfully for shop:', shopId);
  };

  const handleShopSelect = async (shop) => {
    console.log('Shop selected:', shop);
    setSelectedShop(shop);
    setLoading(true);
    
    try {
      // Always check medicine availability when a shop is selected
      await checkMedicineAvailability(shop.id);
    } catch (error) {
      console.error('Error selecting shop:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (medicineName, quantity) => {
    setMedicineQuantities(prev => ({
      ...prev,
      [medicineName]: Math.max(1, parseInt(quantity) || 1)
    }));
  };

  const getMedicineData = (shopId, medicineName) => {
    const shopAvailability = availabilityData[shopId];
    if (!shopAvailability) return { price: 50, available: false, stock: 0 };
    
    const medicine = shopAvailability.find(m => m.name === medicineName);
    return medicine || { price: 50, available: false, stock: 0 };
  };

  const calculateSubtotal = (shopId) => {
    const medicines = prescription?.medicines || availabilityData[shopId] || [];
    if (medicines.length === 0) return 0;
    
    let total = 0;
    medicines.forEach(med => {
      const medicineData = getMedicineData(shopId, med.name);
      const quantity = medicineQuantities[med.name] || 1;
      if (medicineData.available) {
        total += medicineData.price * quantity;
      }
    });
    return total;
  };

  const calculateGrandTotal = (shopId) => {
    const shop = medicineShops.find(s => s.id === shopId);
    const subtotal = calculateSubtotal(shopId);
    const deliveryCharge = shop?.deliveryCharge || 50;
    return subtotal + deliveryCharge;
  };

  const handleProceedToOrder = async () => {
    if (!selectedShop) {
      alert(language === 'bn' ? 'দোকান নির্বাচন করুন' : 'Please select a shop');
      return;
    }

    const medicines = availabilityData[selectedShop.id] || [];
    
    // Get only medicines with quantity > 0
    const orderedMedicines = medicines.filter(med => 
      (medicineQuantities[med.name] || 0) > 0
    ).map(med => ({
      name: med.name,
      quantity: medicineQuantities[med.name] || 1,
      price: med.price,
      total: (medicineQuantities[med.name] || 1) * med.price,
      category: med.category || 'General'
    }));

    if (orderedMedicines.length === 0) {
      alert(language === 'bn' ? 'কমপক্ষে একটি ওষুধের পরিমাণ নির্বাচন করুন' : 'Please select at least one medicine with quantity');
      return;
    }

    const subtotal = orderedMedicines.reduce((sum, med) => sum + med.total, 0);
    const deliveryCharge = 50; // Fixed delivery charge
    const grandTotal = subtotal + deliveryCharge;
    
    const orderData = {
      orderId: 'ORD-' + Date.now(),
      shop: selectedShop,
      medicines: orderedMedicines,
      subtotal: subtotal,
      deliveryCharge: deliveryCharge,
      grandTotal: grandTotal,
      paymentMethod: 'Cash on Delivery',
      status: 'Confirmed',
      orderDate: new Date().toISOString().split('T')[0],
      estimatedDelivery: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0] // Tomorrow
    };

    console.log('📦 Order placed:', orderData);
    
    // Show confirmation
    const confirmMessage = language === 'bn' 
      ? `✅ অর্ডার সফলভাবে দেওয়া হয়েছে!\n\nঅর্ডার নম্বর: ${orderData.orderId}\nদোকান: ${selectedShop.name}\nমোট: ৳${grandTotal}\nপেমেন্ট: ক্যাশ অন ডেলিভারি\nআনুমানিক ডেলিভারি: আগামীকাল\n\nধন্যবাদ!`
      : `✅ Order placed successfully!\n\nOrder ID: ${orderData.orderId}\nShop: ${selectedShop.name}\nTotal: ৳${grandTotal}\nPayment: Cash on Delivery\nEstimated Delivery: Tomorrow\n\nThank you!`;
    
    alert(confirmMessage);
    
    // Save order to localStorage for history
    const existingOrders = JSON.parse(localStorage.getItem('farmerMedicineOrders') || '[]');
    existingOrders.unshift(orderData);
    localStorage.setItem('farmerMedicineOrders', JSON.stringify(existingOrders));
    
    // Go back to dashboard
    onGoBack();
  };

  if (loading) {
    return (
      <div className="medicine-shops">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medicine-shops">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <p>{t.error}: {error}</p>
          <button onClick={loadMedicineShops} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="medicine-shops">
      <div className="header">
        <button onClick={onGoBack} className="back-btn">← {t.back}</button>
        <h2>{t.title}</h2>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      {/* Prescription Info */}
      {prescription && prescription.medicines && prescription.medicines.length > 0 ? (
        <div className="prescription-info">
          <h3>{t.prescriptionInfo}</h3>
          <div className="prescription-details">
            <p><strong>{t.prescriptionNo || 'Prescription'}:</strong> {prescription.prescription_no || prescription.id}</p>
            <p><strong>Doctor:</strong> {prescription.doctor_name}</p>
            <div className="prescription-medicines">
              <strong>{t.medicines}:</strong>
              <ul>
                {prescription.medicines?.map((med, idx) => (
                  <li key={idx}>
                    {med.name} - {med.dosage} ({med.duration})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="general-shopping-info">
          <h3>🛒 {language === 'bn' ? 'সাধারণ ওষুধ কেনাকাটা' : 'General Medicine Shopping'}</h3>
          <p className="shopping-note">
            {language === 'bn' ? 
              'আপনি যেকোনো দোকান থেকে সাধারণ কৃষি ওষুধ কিনতে পারেন। দোকান নির্বাচন করুন এবং প্রয়োজনীয় ওষুধ দেখুন।' :
              'You can buy general agricultural medicines from any shop. Select a shop and browse available medicines.'
            }
          </p>
        </div>
      )}

      {/* Available Shops */}
      <div className="shops-section">
        <h3>🏪 {t.availableShops}</h3>
        <p className="shops-subtitle">
          {language === 'bn' ? 
            `${medicineShops.length}টি দোকান আপনার সেবার জন্য প্রস্তুত` : 
            `${medicineShops.length} shops ready to serve you`
          }
        </p>
        
        {medicineShops.length === 0 ? (
          <div className="no-shops">
            <div className="empty-icon">🏪</div>
            <h3>{language === 'bn' ? 'কোন দোকান খুঁজে পাওয়া যায়নি' : 'No shops found'}</h3>
            <button onClick={loadMedicineShops} className="retry-btn">
              🔄 {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Retry'}
            </button>
          </div>
        ) : (
          <div className="shops-grid">
            {medicineShops.map(shop => (
              <div 
                key={shop.id} 
                className={`shop-card ${selectedShop?.id === shop.id ? 'selected' : ''}`}
                onClick={() => handleShopSelect(shop)}
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                <div className="shop-header">
                  <div className="shop-icon">{shop.image}</div>
                  <div className="shop-badge">
                    <span className="rating">⭐ {shop.rating}</span>
                  </div>
                </div>
                
                <div className="shop-info">
                  <h4 className="shop-name">{shop.name}</h4>
                  <p className="location">📍 {shop.address}</p>
                  <p className="contact">📞 {shop.phone}</p>
                  <p className="hours">🕐 {shop.opening_hours}</p>
                  
                  <div className="shop-features">
                    <span className="delivery-time">
                      🚚 {language === 'bn' ? shop.deliveryTime : shop.deliveryTimeEn}
                    </span>
                    <span className="delivery-charge">
                      � {language === 'bn' ? 'ডেলিভারি' : 'Delivery'}: ৳{shop.deliveryCharge}
                    </span>
                  </div>
                </div>
                
                <div className="shop-actions">
                  <button 
                    className={`select-btn ${selectedShop?.id === shop.id ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShopSelect(shop);
                    }}
                    disabled={loading && selectedShop?.id === shop.id}
                  >
                    {loading && selectedShop?.id === shop.id ? 
                      '⏳ Loading...' :
                      selectedShop?.id === shop.id ? 
                        `✅ ${language === 'bn' ? 'নির্বাচিত - ওষুধ দেখুন' : 'Selected - View Medicines'}` : 
                        `🏪 ${t.selectShop}`
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shop Details */}
      {selectedShop && availabilityData[selectedShop.id] && (
        <div className="shop-details" style={{
          backgroundColor: '#f8f9fa',
          border: '2px solid #28a745',
          borderRadius: '10px',
          padding: '20px',
          margin: '20px 0',
          boxShadow: '0 4px 15px rgba(40, 167, 69, 0.2)'
        }}>
          <div style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: 0 }}>🎯 {t.shopDetails} - {selectedShop.name}</h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
              ✅ {availabilityData[selectedShop.id]?.length || 0} medicines loaded - Select quantities below
            </p>
          </div>
          
          <div className="medicines-table" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '15px',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#e9ecef' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>{t.medicines}</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>{t.quantity}</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>{t.price}</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>{t.total}</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(prescription?.medicines || availabilityData[selectedShop.id] || []).map((med, idx) => {
                  const medicineName = med.name;
                  const medicineData = getMedicineData(selectedShop.id, medicineName);
                  const quantity = medicineQuantities[medicineName] || 1;
                  const total = quantity * medicineData.price;
                  
                  return (
                    <tr key={idx} style={{ 
                      backgroundColor: idx % 2 === 0 ? '#f8f9fa' : 'white',
                      border: '1px solid #dee2e6'
                    }}>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <div className="medicine-info">
                          <strong style={{ color: '#495057', fontSize: '16px' }}>{medicineName}</strong><br/>
                          <small style={{ color: '#6c757d', fontSize: '12px' }}>{med.dosage || medicineData.dosage}</small>
                          {medicineData.category && (
                            <span style={{ 
                              backgroundColor: '#007bff', 
                              color: 'white', 
                              padding: '2px 6px', 
                              borderRadius: '3px', 
                              fontSize: '10px',
                              marginLeft: '8px'
                            }}>
                              {medicineData.category}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => handleQuantityChange(medicineName, Math.max(0, quantity - 1))}
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              cursor: 'pointer'
                            }}
                          >-</button>
                          <input
                            type="number"
                            min="0"
                            max={medicineData.available ? medicineData.stock : 0}
                            value={quantity}
                            onChange={(e) => handleQuantityChange(medicineName, e.target.value)}
                            className="quantity-input"
                            disabled={!medicineData.available}
                            style={{
                              width: '60px',
                              textAlign: 'center',
                              padding: '6px',
                              border: '1px solid #ced4da',
                              borderRadius: '4px'
                            }}
                          />
                          <button 
                            onClick={() => handleQuantityChange(medicineName, quantity + 1)}
                            style={{
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              cursor: 'pointer'
                            }}
                          >+</button>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#28a745' }}>৳{medicineData.price}</td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#007bff' }}>৳{total}</td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                        <span className={`status ${medicineData.available ? 'available' : 'unavailable'}`} style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: medicineData.available ? '#d4edda' : '#f8d7da',
                          color: medicineData.available ? '#155724' : '#721c24'
                        }}>
                          {medicineData.available ? t.available : t.notAvailable}
                          {medicineData.available && ` (${medicineData.stock} in stock)`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
              <span>{t.grandTotal}:</span>
              <span>৳{calculateGrandTotal(selectedShop.id)}</span>
            </div>
          </div>

          <button 
            onClick={handleProceedToOrder} 
            className="proceed-btn"
            disabled={(() => {
              const medicines = prescription?.medicines || availabilityData[selectedShop.id] || [];
              return medicines.length === 0 || !medicines.some(med => getMedicineData(selectedShop.id, med.name).available);
            })()}
          >
            {t.proceedToOrder}
          </button>
        </div>
      )}

      {selectedShop && !availabilityData[selectedShop.id] && loading && (
        <div className="loading-availability">
          <div className="loading-spinner">⏳</div>
          <p>{language === 'bn' ? 
            `${selectedShop.name} দোকানের ওষুধের তালিকা লোড হচ্ছে...` : 
            `Loading medicine availability for ${selectedShop.name}...`
          }</p>
        </div>
      )}
    </div>
  );
}

export default MedicineShops;
