USE EMR_System;

-- INDEXES FOR PROJECT 1 TABLES
-- Used by Project 2 views and stored procedures

-- Indexes for Patient table
CREATE INDEX idx_patient_name ON Patient (last_name, first_name);

-- Indexes for Doctor table
CREATE INDEX idx_doctor_specialty ON Doctor (specialty);

-- Indexes for Appointment table
CREATE INDEX idx_appointment_date ON Appointment (appointment_date);
CREATE INDEX idx_appointment_date_new ON Appointment (appointment_date);
CREATE INDEX idx_appointment_status_new ON Appointment (status);

-- Indexes for Prescription table
CREATE INDEX idx_prescription_patient_doctor ON Prescription (patient_id, doctor_id);

-- Indexes for Billing table
CREATE INDEX idx_billing_status ON Billing (billing_status);
CREATE INDEX idx_billing_patient_date ON Billing (patient_id, billing_date);

-- Indexes for Diagnosis table
CREATE INDEX idx_diagnosis_code ON Diagnosis (diagnosis_code);

-- Indexes for LabTest table
CREATE INDEX idx_labtest_patient_date ON LabTest (patient_id, test_date);



-- INDEXES FOR PROJECT 2 TABLES
-- Security, audit, and access control tables

-- Indexes for User table
CREATE INDEX idx_user_active_new ON User (username, is_active);

-- Indexes for Audit_Log table
CREATE INDEX idx_audit_user_time ON Audit_Log (user_id, timestamp);
CREATE INDEX idx_audit_timestamp_new ON Audit_Log (timestamp DESC);
CREATE INDEX idx_audit_user_new ON Audit_Log (user_id, timestamp DESC);
CREATE INDEX idx_audit_table_op_new ON Audit_Log (table_name, operation_type, timestamp DESC);

