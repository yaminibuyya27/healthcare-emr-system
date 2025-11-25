
SELECT first_name, last_name FROM Patient WHERE gender = 'Female';

SELECT city, COUNT(*) AS total_patients FROM Patient GROUP BY city;

SELECT status, COUNT(*) AS total FROM Appointment GROUP BY status;

SELECT specialty, COUNT(*) AS total FROM Doctor GROUP BY specialty;

SELECT medication_name, strength FROM Medication;

SELECT * FROM Allergy WHERE YEAR(date_recorded) = 2025;

SELECT i.provider_name, COUNT(p.patient_id) AS insured_patients
FROM Insurance i
JOIN Patient p ON i.insurance_id = p.insurance_id
GROUP BY i.provider_name;

SELECT room_type, availability FROM Room;

SELECT description, diagnosis_date FROM Diagnosis WHERE
MONTH(diagnosis_date) = 10;

SELECT billing_status, COUNT(*) AS total FROM Billing GROUP BY billing_status;

SELECT COUNT(*) AS total_appointments FROM Appointment;

SELECT first_name, last_name, TIMESTAMPDIFF(YEAR, date_of_birth,
CURDATE()) AS age
FROM Patient
WHERE TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) > 40;

SELECT first_name, last_name, email_address FROM Patient WHERE
email_address IS NOT NULL;

SELECT d.first_name, d.last_name, COUNT(pr.prescription_id) AS
total_prescriptions
FROM Doctor d
JOIN Prescription pr ON d.doctor_id = pr.doctor_id
GROUP BY d.doctor_id;

SELECT COUNT(*) AS total_lab_tests FROM LabTest;