 import React, { useState, useEffect } from 'react';
import './OrderConfirmation.css';

const OrderConfirmation = ({ orderData, paymentData, onGoBackToDashboard }) => {
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [orderStatus] = useState('confirmed');

  useEffect(() => {
    // Calculate estimated delivery date (3-5 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 3) + 3);
    setEstimatedDelivery(deliveryDate.toLocaleDateString('bn-BD', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));

    // Save order to localStorage
    const orderRecord = {
      id: `GK${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'confirmed',
      shop: orderData.shop,
      medicines: orderData.medicines,
      payment: paymentData,
      total: orderData.total,
      deliveryDate: deliveryDate.toISOString(),
      prescription: orderData.prescription
    };

    const existingOrders = JSON.parse(localStorage.getItem('medicineOrders') || '[]');
    existingOrders.push(orderRecord);
    localStorage.setItem('medicineOrders', JSON.stringify(existingOrders));

  }, [orderData, paymentData]);

  const getStatusIcon = () => {
    switch(orderStatus) {
      case 'confirmed': return '✅';
      case 'processing': return '⏳';
      case 'shipped': return '🚛';
      case 'delivered': return '📦';
      default: return '✅';
    }
  };

  const getStatusText = () => {
    switch(orderStatus) {
      case 'confirmed': return 'অর্ডার কনফার্ম হয়েছে';
      case 'processing': return 'প্রক্রিয়াকরণ চলছে';
      case 'shipped': return 'পাঠানো হয়েছে';
      case 'delivered': return 'ডেলিভার হয়েছে';
      default: return 'অর্ডার কনফার্ম হয়েছে';
    }
  };

  const downloadOrderReceipt = () => {
    const receiptContent = `
গ্রামীণ কৃষি অর্ডার রসিদ
========================

অর্ডার আইডি: GK${Date.now()}
তারিখ: ${new Date().toLocaleDateString('bn-BD')}
সময়: ${new Date().toLocaleTimeString('bn-BD')}

দোকানের তথ্য:
${orderData.shop.name}
${orderData.shop.address}
ফোন: ${orderData.shop.phone}

ওষুধের তালিকা:
${orderData.medicines.map(med => `${med.name} - ${med.quantity} টি - ৳${med.totalPrice}`).join('\n')}

পেমেন্ট তথ্য:
পদ্ধতি: ${paymentData.method}
ট্রান্সঅ্যাকশন আইডি: ${paymentData.transactionId}

মোট দাম: ৳${orderData.total}
আনুমানিক ডেলিভারি: ${estimatedDelivery}

ধন্যবাদ!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grameen-krishi-order-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="order-confirmation">
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">
            {getStatusIcon()}
          </div>
          <h1>অর্ডার সম্পন্ন!</h1>
          <p className="success-message">
            আপনার ওষুধের অর্ডার সফলভাবে সম্পন্ন হয়েছে
          </p>
        </div>

        {/* Order Details */}
        <div className="order-details-section">
          <div className="order-info-card">
            <h3>অর্ডার তথ্য</h3>
            <div className="order-info-grid">
              <div className="info-item">
                <span className="label">অর্ডার আইডি:</span>
                <span className="value">GK{Date.now()}</span>
              </div>
              <div className="info-item">
                <span className="label">অর্ডারের তারিখ:</span>
                <span className="value">{new Date().toLocaleDateString('bn-BD')}</span>
              </div>
              <div className="info-item">
                <span className="label">স্ট্যাটাস:</span>
                <span className="value status">{getStatusText()}</span>
              </div>
              <div className="info-item">
                <span className="label">আনুমানিক ডেলিভারি:</span>
                <span className="value delivery">{estimatedDelivery}</span>
              </div>
            </div>
          </div>

          {/* Shop Information */}
          <div className="shop-info-card">
            <h3>দোকানের তথ্য</h3>
            <div className="shop-details">
              <div className="shop-header">
                <div className="shop-icon">🏪</div>
                <div>
                  <h4>{orderData.shop.name}</h4>
                  <p>{orderData.shop.address}</p>
                  <p>📞 {orderData.shop.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medicine List */}
          <div className="medicines-list-card">
            <h3>অর্ডারকৃত ওষুধ</h3>
            <div className="medicines-list">
              {orderData.medicines.map((medicine, index) => (
                <div key={index} className="medicine-item">
                  <div className="medicine-info">
                    <h4>{medicine.name}</h4>
                    <p>{medicine.dosage}</p>
                  </div>
                  <div className="medicine-quantity">
                    <span>পরিমাণ: {medicine.quantity}</span>
                  </div>
                  <div className="medicine-price">
                    <span>৳{medicine.totalPrice}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="medicines-total">
              <strong>মোট: ৳{orderData.total}</strong>
            </div>
          </div>

          {/* Payment Information */}
          <div className="payment-info-card">
            <h3>পেমেন্ট তথ্য</h3>
            <div className="payment-details">
              <div className="payment-item">
                <span className="label">পেমেন্ট পদ্ধতি:</span>
                <span className="value">{paymentData.method}</span>
              </div>
              <div className="payment-item">
                <span className="label">ট্রান্সঅ্যাকশন আইডি:</span>
                <span className="value">{paymentData.transactionId}</span>
              </div>
              <div className="payment-item">
                <span className="label">পেমেন্ট সময়:</span>
                <span className="value">{new Date(paymentData.timestamp).toLocaleString('bn-BD')}</span>
              </div>
              <div className="payment-item total">
                <span className="label">মোট পেমেন্ট:</span>
                <span className="value">৳{orderData.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="download-btn" onClick={downloadOrderReceipt}>
            📄 রসিদ ডাউনলোড করুন
          </button>
          <button className="track-order-btn">
            📍 অর্ডার ট্র্যাক করুন
          </button>
          <button className="dashboard-btn" onClick={onGoBackToDashboard}>
            🏠 ড্যাশবোর্ডে ফিরে যান
          </button>
        </div>

        {/* Additional Information */}
        <div className="additional-info">
          <div className="info-card">
            <h4>গুরুত্বপূর্ণ তথ্য</h4>
            <ul>
              <li>আপনার অর্ডার {estimatedDelivery} তারিখের মধ্যে পৌঁছাবে</li>
              <li>ডেলিভারির সময় অবশ্যই প্রেসক্রিপশন দেখাতে হবে</li>
              <li>কোনো সমস্যা হলে দোকানের সাথে যোগাযোগ করুন</li>
              <li>ওষুধ রিটার্নের জন্য ৭ দিনের গ্যারান্টি রয়েছে</li>
            </ul>
          </div>

          <div className="support-card">
            <h4>সহায়তার জন্য যোগাযোগ</h4>
            <p>📞 কাস্টমার কেয়ার: ১৬২৬৩</p>
            <p>📧 ইমেইল: support@grameenkrishi.com</p>
            <p>🕐 সেবার সময়: সকাল ৯টা - রাত ৯টা</p>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="thank-you-message">
          <h3>ধন্যবাদ!</h3>
          <p>গ্রামীণ কৃষির সাথে থাকার জন্য আপনাকে ধন্যবাদ। আপনার স্বাস্থ্য আমাদের অগ্রাধিকার।</p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
