import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

function AdminDashboard({ language = 'bn', onLogout }) {
  const [activeTab, setActiveTab] = useState('farmers');
  const [farmers, setFarmers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  const t = {
    bn: {
      title: 'প্রশাসনিক ড্যাশবোর্ড',
      farmers: 'কৃষকগণ',
      doctors: 'ডাক্তারগণ',
      appointments: 'অ্যাপয়েন্টমেন্টস',
      name: 'নাম',
      phone: 'ফোন',
      email: 'ইমেইল',
      address: 'ঠিকানা',
      farmType: 'খামারের ধরন',
      actions: 'কার্যক্রম',
      edit: 'সম্পাদনা',
      delete: 'মুছুন',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল',
      loading: 'লোড হচ্ছে...',
      confirmDelete: 'আপনি কি নিশ্চিত যে এটি মুছতে চান?',
      deleteSuccess: 'সফলভাবে মুছে ফেলা হয়েছে',
      updateSuccess: 'সফলভাবে আপডেট হয়েছে',
      error: 'একটি ত্রুটি ঘটেছে',
      specialization: 'বিশেষত্ব',
      workplace: 'কর্মস্থল',
      status: 'অবস্থা',
      date: 'তারিখ',
      time: 'সময়',
      problem: 'সমস্যা'
    },
    en: {
      title: 'Admin Dashboard',
      farmers: 'Farmers',
      doctors: 'Doctors',
      appointments: 'Appointments',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      farmType: 'Farm Type',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      confirmDelete: 'Are you sure you want to delete this?',
      deleteSuccess: 'Successfully deleted',
      updateSuccess: 'Successfully updated',
      error: 'An error occurred',
      specialization: 'Specialization',
      workplace: 'Workplace',
      status: 'Status',
      date: 'Date',
      time: 'Time',
      problem: 'Problem'
    }
  }[language];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      let endpoint = '';
      switch (activeTab) {
        case 'farmers':
          endpoint = '/api/farmers';
          break;
        case 'doctors':
          endpoint = '/api/doctors/all';
          break;
        case 'appointments':
          endpoint = '/api/appointments/all';
          break;
        default:
          return;
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, { headers });
      if (response.ok) {
        const data = await response.json();
        switch (activeTab) {
          case 'farmers':
            setFarmers(data);
            break;
          case 'doctors':
            setDoctors(data);
            break;
          case 'appointments':
            setAppointments(data);
            break;
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditForm({ ...item });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      let endpoint = '';
      switch (activeTab) {
        case 'farmers':
          endpoint = `/api/farmers/${editingItem.id}`;
          break;
        case 'doctors':
          endpoint = `/api/doctors/${editingItem.id}`;
          break;
        case 'appointments':
          endpoint = `/api/appointments/${editingItem.id}`;
          break;
        default:
          return;
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        alert(t.updateSuccess);
        setEditingItem(null);
        setEditForm({});
        loadData();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error updating:', error);
      alert(t.error);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(t.confirmDelete)) return;

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      let endpoint = '';
      switch (activeTab) {
        case 'farmers':
          endpoint = `/api/farmers/${item.id}`;
          break;
        case 'doctors':
          endpoint = `/api/doctors/${item.id}`;
          break;
        case 'appointments':
          endpoint = `/api/appointments/${item.id}`;
          break;
        default:
          return;
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        alert(t.deleteSuccess);
        loadData();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert(t.error);
    }
  };

  const renderFarmersTable = () => (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>{t.name}</th>
            <th>{t.phone}</th>
            <th>{t.email}</th>
            <th>{t.address}</th>
            <th>{t.farmType}</th>
            <th>{t.actions}</th>
          </tr>
        </thead>
        <tbody>
          {farmers.map(farmer => (
            <tr key={farmer.id}>
              <td>
                {editingItem && editingItem.id === farmer.id ? (
                  <input 
                    value={editForm.name || ''} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                ) : (
                  farmer.farmer_name || farmer.name
                )}
              </td>
              <td>
                {editingItem && editingItem.id === farmer.id ? (
                  <input 
                    value={editForm.phone || ''} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  />
                ) : (
                  farmer.phone
                )}
              </td>
              <td>
                {editingItem && editingItem.id === farmer.id ? (
                  <input 
                    value={editForm.email || ''} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                ) : (
                  farmer.email || '-'
                )}
              </td>
              <td>
                {editingItem && editingItem.id === farmer.id ? (
                  <input 
                    value={editForm.address || ''} 
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  />
                ) : (
                  farmer.address || '-'
                )}
              </td>
              <td>
                {editingItem && editingItem.id === farmer.id ? (
                  <select 
                    value={editForm.farmType || editForm.farm_type || ''} 
                    onChange={(e) => setEditForm({...editForm, farmType: e.target.value})}
                  >
                    <option value="rice">Rice</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="livestock">Livestock</option>
                    <option value="poultry">Poultry</option>
                    <option value="fish">Fish</option>
                  </select>
                ) : (
                  farmer.farm_type
                )}
              </td>
              <td>
                {editingItem && editingItem.id === farmer.id ? (
                  <>
                    <button onClick={handleSave} className="save-btn">{t.save}</button>
                    <button onClick={() => setEditingItem(null)} className="cancel-btn">{t.cancel}</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(farmer)} className="edit-btn">{t.edit}</button>
                    <button onClick={() => handleDelete(farmer)} className="delete-btn">{t.delete}</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDoctorsTable = () => (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>{t.name}</th>
            <th>{t.phone}</th>
            <th>{t.specialization}</th>
            <th>{t.workplace}</th>
            <th>{t.actions}</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map(doctor => (
            <tr key={doctor.id}>
              <td>
                {editingItem && editingItem.id === doctor.id ? (
                  <input 
                    value={editForm.name || ''} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                ) : (
                  doctor.name
                )}
              </td>
              <td>
                {editingItem && editingItem.id === doctor.id ? (
                  <input 
                    value={editForm.phone || ''} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  />
                ) : (
                  doctor.phone
                )}
              </td>
              <td>
                {editingItem && editingItem.id === doctor.id ? (
                  <select 
                    value={editForm.specialization || ''} 
                    onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
                  >
                    <option value="crop_diseases">Crop Diseases</option>
                    <option value="pest_management">Pest Management</option>
                    <option value="soil_fertility">Soil Fertility</option>
                    <option value="plant_nutrition">Plant Nutrition</option>
                    <option value="livestock_health">Livestock Health</option>
                    <option value="organic_farming">Organic Farming</option>
                  </select>
                ) : (
                  doctor.specialization
                )}
              </td>
              <td>
                {editingItem && editingItem.id === doctor.id ? (
                  <input 
                    value={editForm.workplace || ''} 
                    onChange={(e) => setEditForm({...editForm, workplace: e.target.value})}
                  />
                ) : (
                  doctor.workplace
                )}
              </td>
              <td>
                {editingItem && editingItem.id === doctor.id ? (
                  <>
                    <button onClick={handleSave} className="save-btn">{t.save}</button>
                    <button onClick={() => setEditingItem(null)} className="cancel-btn">{t.cancel}</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(doctor)} className="edit-btn">{t.edit}</button>
                    <button onClick={() => handleDelete(doctor)} className="delete-btn">{t.delete}</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAppointmentsTable = () => (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>Farmer</th>
            <th>Doctor</th>
            <th>{t.date}</th>
            <th>{t.time}</th>
            <th>{t.status}</th>
            <th>{t.problem}</th>
            <th>{t.actions}</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(appointment => (
            <tr key={appointment.id}>
              <td>{appointment.farmer_name}</td>
              <td>{appointment.doctor_name}</td>
              <td>{appointment.appointment_date}</td>
              <td>{appointment.appointment_time}</td>
              <td>
                {editingItem && editingItem.id === appointment.id ? (
                  <select 
                    value={editForm.status || ''} 
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  appointment.status
                )}
              </td>
              <td>{appointment.problem_description}</td>
              <td>
                {editingItem && editingItem.id === appointment.id ? (
                  <>
                    <button onClick={handleSave} className="save-btn">{t.save}</button>
                    <button onClick={() => setEditingItem(null)} className="cancel-btn">{t.cancel}</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(appointment)} className="edit-btn">{t.edit}</button>
                    <button onClick={() => handleDelete(appointment)} className="delete-btn">{t.delete}</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>{t.title}</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>

      <div className="tab-navigation">
        <button 
          className={activeTab === 'farmers' ? 'active' : ''}
          onClick={() => setActiveTab('farmers')}
        >
          {t.farmers}
        </button>
        <button 
          className={activeTab === 'doctors' ? 'active' : ''}
          onClick={() => setActiveTab('doctors')}
        >
          {t.doctors}
        </button>
        <button 
          className={activeTab === 'appointments' ? 'active' : ''}
          onClick={() => setActiveTab('appointments')}
        >
          {t.appointments}
        </button>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading">{t.loading}</div>
        ) : (
          <>
            {activeTab === 'farmers' && renderFarmersTable()}
            {activeTab === 'doctors' && renderDoctorsTable()}
            {activeTab === 'appointments' && renderAppointmentsTable()}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
