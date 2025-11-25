import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { appointmentsAPI, prescriptionsAPI, medicationsAPI } from './api';

function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingPrescription, setEditingPrescription] = useState(null);

  const [prescriptionForm, setPrescriptionForm] = useState({
    patient_id: '',
    appointment_id: '',
    medication_id: '',
    dosage_instructions: '',
    start_date: '',
    end_date: '',
    refill_count: 0
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (activeTab === 'appointments') {
      loadAppointments();
    } else if (activeTab === 'prescriptions') {
      loadPrescriptions();
    }
    loadMedications();
  }, [activeTab]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentsAPI.getAll();
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadPrescriptions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await prescriptionsAPI.getAll();
      if (response.data.success) {
        setPrescriptions(response.data.data);
      } else {
        setError('Failed to load prescriptions');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const loadMedications = async () => {
    try {
      const response = await medicationsAPI.getAll();
      if (response.data.success) {
        setMedications(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load medications');
    }
  };

  const handleAddPrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setEditingPrescription(null);
    setPrescriptionForm({
      patient_id: appointment.patient_id,
      appointment_id: appointment.appointment_id,
      medication_id: '',
      dosage_instructions: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      refill_count: 0
    });
    setShowPrescriptionForm(true);
  };

  const handleEditPrescription = (prescription) => {
    setEditingPrescription(prescription);
    setSelectedAppointment(null);
    setPrescriptionForm({
      medication_id: prescription.medication_id,
      dosage_instructions: prescription.dosage_instructions,
      start_date: prescription.start_date?.split('T')[0] || '',
      end_date: prescription.end_date?.split('T')[0] || '',
      refill_count: prescription.refill_count || 0
    });
    setShowPrescriptionForm(true);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingPrescription) {
        const response = await prescriptionsAPI.update(editingPrescription.prescription_id, prescriptionForm);
        if (response.data.success) {
          setSuccess('Prescription updated successfully');
          resetPrescriptionForm();
          loadPrescriptions();
        }
      } else {
        const response = await prescriptionsAPI.create(prescriptionForm);
        if (response.data.success) {
          setSuccess('Prescription added successfully');
          resetPrescriptionForm();
          loadPrescriptions();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };


  const resetPrescriptionForm = () => {
    setPrescriptionForm({
      patient_id: '',
      appointment_id: '',
      medication_id: '',
      dosage_instructions: '',
      start_date: '',
      end_date: '',
      refill_count: 0
    });
    setSelectedAppointment(null);
    setEditingPrescription(null);
    setShowPrescriptionForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h2 style={styles.navTitle}>EMR System - Doctor Portal</h2>
        <div>
          <span style={styles.username}>Welcome, Dr. {user.doctor_name || user.username}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('appointments')}
          style={activeTab === 'appointments' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
        >
          My Appointments
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          style={activeTab === 'prescriptions' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
        >
          Manage Prescriptions
        </button>
      </div>

      <div style={styles.content}>
        {error && <div style={styles.errorMsg}>{error}</div>}
        {success && <div style={styles.successMsg}>{success}</div>}

        {activeTab === 'appointments' && (
          <div>
            <div style={styles.header}>
              <h3 style={styles.tabContent}>My Appointments</h3>
            </div>

            {showPrescriptionForm && selectedAppointment && (
              <div style={styles.formCard}>
                <h4>Add Prescription for {selectedAppointment.patient_name}</h4>
                <p style={styles.appointmentInfo}>
                  Appointment: {new Date(selectedAppointment.appointment_date).toLocaleDateString()} - {selectedAppointment.reason_for_visit}
                </p>
                <form onSubmit={handlePrescriptionSubmit}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Medication *</label>
                    <Select
                      value={medications.find(m => m.medication_id === prescriptionForm.medication_id) ? {
                        value: prescriptionForm.medication_id,
                        label: `${medications.find(m => m.medication_id === prescriptionForm.medication_id)?.medication_name} - ${medications.find(m => m.medication_id === prescriptionForm.medication_id)?.dosage_form} (${medications.find(m => m.medication_id === prescriptionForm.medication_id)?.strength})`
                      } : null}
                      onChange={(option) => setPrescriptionForm({ ...prescriptionForm, medication_id: option?.value || '' })}
                      options={medications.map(med => ({
                        value: med.medication_id,
                        label: `${med.medication_name} - ${med.dosage_form} (${med.strength})`
                      }))}
                      placeholder="Type to search medication..."
                      isClearable
                      isSearchable
                      styles={selectStyles}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Dosage Instructions *</label>
                    <textarea
                      value={prescriptionForm.dosage_instructions}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage_instructions: e.target.value })}
                      style={{ ...styles.input, minHeight: '80px' }}
                      placeholder="e.g., Take 1 tablet twice daily with food"
                      required
                    />
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Start Date *</label>
                      <input
                        type="date"
                        value={prescriptionForm.start_date}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, start_date: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>End Date</label>
                      <input
                        type="date"
                        value={prescriptionForm.end_date}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, end_date: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Refill Count</label>
                    <input
                      type="number"
                      min="0"
                      value={prescriptionForm.refill_count}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, refill_count: parseInt(e.target.value) || 0 })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formActions}>
                    <button type="submit" style={styles.primaryBtn} disabled={loading}>
                      Add Prescription
                    </button>
                    <button type="button" onClick={resetPrescriptionForm} style={styles.secondaryBtn}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Patient</th>
                    <th style={styles.th}>Date & Time</th>
                    <th style={styles.th}>Reason for Visit</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={styles.td}>Loading...</td></tr>
                  ) : appointments.length === 0 ? (
                    <tr><td colSpan="6" style={styles.td}>No appointments found</td></tr>
                  ) : (
                    appointments.map(apt => (
                      <tr key={apt.appointment_id}>
                        <td style={styles.td}>{apt.appointment_id}</td>
                        <td style={styles.td}>{apt.patient_name}</td>
                        <td style={styles.td}>{new Date(apt.appointment_date).toLocaleString()}</td>
                        <td style={styles.td}>{apt.reason_for_visit}</td>
                        <td style={styles.td}>{apt.status}</td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleAddPrescription(apt)}
                            style={styles.prescribeBtn}
                          >
                            Add Prescription
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div>
            <div style={styles.header}>
              <h3 style={styles.tabContent}>My Prescriptions</h3>
            </div>

            {showPrescriptionForm && editingPrescription && (
              <div style={styles.formCard}>
                <h4>Edit Prescription</h4>
                <p style={styles.appointmentInfo}>
                  Patient: {editingPrescription.patient_name} | Current Medication: {editingPrescription.medication_name}
                </p>
                <form onSubmit={handlePrescriptionSubmit}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Medication *</label>
                    <Select
                      value={medications.find(m => m.medication_id === prescriptionForm.medication_id) ? {
                        value: prescriptionForm.medication_id,
                        label: `${medications.find(m => m.medication_id === prescriptionForm.medication_id)?.medication_name} - ${medications.find(m => m.medication_id === prescriptionForm.medication_id)?.dosage_form} (${medications.find(m => m.medication_id === prescriptionForm.medication_id)?.strength})`
                      } : null}
                      onChange={(option) => setPrescriptionForm({ ...prescriptionForm, medication_id: option?.value || '' })}
                      options={medications.map(med => ({
                        value: med.medication_id,
                        label: `${med.medication_name} - ${med.dosage_form} (${med.strength})`
                      }))}
                      placeholder="Type to search medication..."
                      isClearable
                      isSearchable
                      styles={selectStyles}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Dosage Instructions *</label>
                    <textarea
                      value={prescriptionForm.dosage_instructions}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage_instructions: e.target.value })}
                      style={{ ...styles.input, minHeight: '80px' }}
                      placeholder="e.g., Take 1 tablet twice daily with food"
                      required
                    />
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Start Date *</label>
                      <input
                        type="date"
                        value={prescriptionForm.start_date}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, start_date: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>End Date</label>
                      <input
                        type="date"
                        value={prescriptionForm.end_date}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, end_date: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Refill Count</label>
                    <input
                      type="number"
                      min="0"
                      value={prescriptionForm.refill_count}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, refill_count: parseInt(e.target.value) || 0 })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formActions}>
                    <button type="submit" style={styles.primaryBtn} disabled={loading}>
                      Update Prescription
                    </button>
                    <button type="button" onClick={resetPrescriptionForm} style={styles.secondaryBtn}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Patient</th>
                    <th style={styles.th}>Medication</th>
                    <th style={styles.th}>Dosage</th>
                    <th style={styles.th}>Start Date</th>
                    <th style={styles.th}>End Date</th>
                    <th style={styles.th}>Refills</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" style={styles.td}>Loading...</td></tr>
                  ) : prescriptions.length === 0 ? (
                    <tr><td colSpan="8" style={styles.td}>No prescriptions found</td></tr>
                  ) : (
                    prescriptions.map(rx => (
                      <tr key={rx.prescription_id}>
                        <td style={styles.td}>{rx.prescription_id}</td>
                        <td style={styles.td}>{rx.patient_name}</td>
                        <td style={styles.td}>{rx.medication_name}</td>
                        <td style={styles.td}>{rx.dosage_instructions}</td>
                        <td style={styles.td}>{rx.start_date?.split('T')[0]}</td>
                        <td style={styles.td}>{rx.end_date?.split('T')[0] || 'N/A'}</td>
                        <td style={styles.td}>{rx.refill_count}</td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleEditPrescription(rx)}
                            style={styles.editBtn}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    animation: 'fadeIn 0.6s ease-out'
  },
  navbar: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
  },
  navTitle: {
    fontSize: '24px',
    fontWeight: '800',
    margin: 0,
    color: '#374151'
  },
  username: {
    marginRight: '20px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '15px'
  },
  logoutBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tabs: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '0 40px',
    display: 'flex',
    gap: '15px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
  },
  tab: {
    padding: '18px 30px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '15px',
    color: '#6b7280',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tabContent: {
    color: 'white'
  },
  activeTab: {
    borderBottomColor: '#667eea',
    color: '#667eea',
    fontWeight: '700',
    background: 'linear-gradient(to bottom, rgba(102, 126, 234, 0.05), transparent)'
  },
  content: {
    padding: '40px',
    animation: 'slideIn 0.4s ease-out'
  },
  header: {
    marginBottom: '30px'
  },
  formCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '35px',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    marginBottom: '30px',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    animation: 'fadeIn 0.5s ease-out'
  },
  appointmentInfo: {
    padding: '16px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    borderRadius: '12px',
    marginBottom: '25px',
    color: '#667eea',
    fontWeight: '500',
    border: '1px solid rgba(102, 126, 234, 0.2)'
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px'
  },
  formGroup: {
    flex: 1,
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#374151',
    fontWeight: '600',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    backgroundColor: '#f9fafb',
    outline: 'none'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '25px'
  },
  primaryBtn: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  secondaryBtn: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  prescribeBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  editBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  tableContainer: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    overflowX: 'auto',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    animation: 'fadeIn 0.5s ease-out'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '20px 18px',
    textAlign: 'left',
    borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    fontWeight: '700',
    color: '#374151',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  td: {
    padding: '16px 18px',
    borderBottom: '1px solid #e5e7eb',
    color: '#4b5563',
    fontSize: '14px',
    transition: 'background-color 0.2s ease'
  },
  errorMsg: {
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: '12px',
    marginBottom: '25px',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.1)',
    fontSize: '14px'
  },
  successMsg: {
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    color: '#059669',
    border: '1px solid #6ee7b7',
    borderRadius: '12px',
    marginBottom: '25px',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(5, 150, 105, 0.1)',
    fontSize: '14px'
  }
};

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    padding: '6px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    backgroundColor: '#f9fafb',
    borderColor: state.isFocused ? '#667eea' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 4px rgba(102, 126, 234, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#667eea'
    }
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e5e7eb',
    zIndex: 9999
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#667eea' : state.isFocused ? '#f3f4f6' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    padding: '12px 16px',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#667eea'
    }
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9ca3af'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#374151'
  })
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  input:focus, select:focus, textarea:focus {
    border-color: #667eea !important;
    background-color: white !important;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5) !important;
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }

  tbody tr:hover td {
    background-color: rgba(102, 126, 234, 0.05);
  }
`;
document.head.appendChild(styleSheet);

export default DoctorDashboard;
