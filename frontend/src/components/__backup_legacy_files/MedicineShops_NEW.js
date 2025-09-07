import React, { useState, useEffect } from 'react';
import './MedicineShops.css';

function MedicineShops({ prescription, language = 'bn', onGoBack, onShopSelected }) {
  const [medicineShops, setMedicineShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopDetails, setShopDetails] = useState(null);
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
      const response = await fetch('http://localhost:5000/api/medicine-shops');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch shops: ${response.status}`);
      }
      
      const shops = await response.json();
      
      // Add mock additional data for demonstration
      const enhancedShops = shops.map((shop, index) => ({
        ...shop,
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        deliveryTime: ['1-2 hours', '2-3 hours', '2-4 hours'][index % 3],
        deliveryCharge: [40, 50, 60][index % 3],
        image: ['🏪', '💊', '🌿', '🏥'][index % 4]
      }));
      
      setMedicineShops(enhancedShops);
      setError(null);
    } catch (error) {
      console.error('Error loading medicine shops:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkMedicineAvailability = async (shopId) => {
    if (!prescription?.medicines) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/medicine-shops/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopId: shopId,
          prescriptionMedicines: prescription.medicines
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to check availability: ${response.status}`);
      }
      
      const data = await response.json();
      setAvailabilityData(prev => ({
        ...prev,
        [shopId]: data.medicines
      }));
    } catch (error) {
      console.error('Error checking medicine availability:', error);
    }
  };

  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
    checkMedicineAvailability(shop.id);
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
    if (!prescription?.medicines || !availabilityData[shopId]) return 0;
    
    let total = 0;
    prescription.medicines.forEach(med => {
      const medicineData = getMedicineData(shopId, med.name);
      const quantity = medicineQuantities[med.name] || 1;
      total += medicineData.price * quantity;
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

    const orderData = {
      shop: selectedShop,
      prescription: prescription,
      medicines: prescription.medicines.map(med => {
        const medicineData = getMedicineData(selectedShop.id, med.name);
        return {
          ...med,
          quantity: medicineQuantities[med.name] || 1,
          price: medicineData.price,
          total: (medicineQuantities[med.name] || 1) * medicineData.price,
          available: medicineData.available,
          stock: medicineData.stock
        };
      }),
      subtotal: calculateSubtotal(selectedShop.id),
      deliveryCharge: selectedShop.deliveryCharge,
      grandTotal: calculateGrandTotal(selectedShop.id)
    };

    onShopSelected(orderData);
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
      {prescription && (
        <div className="prescription-info">
          <h3>{t.prescriptionInfo}</h3>
          <div className="prescription-details">
            <p><strong>{t.prescriptionNo}:</strong> {prescription.prescription_no || prescription.id}</p>
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
      )}

      {/* Available Shops */}
      <div className="shops-section">
        <h3>{t.availableShops}</h3>
        <div className="shops-grid">
          {medicineShops.map(shop => (
            <div 
              key={shop.id} 
              className={`shop-card ${selectedShop?.id === shop.id ? 'selected' : ''}`}
              onClick={() => handleShopSelect(shop)}
            >
              <div className="shop-icon">{shop.image}</div>
              <div className="shop-info">
                <h4>{shop.name}</h4>
                <p className="location">📍 {shop.address}</p>
                <p className="contact">📞 {shop.phone}</p>
                <p className="hours">🕐 {shop.opening_hours}</p>
                <div className="shop-meta">
                  <span className="rating">⭐ {shop.rating}</span>
                  <span className="delivery-time">🚚 {shop.deliveryTime}</span>
                </div>
              </div>
              <button className="select-btn">
                {selectedShop?.id === shop.id ? '✅ Selected' : t.selectShop}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Shop Details */}
      {selectedShop && availabilityData[selectedShop.id] && (
        <div className="shop-details">
          <h3>{t.shopDetails} - {selectedShop.name}</h3>
          
          <div className="medicines-table">
            <table>
              <thead>
                <tr>
                  <th>{t.medicines}</th>
                  <th>{t.quantity}</th>
                  <th>{t.price}</th>
                  <th>{t.total}</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {prescription?.medicines?.map((med, idx) => {
                  const medicineData = getMedicineData(selectedShop.id, med.name);
                  const quantity = medicineQuantities[med.name] || 1;
                  const total = quantity * medicineData.price;
                  
                  return (
                    <tr key={idx}>
                      <td>
                        <div className="medicine-info">
                          <strong>{med.name}</strong>
                          <small>{med.dosage}</small>
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(med.name, e.target.value)}
                          className="quantity-input"
                        />
                      </td>
                      <td>৳{medicineData.price}</td>
                      <td>৳{total}</td>
                      <td>
                        <span className={`status ${medicineData.available ? 'available' : 'unavailable'}`}>
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
            disabled={!prescription?.medicines?.some(med => getMedicineData(selectedShop.id, med.name).available)}
          >
            {t.proceedToOrder}
          </button>
        </div>
      )}

      {selectedShop && !availabilityData[selectedShop.id] && (
        <div className="loading-availability">
          <p>Checking medicine availability... ⏳</p>
        </div>
      )}
    </div>
  );
}

export default MedicineShops;
