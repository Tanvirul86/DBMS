import React, { useState } from 'react';
import './PaymentDashboard.css';

const PaymentDashboard = ({ orderData, onGoBack, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [paymentDetails, setPaymentDetails] = useState({
    mobileNumber: '',
    accountNumber: '',
    transactionId: '',
    password: '',
    cvv: '',
    expiryDate: '',
    cardNumber: ''
  });
  const [processing, setProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const paymentMethods = [
    { id: 'bkash', name: 'বিকাশ (bKash)', icon: '📱', color: '#e2136e' },
    { id: 'rocket', name: 'রকেট (Rocket)', icon: '🚀', color: '#8e44ad' },
    { id: 'nagad', name: 'নগদ (Nagad)', icon: '💳', color: '#f39c12' },
    { id: 'bank', name: 'ব্যাংক ট্রান্সফার', icon: '🏦', color: '#2980b9' },
    { id: 'card', name: 'ক্রেডিট/ডেবিট কার্ড', icon: '💳', color: '#27ae60' },
    { id: 'cod', name: 'ক্যাশ অন ডেলিভারি', icon: '💰', color: '#16a085' }
  ];

  const handlePaymentDetailsChange = (field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePayment = () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setShowConfirmation(true);
      
      // Auto proceed to confirmation after 3 seconds
      setTimeout(() => {
        const paymentInfo = {
          method: paymentMethod,
          transactionId: `TXN${Date.now()}`,
          timestamp: new Date().toISOString(),
          details: paymentDetails
        };
        onPaymentComplete(paymentInfo);
      }, 3000);
    }, 2000);
  };

  const renderPaymentForm = () => {
    switch(paymentMethod) {
      case 'bkash':
      case 'rocket':
      case 'nagad':
        return (
          <div className="payment-form mobile-banking">
            <div className="form-group">
              <label>মোবাইল নম্বর</label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={paymentDetails.mobileNumber}
                onChange={(e) => handlePaymentDetailsChange('mobileNumber', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>পিন/পাসওয়ার্ড</label>
              <input
                type="password"
                placeholder="আপনার পিন নম্বর"
                value={paymentDetails.password}
                onChange={(e) => handlePaymentDetailsChange('password', e.target.value)}
                required
              />
            </div>
          </div>
        );
      
      case 'bank':
        return (
          <div className="payment-form bank-transfer">
            <div className="form-group">
              <label>অ্যাকাউন্ট নম্বর</label>
              <input
                type="text"
                placeholder="আপনার ব্যাংক অ্যাকাউন্ট নম্বর"
                value={paymentDetails.accountNumber}
                onChange={(e) => handlePaymentDetailsChange('accountNumber', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>ট্রান্সঅ্যাকশন পাসওয়ার্ড</label>
              <input
                type="password"
                placeholder="ট্রান্সঅ্যাকশন পাসওয়ার্ড"
                value={paymentDetails.password}
                onChange={(e) => handlePaymentDetailsChange('password', e.target.value)}
                required
              />
            </div>
          </div>
        );
      
      case 'card':
        return (
          <div className="payment-form card-payment">
            <div className="form-group">
              <label>কার্ড নম্বর</label>
              <input
                type="text"
                placeholder="XXXX XXXX XXXX XXXX"
                value={paymentDetails.cardNumber}
                onChange={(e) => handlePaymentDetailsChange('cardNumber', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>মেয়াদ শেষ</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={(e) => handlePaymentDetailsChange('expiryDate', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="XXX"
                  value={paymentDetails.cvv}
                  onChange={(e) => handlePaymentDetailsChange('cvv', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        );
      
      case 'cod':
        return (
          <div className="payment-form cod-info">
            <div className="cod-note">
              <h4>ক্যাশ অন ডেলিভারি</h4>
              <p>ডেলিভারির সময় নগদ অর্থ প্রদান করুন। অর্ডার কনফার্ম করতে এগিয়ে যান।</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (showConfirmation) {
    return (
      <div className="payment-dashboard">
        <div className="payment-confirmation">
          <div className="confirmation-icon">✅</div>
          <h2>পেমেন্ট সফল হয়েছে!</h2>
          <p>আপনার অর্ডার কনফার্ম হচ্ছে...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-dashboard">
      <div className="payment-header">
        <button className="back-btn" onClick={onGoBack}>
          ← ফিরে যান
        </button>
        <h1>পেমেন্ট করুন</h1>
        <p className="subtitle">আপনার অর্ডারের জন্য পেমেন্ট সম্পন্ন করুন</p>
      </div>

      <div className="payment-content">
        {/* Order Summary */}
        <div className="payment-order-summary">
          <h3>অর্ডার সারাংশ</h3>
          <div className="summary-card">
            <div className="shop-info">
              <h4>{orderData.shop.name}</h4>
              <p>{orderData.shop.address}</p>
            </div>
            
            <div className="medicines-summary">
              {orderData.medicines.map((med, index) => (
                <div key={index} className="medicine-summary-item">
                  <span className="med-name">{med.name}</span>
                  <span className="med-quantity">Qty: {med.quantity}</span>
                  <span className="med-price">৳{med.totalPrice}</span>
                </div>
              ))}
            </div>
            
            <div className="total-summary">
              <div className="summary-row">
                <span>মোট দাম:</span>
                <span>৳{orderData.subtotal}</span>
              </div>
              <div className="summary-row">
                <span>ডেলিভারি চার্জ:</span>
                <span>৳{orderData.deliveryCharge}</span>
              </div>
              <div className="summary-row total">
                <span>সর্বমোট:</span>
                <span>৳{orderData.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods-section">
          <h3>পেমেন্ট পদ্ধতি নির্বাচন করুন</h3>
          <div className="payment-methods">
            {paymentMethods.map(method => (
              <div 
                key={method.id}
                className={`payment-method ${paymentMethod === method.id ? 'selected' : ''}`}
                onClick={() => setPaymentMethod(method.id)}
                style={{ borderColor: paymentMethod === method.id ? method.color : '#e9ecef' }}
              >
                <div className="method-icon" style={{ color: method.color }}>
                  {method.icon}
                </div>
                <span className="method-name">{method.name}</span>
                {paymentMethod === method.id && (
                  <div className="selected-indicator">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        <div className="payment-form-section">
          <h3>পেমেন্ট তথ্য</h3>
          {renderPaymentForm()}
        </div>

        {/* Payment Actions */}
        <div className="payment-actions">
          <button 
            className="pay-now-btn"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <div className="spinner"></div>
                প্রক্রিয়াকরণ...
              </>
            ) : (
              `৳${orderData.total} টাকা পেমেন্ট করুন`
            )}
          </button>
          
          <div className="security-info">
            <p>🔒 আপনার পেমেন্ট সুরক্ষিত ও এনক্রিপ্টেড</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;
