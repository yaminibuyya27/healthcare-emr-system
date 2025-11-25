
SELECT patient_id, first_name, last_name, gender, city, state FROM Patient;

SELECT doctor_id, first_name, last_name, specialty FROM Doctor;

SELECT appointment_id, appointment_date, status FROM Appointment;

SELECT allergen, severity, reaction FROM Allergy WHERE patient_id = 1;

SELECT room_number, room_type, availability FROM Room;

SELECT medication_id, medication_name, dosage_form, strength FROM
Medication;

SELECT test_name, test_result_value, remarks FROM LabTest WHERE patient_id =
1;

SELECT billing_id, total_amount, amount_paid, billing_status FROM Billing;

SELECT diagnosis_code, description, diagnosis_date FROM Diagnosis WHERE
doctor_id = 1;


SELECT p.first_name, p.last_name, i.provider_name
FROM Patient p
JOIN Insurance i ON p.insurance_id = i.insurance_id
WHERE i.provider_name = 'United Health';