
CREATE DATABASE IF NOT EXISTS EMR_System;
USE EMR_System;

-- ------------------------------
-- Table: Insurance
-- ------------------------------
CREATE TABLE Insurance (
    insurance_id INT AUTO_INCREMENT PRIMARY KEY,
    provider_name VARCHAR(100) NOT NULL,
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    provider_contact VARCHAR(100)
);

-- ------------------------------
-- Table: Patient
-- ------------------------------
CREATE TABLE Patient (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone_number VARCHAR(20),
    email_address VARCHAR(100),
    street_address VARCHAR(150),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(15),
    insurance_id INT,
    FOREIGN KEY (insurance_id) REFERENCES Insurance(insurance_id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- ------------------------------
-- Table: Allergy
-- ------------------------------
CREATE TABLE Allergy (
    allergy_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    allergen VARCHAR(100) NOT NULL,
    reaction VARCHAR(150),
    severity ENUM('Mild', 'Moderate', 'Severe'),
    date_recorded DATE,
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ------------------------------
-- Table: Doctor
-- ------------------------------
CREATE TABLE Doctor (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    email_address VARCHAR(100)
);

-- ------------------------------
-- Table: Room
-- ------------------------------
CREATE TABLE Room (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    room_type VARCHAR(50),
    availability BOOLEAN DEFAULT TRUE
);

-- ------------------------------
-- Table: Appointment
-- ------------------------------
CREATE TABLE Appointment (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    room_id INT,
    appointment_date DATETIME NOT NULL,
    reason_for_visit VARCHAR(200),
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Room(room_id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- ------------------------------
-- Table: Diagnosis
-- ------------------------------
CREATE TABLE Diagnosis (
    diagnosis_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    diagnosis_code VARCHAR(20),
    description VARCHAR(255),
    diagnosis_date DATE,
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ------------------------------
-- Table: Medication
-- ------------------------------
CREATE TABLE Medication (
    medication_id INT AUTO_INCREMENT PRIMARY KEY,
    medication_name VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(50),
    strength VARCHAR(50)
);

-- ------------------------------
-- Table: Prescription
-- ------------------------------
CREATE TABLE Prescription (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    medication_id INT NOT NULL,
    appointment_id INT NOT NULL,
    dosage_instructions VARCHAR(255),
    start_date DATE,
    end_date DATE,
    refill_count INT DEFAULT 0,
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES Medication(medication_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ------------------------------
-- Table: LabTest
-- ------------------------------
CREATE TABLE LabTest (
    test_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    test_name VARCHAR(100) NOT NULL,
    details VARCHAR(255),
    test_cost DECIMAL(8,2),
    test_date DATE,
    test_result_value VARCHAR(50),
    result_unit VARCHAR(20),
    reference_range VARCHAR(50),
    remarks VARCHAR(255),
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ------------------------------
-- Table: Billing
-- ------------------------------
CREATE TABLE Billing (
    billing_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    appointment_id INT NOT NULL,
    total_amount DECIMAL(10,2),
    amount_paid DECIMAL(10,2),
    billing_status ENUM('Pending', 'Paid', 'Partial') DEFAULT 'Pending',
    billing_date DATE,
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);