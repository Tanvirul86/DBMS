import React, { useState } from 'react';
import './MedicineOrder.css';

function MedicineOrder({ prescription, language = 'bn', onClose, onOrderComplete }) {
  const t = {
    bn: {
      title: 'ওষুধ অর্ডার করুন',
      subtitle: 'অনলাইনে ওষুধ অর্ডার করুন এবং ঘরে বসে পেয়ে যান',
      prescriptionInfo: 'প্রেসক্রিপশন তথ্য',
      medicineList: 'ওষুধের তালিকা',
      deliveryInfo: 'ডেলিভারি তথ্য',
      name: 'নাম',
      phone: 'ফোন',
      address: 'ঠিকানা',
      urgentDelivery: 'জরুরি ডেলিভারি (২৪ ঘন্টা)',
      normalDelivery: 'সাধারণ ডেলিভারি (২-৩ দিন)',
      paymentMethod: 'পেমেন্ট পদ্ধতি',
      cashOnDelivery: 'ডেলিভারিতে পেমেন্ট',
      bkash: 'বিকাশ',
      nagad: 'নগদ',
      total: 'মোট',
      deliveryCharge: 'ডেলিভারি চার্জ',
      grandTotal: 'সর্বমোট',
      placeOrder: 'অর্ডার করুন',
      cancel: 'বাতিল',
      orderPlacing: 'অর্ডার করা হচ্ছে...',
      pharmacies: 'ফার্মেসি',
      selectPharmacy: 'ফার্মেসি নির্বাচন করুন',
      inStock: 'স্টকে আছে',
      outOfStock: 'স্টকে নেই',
      quantity: 'পরিমাণ',
      price: 'দাম',
      available: 'পাওয়া যাচ্ছে'
    },
    en: {
      title: 'Order Medicine',
      subtitle: 'Order medicine online and get it delivered to your home',
      prescriptionInfo: 'Prescription Info',
      medicineList: 'Medicine List',
      deliveryInfo: 'Delivery Info',
      name: 'Name',
      phone: 'Phone',
      address: 'Address',
      urgentDelivery: 'Urgent Delivery (24 hours)',
      normalDelivery: 'Normal Delivery (2-3 days)',
      paymentMethod: 'Payment Method',
      cashOnDelivery: 'Cash on Delivery',
      bkash: 'bKash',
      nagad: 'Nagad',
      total: 'Total',
      deliveryCharge: 'Delivery Charge',
      grandTotal: 'Grand Total',
      placeOrder: 'Place Order',
      cancel: 'Cancel',
      orderPlacing: 'Placing order...',
      pharmacies: 'Pharmacies',
      selectPharmacy: 'Select Pharmacy',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      quantity: 'Quantity',
      price: 'Price',
      available: 'Available'
    }
  }[language];

  // Mock pharmacy data
  const pharmacies = [
    { id: 1, name: 'লাজুক ফার্মেসি', location: 'ঢাকা', rating: 4.8, deliveryTime: '২-৪ ঘন্টা' },
    { id: 2, name: 'স্বাস্থ্য ফার্মেসি', location: 'চট্টগ্রাম', rating: 4.6, deliveryTime: '১-২ দিন' },
    { id: 3, name: 'কৃষক ফার্মেসি', location: 'সিলেট', rating: 4.9, deliveryTime: '৩-৬ ঘন্টা' }
  ];

  // Mock medicine prices and availability
  const getMedicinePrice = (medicineName) => {
    const prices = {
      'Streptomycin': 120,
      'Copper Sulfate': 80,
      'Bordeaux Mixture': 95,
      'Mancozeb': 150,
      'Carbendazim': 180,
      'Imidacloprid': 200,
      'Thiamethoxam': 250
    };
    // If exact match not found, generate random price between 50-300
    return prices[medicineName] || (50 + Math.floor(Math.random() * 250));
  };

  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [deliveryType, setDeliveryType] = useState('normal');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [medicineQuantities, setMedicineQuantities] = useState({});
  const [ordering, setOrdering] = useState(false);

  // Load farmer profile for delivery info
  React.useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('farmerProfile') || '{}');
    setDeliveryInfo({
      name: profile.name || '',
      phone: profile.phone || '',
      address: profile.address || ''
    });
    
    // Initialize quantities to 1 for each medicine
    const quantities = {};
    prescription.medicines.forEach((med, idx) => {
      quantities[idx] = 1;
    });
    setMedicineQuantities(quantities);
  }, [prescription]);

  const calculateTotal = () => {
    let total = 0;
    prescription.medicines.forEach((med, idx) => {
      const price = getMedicinePrice(med.name);
      const quantity = medicineQuantities[idx] || 1;
      total += price * quantity;
    });
    return total;
  };

  const getDeliveryCharge = () => {
    if (deliveryType === 'urgent') return 100;
    return selectedPharmacy?.location === 'ঢাকা' ? 50 : 80;
  };

  const handleQuantityChange = (index, quantity) => {
    setMedicineQuantities(prev => ({
      ...prev,
      [index]: Math.max(1, parseInt(quantity) || 1)
    }));
  };

  const handlePlaceOrder = async () => {
    if (!selectedPharmacy) {
      alert(language === 'bn' ? 'ফার্মেসি নির্বাচন করুন' : 'Please select a pharmacy');
      return;
    }
    
    setOrdering(true);
    
    // Simulate API call
    setTimeout(() => {
      const orderData = {
        orderId: `ORD-${Date.now()}`,
        prescriptionNo: prescription.prescriptionNo,
        pharmacy: selectedPharmacy,
        medicines: prescription.medicines.map((med, idx) => ({
          ...med,
          quantity: medicineQuantities[idx] || 1,
          price: getMedicinePrice(med.name),
          total: (medicineQuantities[idx] || 1) * getMedicinePrice(med.name)
        })),
        deliveryInfo,
        deliveryType,
        paymentMethod,
        subtotal: calculateTotal(),
        deliveryCharge: getDeliveryCharge(),
        grandTotal: calculateTotal() + getDeliveryCharge(),
        orderDate: new Date().toISOString(),
        status: 'confirmed',
        estimatedDelivery: deliveryType === 'urgent' 
          ? new Date(Date.now() + 24*60*60*1000).toISOString().slice(0,10)
          : new Date(Date.now() + 3*24*60*60*1000).toISOString().slice(0,10)
      };

      // Save to localStorage
      const orders = JSON.parse(localStorage.getItem('medicineOrders') || '[]');
      orders.unshift(orderData);
      localStorage.setItem('medicineOrders', JSON.stringify(orders));

      // Add notification
      const notifications = JSON.parse(localStorage.getItem('farmerNotifications') || '[]');
      notifications.unshift({
        id: Date.now(),
        type: 'medicine_order',
        title: language === 'bn' ? 'ওষুধ অর্ডার নিশ্চিত' : 'Medicine Order Confirmed',
        content: language === 'bn' 
          ? `অর্ডার ID: ${orderData.orderId} - ${orderData.estimatedDelivery} তারিখে ডেলিভারি হবে`
          : `Order ID: ${orderData.orderId} - Delivery on ${orderData.estimatedDelivery}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        orderId: orderData.orderId
      });
      localStorage.setItem('farmerNotifications', JSON.stringify(notifications));

      setOrdering(false);
      onOrderComplete && onOrderComplete(orderData);
      onClose();
    }, 2000);
  };

  return (
    <div className="medicine-order-modal">
      <div className="medicine-order-container">
        <div className="order-header">
          <h2>💊 {t.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="order-content">
          <p className="order-subtitle">{t.subtitle}</p>

          {/* Prescription Info */}
          <div className="section">
            <h3>📋 {t.prescriptionInfo}</h3>
            <div className="prescription-summary">
              <div><strong>প্রেসক্রিপশন নং:</strong> {prescription.prescriptionNo}</div>
              <div><strong>ডাক্তার:</strong> {prescription.doctorName}</div>
              <div><strong>তারিখ:</strong> {prescription.date}</div>
            </div>
          </div>

          {/* Pharmacy Selection */}
          <div className="section">
            <h3>🏪 {t.selectPharmacy}</h3>
            <div className="pharmacy-grid">
              {pharmacies.map(pharmacy => (
                <div 
                  key={pharmacy.id} 
                  className={`pharmacy-card ${selectedPharmacy?.id === pharmacy.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPharmacy(pharmacy)}
                >
                  <div className="pharmacy-name">🏪 {pharmacy.name}</div>
                  <div className="pharmacy-location">📍 {pharmacy.location}</div>
                  <div className="pharmacy-rating">⭐ {pharmacy.rating}</div>
                  <div className="pharmacy-delivery">🚚 {pharmacy.deliveryTime}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Medicine List */}
          <div className="section">
            <h3>💊 {t.medicineList}</h3>
            <div className="medicine-order-list">
              {prescription.medicines.map((med, idx) => {
                const price = getMedicinePrice(med.name);
                const quantity = medicineQuantities[idx] || 1;
                return (
                  <div key={idx} className="medicine-order-item">
                    <div className="medicine-info">
                      <div className="medicine-name">💊 {med.name}</div>
                      <div className="medicine-dosage">⏰ {med.dosage}</div>
                      <div className="medicine-duration">📅 {med.duration}</div>
                    </div>
                    <div className="medicine-order-controls">
                      <div className="quantity-control">
                        <label>{t.quantity}:</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={quantity}
                          onChange={(e) => handleQuantityChange(idx, e.target.value)}
                        />
                      </div>
                      <div className="price-info">
                        <div className="unit-price">৳{price} {language === 'bn' ? 'প্রতি' : 'each'}</div>
                        <div className="total-price"><strong>৳{price * quantity}</strong></div>
                      </div>
                      <div className="availability">
                        <span className="in-stock">✅ {t.available}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="section">
            <h3>🚚 {t.deliveryInfo}</h3>
            <div className="delivery-form">
              <div className="form-row">
                <label>{t.name}:</label>
                <input 
                  type="text" 
                  value={deliveryInfo.name}
                  onChange={(e) => setDeliveryInfo(prev => ({...prev, name: e.target.value}))}
                />
              </div>
              <div className="form-row">
                <label>{t.phone}:</label>
                <input 
                  type="text" 
                  value={deliveryInfo.phone}
                  onChange={(e) => setDeliveryInfo(prev => ({...prev, phone: e.target.value}))}
                />
              </div>
              <div className="form-row">
                <label>{t.address}:</label>
                <textarea 
                  value={deliveryInfo.address}
                  onChange={(e) => setDeliveryInfo(prev => ({...prev, address: e.target.value}))}
                  rows="2"
                />
              </div>
            </div>

            <div className="delivery-options">
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="delivery" 
                  value="normal" 
                  checked={deliveryType === 'normal'}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
                🚚 {t.normalDelivery} - ৳{selectedPharmacy?.location === 'ঢাকা' ? '50' : '80'}
              </label>
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="delivery" 
                  value="urgent" 
                  checked={deliveryType === 'urgent'}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
                🏃 {t.urgentDelivery} - ৳100
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="section">
            <h3>💳 {t.paymentMethod}</h3>
            <div className="payment-options">
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="payment" 
                  value="cod" 
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                💵 {t.cashOnDelivery}
              </label>
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="payment" 
                  value="bkash" 
                  checked={paymentMethod === 'bkash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                📱 {t.bkash}
              </label>
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="payment" 
                  value="nagad" 
                  checked={paymentMethod === 'nagad'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                📱 {t.nagad}
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="section order-summary">
            <h3>💰 অর্ডার সামারি</h3>
            <div className="summary-row">
              <span>{t.total}:</span>
              <span>৳{calculateTotal()}</span>
            </div>
            <div className="summary-row">
              <span>{t.deliveryCharge}:</span>
              <span>৳{getDeliveryCharge()}</span>
            </div>
            <div className="summary-row total">
              <span><strong>{t.grandTotal}:</strong></span>
              <span><strong>৳{calculateTotal() + getDeliveryCharge()}</strong></span>
            </div>
          </div>
        </div>

        <div className="order-actions">
          <button 
            className="order-btn"
            onClick={handlePlaceOrder}
            disabled={ordering || !selectedPharmacy}
          >
            {ordering ? (
              <>⏳ {t.orderPlacing}</>
            ) : (
              <>🛒 {t.placeOrder}</>
            )}
          </button>
          <button className="cancel-btn" onClick={onClose}>
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MedicineOrder;
