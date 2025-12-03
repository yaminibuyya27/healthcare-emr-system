import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { patientsAPI, appointmentsAPI, doctorsAPI } from './api';

function ReceptionistDashboard() {
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingPatient, setEditingPatient] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [originalPatientData, setOriginalPatientData] = useState(null);
  const [originalAppointmentData, setOriginalAppointmentData] = useState(null);

  const [patientForm, setPatientForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    email_address: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: ''
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    reason_for_visit: '',
    status: 'Scheduled'
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (activeTab === 'patients') {
      loadPatients();
    } else if (activeTab === 'appointments') {
      loadAppointments();
      loadDoctors();
    }
  }, [activeTab]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await patientsAPI.getAll();
      if (response.data.success) {
        setPatients(response.data.data);
      }
    } catch (err) {
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

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

  const loadDoctors = async () => {
    try {
      const response = await doctorsAPI.getAll();
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load doctors');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPatients();
      return;
    }
    setLoading(true);
    try {
      const response = await patientsAPI.search(searchQuery);
      if (response.data.success) {
        setPatients(response.data.data);
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingPatient) {
        const response = await patientsAPI.update(editingPatient.patient_id, patientForm);
        if (response.data.success) {
          setSuccess('Patient updated successfully');
          resetPatientForm();
          loadPatients();
        } else {
          setError(response.data.message || 'Failed to update patient');
        }
      } else {
        const response = await patientsAPI.create(patientForm);
        if (response.data.success) {
          setSuccess('Patient added successfully');
          resetPatientForm();
          loadPatients();
        } else {
          setError(response.data.message || 'Failed to add patient');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingAppointment) {
        const response = await appointmentsAPI.update(editingAppointment.appointment_id, appointmentForm);
        if (response.data.success) {
          setSuccess('Appointment updated successfully');
          resetAppointmentForm();
          loadAppointments();
        } else {
          setError(response.data.message || 'Failed to update appointment');
        }
      } else {
        const response = await appointmentsAPI.create(appointmentForm);
        if (response.data.success) {
          setSuccess('Appointment scheduled successfully');
          resetAppointmentForm();
          loadAppointments();
        } else {
          setError(response.data.message || 'Failed to schedule appointment');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  const hasPatientFormChanged = () => {
    if (!editingPatient || !originalPatientData) return true;

    return (
      patientForm.first_name !== originalPatientData.first_name ||
      patientForm.last_name !== originalPatientData.last_name ||
      patientForm.date_of_birth !== originalPatientData.date_of_birth ||
      patientForm.gender !== originalPatientData.gender ||
      patientForm.phone_number !== originalPatientData.phone_number ||
      patientForm.email_address !== originalPatientData.email_address ||
      patientForm.street_address !== originalPatientData.street_address ||
      patientForm.city !== originalPatientData.city ||
      patientForm.state !== originalPatientData.state ||
      patientForm.postal_code !== originalPatientData.postal_code
    );
  };

  const isAddPatientFormValid = () => {
    return (
      patientForm.first_name.trim() !== '' &&
      patientForm.last_name.trim() !== '' &&
      patientForm.date_of_birth !== '' &&
      patientForm.gender !== '' &&
      patientForm.phone_number.trim() !== ''
    );
  };

  const isAddAppointmentFormValid = () => {
    return (
      appointmentForm.patient_id !== '' &&
      appointmentForm.doctor_id !== '' &&
      appointmentForm.appointment_date !== '' &&
      appointmentForm.reason_for_visit.trim() !== ''
    );
  };

  const hasAppointmentFormChanged = () => {
    if (!editingAppointment || !originalAppointmentData) return true;
    return (
      appointmentForm.patient_id !== originalAppointmentData.patient_id ||
      appointmentForm.doctor_id !== originalAppointmentData.doctor_id ||
      appointmentForm.appointment_date !== originalAppointmentData.appointment_date ||
      appointmentForm.reason_for_visit !== originalAppointmentData.reason_for_visit ||
      appointmentForm.status !== originalAppointmentData.status
    );
  };

  const resetPatientForm = () => {
    setPatientForm({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      phone_number: '',
      email_address: '',
      street_address: '',
      city: '',
      state: '',
      postal_code: ''
    });
    setEditingPatient(null);
    setOriginalPatientData(null);
    setShowPatientForm(false);
  };

  const resetAppointmentForm = () => {
    setAppointmentForm({
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      reason_for_visit: '',
      status: 'Scheduled'
    });
    setEditingAppointment(null);
    setOriginalAppointmentData(null);
    setShowAppointmentForm(false);
  };

  const editAppointment = (appointment) => {
    setEditingAppointment(appointment);
    loadPatients();
    const formData = {
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      appointment_date: appointment.appointment_date?.split('.')[0] || '',
      reason_for_visit: appointment.reason_for_visit,
      status: appointment.status || 'Scheduled'
    };
    setAppointmentForm(formData);
    setOriginalAppointmentData(formData);
    setShowAppointmentForm(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await appointmentsAPI.delete(appointmentId);
      if (response.data.success) {
        setSuccess('Appointment deleted successfully');
        loadAppointments();
      } else {
        setError(response.data.message || 'Failed to delete appointment');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete appointment');
    } finally {
      setLoading(false);
    }
  };

  const editPatient = (patient) => {
    setEditingPatient(patient);
    const formData = {
      first_name: patient.first_name,
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth?.split('T')[0] || '',
      gender: patient.gender,
      phone_number: patient.phone_number,
      email_address: patient.email_address,
      street_address: patient.street_address || '',
      city: patient.city || '',
      state: patient.state || '',
      postal_code: patient.postal_code || ''
    };
    setPatientForm(formData);
    setOriginalPatientData(formData);
    setShowPatientForm(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h2 style={styles.navTitle}>EMR System - Receptionist</h2>
        <div style={styles.navRight}>
          <span style={styles.username}>Welcome, {user.username}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('patients')}
          style={activeTab === 'patients' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
        >
          Manage Patients
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          style={activeTab === 'appointments' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
        >
          Appointments
        </button>
      </div>

      <div style={styles.content}>
        {error && <div style={styles.errorMsg}>{error}</div>}
        {success && <div style={styles.successMsg}>{success}</div>}

        {activeTab === 'patients' && (
          <div>
            <div style={styles.header}>
              <h3 style={styles.tabContent}>Patient Management</h3>
              <button onClick={() => {
                if (showPatientForm) {
                  resetPatientForm();
                } else {
                  resetPatientForm();
                  setShowPatientForm(true);
                }
              }} style={styles.primaryBtn}>
                {showPatientForm ? 'Cancel' : 'Add New Patient'}
              </button>
            </div>

            {showPatientForm && (
              <div style={styles.formCard}>
                <h4>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h4>
                <form onSubmit={handlePatientSubmit}>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>First Name *</label>
                      <input
                        type="text"
                        value={patientForm.first_name}
                        onChange={(e) => setPatientForm({ ...patientForm, first_name: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Last Name *</label>
                      <input
                        type="text"
                        value={patientForm.last_name}
                        onChange={(e) => setPatientForm({ ...patientForm, last_name: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Date of Birth *</label>
                      <input
                        type="date"
                        value={patientForm.date_of_birth}
                        onChange={(e) => setPatientForm({ ...patientForm, date_of_birth: e.target.value })}
                        style={styles.input}
                        max={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Gender *</label>
                      <select
                        value={patientForm.gender}
                        onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                        style={styles.input}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Phone Number *</label>
                      <input
                        type="tel"
                        value={patientForm.phone_number}
                        onChange={(e) => setPatientForm({ ...patientForm, phone_number: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Email</label>
                      <input
                        type="email"
                        value={patientForm.email_address}
                        onChange={(e) => setPatientForm({ ...patientForm, email_address: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Street Address</label>
                    <input
                      type="text"
                      value={patientForm.street_address}
                      onChange={(e) => setPatientForm({ ...patientForm, street_address: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>City</label>
                      <input
                        type="text"
                        value={patientForm.city}
                        onChange={(e) => setPatientForm({ ...patientForm, city: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>State</label>
                      <input
                        type="text"
                        value={patientForm.state}
                        onChange={(e) => setPatientForm({ ...patientForm, state: e.target.value })}
                        style={styles.input}
                        maxLength="2"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Postal Code</label>
                      <input
                        type="text"
                        value={patientForm.postal_code}
                        onChange={(e) => setPatientForm({ ...patientForm, postal_code: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  <div style={styles.formActions}>
                    <button
                      type="submit"
                      style={styles.primaryBtn}
                      disabled={loading || (editingPatient ? !hasPatientFormChanged() : !isAddPatientFormValid())}
                    >
                      {editingPatient ? 'Update Patient' : 'Add Patient'}
                    </button>
                    <button type="button" onClick={resetPatientForm} style={styles.secondaryBtn}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={styles.searchBar}>
              <input
                type="text"
                placeholder="Search patients by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={styles.searchInput}
              />
              <button onClick={handleSearch} style={styles.searchBtn}>Search</button>
              <button onClick={() => { setSearchQuery(''); loadPatients(); }} style={styles.secondaryBtn}>Clear</button>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>DOB</th>
                    <th style={styles.th}>Gender</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>City</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" style={styles.td}>Loading...</td></tr>
                  ) : patients.length === 0 ? (
                    <tr><td colSpan="8" style={styles.td}>No patients found</td></tr>
                  ) : (
                    patients.map(patient => (
                      <tr key={patient.patient_id}>
                        <td style={styles.td}>{patient.patient_id}</td>
                        <td style={styles.td}>{patient.first_name} {patient.last_name}</td>
                        <td style={styles.td}>{patient.date_of_birth?.split('T')[0]}</td>
                        <td style={styles.td}>{patient.gender}</td>
                        <td style={styles.td}>{patient.phone_number}</td>
                        <td style={styles.td}>{patient.email_address}</td>
                        <td style={styles.td}>{patient.city || '-'}</td>
                        <td style={styles.td}>
                          <button onClick={() => editPatient(patient)} style={styles.editBtn}>
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

        {activeTab === 'appointments' && (
          <div>
            <div style={styles.header}>
              <h3 style={styles.tabContent}>Appointments</h3>
              <button onClick={() => {
                if (showAppointmentForm) {
                  resetAppointmentForm();
                } else {
                  resetAppointmentForm();
                  setShowAppointmentForm(true);
                }
              }} style={styles.primaryBtn}>
                {showAppointmentForm ? 'Cancel' : 'Schedule New Appointment'}
              </button>
            </div>

            {showAppointmentForm && (
              <div style={styles.formCard}>
                <h4>{editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}</h4>
                <form onSubmit={handleAppointmentSubmit}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Patient *</label>
                    <Select
                      value={patients.find(p => p.patient_id === appointmentForm.patient_id) ? {
                        value: appointmentForm.patient_id,
                        label: `${patients.find(p => p.patient_id === appointmentForm.patient_id)?.first_name} ${patients.find(p => p.patient_id === appointmentForm.patient_id)?.last_name}`
                      } : null}
                      onChange={(option) => setAppointmentForm({ ...appointmentForm, patient_id: option?.value || '' })}
                      options={patients.map(p => ({
                        value: p.patient_id,
                        label: `${p.first_name} ${p.last_name}`
                      }))}
                      placeholder="Type to search patient..."
                      isClearable
                      isSearchable
                      styles={selectStyles}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Doctor *</label>
                    <Select
                      value={doctors.find(d => d.doctor_id === appointmentForm.doctor_id) ? {
                        value: appointmentForm.doctor_id,
                        label: `Dr. ${doctors.find(d => d.doctor_id === appointmentForm.doctor_id)?.first_name} ${doctors.find(d => d.doctor_id === appointmentForm.doctor_id)?.last_name} - ${doctors.find(d => d.doctor_id === appointmentForm.doctor_id)?.specialty}`
                      } : null}
                      onChange={(option) => setAppointmentForm({ ...appointmentForm, doctor_id: option?.value || '' })}
                      options={doctors.map(d => ({
                        value: d.doctor_id,
                        label: `Dr. ${d.first_name} ${d.last_name} - ${d.specialty}`
                      }))}
                      placeholder="Type to search doctor..."
                      isClearable
                      isSearchable
                      styles={selectStyles}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Appointment Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={appointmentForm.appointment_date}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_date: e.target.value })}
                      style={styles.input}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Reason for Visit *</label>
                    <textarea
                      value={appointmentForm.reason_for_visit}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, reason_for_visit: e.target.value })}
                      style={{ ...styles.input, minHeight: '80px' }}
                      required
                    />
                  </div>
                  {editingAppointment && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Status *</label>
                      <select
                        value={appointmentForm.status}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, status: e.target.value })}
                        style={styles.input}
                        required
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No-Show">No-Show</option>
                      </select>
                    </div>
                  )}
                  <div style={styles.formActions}>
                    <button
                      type="submit"
                      style={styles.primaryBtn}
                      disabled={loading || (editingAppointment ? !hasAppointmentFormChanged() : !isAddAppointmentFormValid())}
                    >
                      {editingAppointment ? 'Update Appointment' : 'Schedule Appointment'}
                    </button>
                    <button type="button" onClick={resetAppointmentForm} style={styles.secondaryBtn}>
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
                    <th style={styles.th}>Doctor</th>
                    <th style={styles.th}>Specialty</th>
                    <th style={styles.th}>Date & Time</th>
                    <th style={styles.th}>Reason</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" style={styles.td}>Loading...</td></tr>
                  ) : appointments.length === 0 ? (
                    <tr><td colSpan="8" style={styles.td}>No appointments found</td></tr>
                  ) : (
                    appointments.map(apt => (
                      <tr key={apt.appointment_id}>
                        <td style={styles.td}>{apt.appointment_id}</td>
                        <td style={styles.td}>{apt.patient_name}</td>
                        <td style={styles.td}>{apt.doctor_name}</td>
                        <td style={styles.td}>{apt.specialty}</td>
                        <td style={styles.td}>{new Date(apt.appointment_date).toLocaleString()}</td>
                        <td style={styles.td}>{apt.reason_for_visit}</td>
                        <td style={styles.td}>{apt.status}</td>
                        <td style={styles.td}>
                          <button onClick={() => editAppointment(apt)} style={styles.editBtn}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteAppointment(apt.appointment_id)} style={styles.deleteBtn}>
                            Delete
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
    paddingBottom: '40px'
  },
  navbar: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(10px)',
    flexWrap: 'nowrap',
    gap: '20px'
  },
  navTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    whiteSpace: 'nowrap',
    color: 'white'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'nowrap',
    flexShrink: 0
  },
  username: {
    fontSize: '15px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  logoutBtn: {
    padding: '10px 24px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  },
  tabs: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '0 40px',
    display: 'flex',
    gap: '5px',
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
    position: 'relative'
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
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },
  formCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '25px',
    border: '1px solid rgba(102, 126, 234, 0.1)',
    animation: 'fadeIn 0.4s ease-out'
  },
  formRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px'
  },
  formGroup: {
    flex: 1,
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#555',
    fontWeight: '500',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    backgroundColor: '#f9fafb',
    fontFamily: 'Inter, sans-serif'
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  searchBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  searchInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  primaryBtn: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  secondaryBtn: {
    padding: '12px 28px',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  searchBtn: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
    transition: 'all 0.3s ease'
  },
  editBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '8px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
    transition: 'all 0.3s ease'
  },
  deleteBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
    transition: 'all 0.3s ease'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    overflowX: 'auto',
    border: '1px solid rgba(102, 126, 234, 0.1)',
    animation: 'fadeIn 0.5s ease-out'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '18px 20px',
    textAlign: 'left',
    borderBottom: '2px solid #e5e7eb',
    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
    fontWeight: '700',
    color: '#374151',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  td: {
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
    color: '#4b5563',
    fontSize: '14px'
  },
  errorMsg: {
    padding: '16px 20px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    marginBottom: '20px',
    fontWeight: '500',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)',
    animation: 'fadeIn 0.3s ease-out'
  },
  successMsg: {
    padding: '16px 20px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    borderRadius: '12px',
    marginBottom: '20px',
    fontWeight: '500',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
    animation: 'fadeIn 0.3s ease-out'
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
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  input:focus, select:focus, textarea:focus {
    border-color: #667eea !important;
    background-color: white !important;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
    outline: none !important;
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  tr:hover {
    background-color: rgba(102, 126, 234, 0.02) !important;
  }

  .logoutBtn:hover {
    background: rgba(255, 255, 255, 0.3) !important;
    border-color: rgba(255, 255, 255, 0.5) !important;
  }
`;
document.head.appendChild(styleSheet);

export default ReceptionistDashboard;
