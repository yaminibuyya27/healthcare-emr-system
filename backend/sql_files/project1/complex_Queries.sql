
SELECT a.appointment_id, p.first_name AS patient, d.first_name AS doctor,
a.appointment_date, a.status
FROM Appointment a
JOIN Patient p ON a.patient_id = p.patient_id
JOIN Doctor d ON a.doctor_id = d.doctor_id;

SELECT d.first_name, d.last_name, COUNT(a.appointment_id) AS
total_appointments
FROM Doctor d
JOIN Appointment a ON d.doctor_id = a.doctor_id
GROUP BY d.doctor_id;

SELECT p.first_name, p.last_name, SUM(b.total_amount) AS total_billed
FROM Patient p
JOIN Billing b ON p.patient_id = b.patient_id
GROUP BY p.patient_id;

SELECT p.first_name, p.last_name, b.billing_status
FROM Billing b
JOIN Patient p ON b.patient_id = p.patient_id
WHERE b.billing_status IN ('Pending', 'Partial');

SELECT diagnosis_code, COUNT(*) AS frequency
FROM Diagnosis
GROUP BY diagnosis_code
ORDER BY frequency DESC;

SELECT d.first_name, d.last_name, SUM(b.total_amount) AS total_revenue
FROM Billing b
JOIN Appointment a ON b.appointment_id = a.appointment_id
JOIN Doctor d ON a.doctor_id = d.doctor_id
GROUP BY d.doctor_id;

SELECT p.first_name, p.last_name, COUNT(a.appointment_id) AS num_visits
FROM Appointment a
JOIN Patient p ON a.patient_id = p.patient_id
GROUP BY p.patient_id
HAVING COUNT(a.appointment_id) > 1;

SELECT p.first_name, p.last_name, a.allergen, a.severity
FROM Allergy a
JOIN Patient p ON a.patient_id = p.patient_id
WHERE a.severity = 'Severe';

SELECT DISTINCT d.first_name, d.last_name
FROM Prescription pr
JOIN Doctor d ON pr.doctor_id = d.doctor_id
WHERE MONTH(pr.start_date) = 10 AND YEAR(pr.start_date) = 2025;

SELECT AVG(total_amount) AS avg_bill FROM Billing;

SELECT p.first_name, p.last_name, a.appointment_date, a.follow_up_date
FROM Appointment a
JOIN Patient p ON a.patient_id = p.patient_id
WHERE a.follow_up_required = TRUE AND MONTH(a.follow_up_date) = 11;

SELECT p.first_name, p.last_name, m.medication_name
FROM Prescription pr
JOIN Patient p ON pr.patient_id = p.patient_id
JOIN Medication m ON pr.medication_id = m.medication_id;

SELECT p.first_name, p.last_name, l.test_name, l.test_result_value, l.remarks
FROM LabTest l
JOIN Patient p ON l.patient_id = p.patient_id
WHERE l.remarks NOT LIKE 'Normal%';

SELECT p.first_name, p.last_name, SUM(b.amount_paid) AS total_paid
FROM Billing b
JOIN Patient p ON b.patient_id = p.patient_id
GROUP BY p.patient_id
ORDER BY total_paid DESC
LIMIT 5;

SELECT DISTINCT d.first_name, d.last_name
FROM Doctor d
JOIN Diagnosis di ON d.doctor_id = di.doctor_id
WHERE di.diagnosis_code IN ('E11.9', 'I10');