
SELECT AVG(appointment_count) AS avg_appointments_per_doctor
FROM (
 SELECT doctor_id, COUNT(*) AS appointment_count
 FROM Appointment
 GROUP BY doctor_id
) AS sub;

SELECT diagnosis_code, COUNT(*) AS count
FROM Diagnosis
GROUP BY diagnosis_code
ORDER BY count DESC
LIMIT 3;

SELECT p.first_name, p.last_name, COUNT(di.diagnosis_id) AS
chronic_conditions
FROM Diagnosis di
JOIN Patient p ON di.patient_id = p.patient_id
WHERE di.diagnosis_code IN ('E11.9', 'I10')
GROUP BY p.patient_id
HAVING COUNT(di.diagnosis_id) > 1;

SELECT MONTH(billing_date) AS month, SUM(total_amount) AS revenue
FROM Billing
GROUP BY MONTH(billing_date);

SELECT d.first_name, d.last_name,
 COUNT(a.appointment_id) AS total_appointments,
 SUM(b.total_amount) AS total_revenue
FROM Doctor d
JOIN Appointment a ON d.doctor_id = a.doctor_id
JOIN Billing b ON a.appointment_id = b.appointment_id
GROUP BY d.doctor_id;

SELECT p.first_name, p.last_name, SUM(l.test_cost) AS total_lab_cost
FROM LabTest l
JOIN Patient p ON l.patient_id = p.patient_id
GROUP BY p.patient_id
ORDER BY total_lab_cost DESC
LIMIT 5;

SELECT p.city, COUNT(*) AS severe_allergies
FROM Allergy a
JOIN Patient p ON a.patient_id = p.patient_id
WHERE a.severity = 'Severe'
GROUP BY p.city;

SELECT DISTINCT d.first_name, d.last_name
FROM Doctor d
JOIN Appointment a ON d.doctor_id = a.doctor_id
JOIN Allergy al ON a.patient_id = al.patient_id
WHERE al.severity = 'Severe';

SELECT p.first_name, p.last_name
FROM Appointment a
JOIN Patient p ON a.patient_id = p.patient_id
WHERE a.follow_up_required = TRUE AND a.status = 'Completed';

SELECT p.first_name, p.last_name, AVG(l.test_cost) AS avg_test_cost
FROM LabTest l
JOIN Patient p ON l.patient_id = p.patient_id
GROUP BY p.patient_id;

SELECT d.first_name, d.last_name, COUNT(pr.prescription_id) AS prescriptions
FROM Doctor d
JOIN Prescription pr ON d.doctor_id = pr.doctor_id
GROUP BY d.doctor_id
ORDER BY prescriptions DESC
LIMIT 3;

SELECT p.first_name, p.last_name, COUNT(a.appointment_id) AS appointments,
SUM(b.total_amount) AS total_billed
FROM Patient p
JOIN Appointment a ON p.patient_id = a.patient_id
JOIN Billing b ON a.appointment_id = b.appointment_id
GROUP BY p.patient_id;

SELECT di.diagnosis_code, COUNT(pr.prescription_id) AS total_prescriptions
FROM Diagnosis di
JOIN Prescription pr ON di.patient_id = pr.patient_id
GROUP BY di.diagnosis_code;

SELECT di.diagnosis_code, AVG(b.total_amount) AS avg_bill
FROM Diagnosis di
JOIN Appointment a ON di.patient_id = a.patient_id
JOIN Billing b ON a.appointment_id = b.appointment_id
GROUP BY di.diagnosis_code;

SELECT p.first_name, p.last_name, COUNT(l.test_id) AS abnormal_tests
FROM LabTest l
JOIN Patient p ON l.patient_id = p.patient_id
WHERE l.remarks NOT LIKE 'Normal%'
GROUP BY p.patient_id
HAVING COUNT(l.test_id) > 1;