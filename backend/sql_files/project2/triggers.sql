-- Trigger: after_appointment_insert
DROP TRIGGER IF EXISTS `after_appointment_insert`;
DELIMITER $$
CREATE TRIGGER `after_appointment_insert` AFTER INSERT ON `Appointment` FOR EACH ROW BEGIN
    INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, new_value)
    VALUES (
        @current_user_id,
        'Appointment',
        'INSERT',
        NEW.appointment_id,
        CONCAT('Patient: ', NEW.patient_id,
               ', Doctor: ', NEW.doctor_id,
               ', Date: ', NEW.appointment_date,
               ', Status: ', NEW.status)
    );
END$$
DELIMITER ;

-- Trigger: after_appointment_update
DROP TRIGGER IF EXISTS `after_appointment_update`;
DELIMITER $$
CREATE TRIGGER `after_appointment_update` AFTER UPDATE ON `Appointment` FOR EACH ROW BEGIN
    IF OLD.patient_id != NEW.patient_id THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Appointment', 'UPDATE', NEW.appointment_id, 'patient_id', OLD.patient_id, NEW.patient_id);
    END IF;

    IF OLD.doctor_id != NEW.doctor_id THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Appointment', 'UPDATE', NEW.appointment_id, 'doctor_id', OLD.doctor_id, NEW.doctor_id);
    END IF;

    IF IFNULL(OLD.room_id, 0) != IFNULL(NEW.room_id, 0) THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Appointment', 'UPDATE', NEW.appointment_id, 'room_id', OLD.room_id, NEW.room_id);
    END IF;

    IF OLD.appointment_date != NEW.appointment_date THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Appointment', 'UPDATE', NEW.appointment_id, 'appointment_date', OLD.appointment_date, NEW.appointment_date);
    END IF;

    IF IFNULL(OLD.reason_for_visit, '') != IFNULL(NEW.reason_for_visit, '') THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Appointment', 'UPDATE', NEW.appointment_id, 'reason_for_visit', OLD.reason_for_visit, NEW.reason_for_visit);
    END IF;

    IF OLD.status != NEW.status THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Appointment', 'UPDATE', NEW.appointment_id, 'status', OLD.status, NEW.status);
    END IF;

    IF IFNULL(OLD.follow_up_required, 0) != IFNULL(NEW.follow_up_required, 0) THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Appointment', 'UPDATE', NEW.appointment_id, 'follow_up_required', OLD.follow_up_required, NEW.follow_up_required);
    END IF;

    IF IFNULL(OLD.follow_up_date, '1900-01-01') != IFNULL(NEW.follow_up_date, '1900-01-01') THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Appointment', 'UPDATE', NEW.appointment_id, 'follow_up_date', OLD.follow_up_date, NEW.follow_up_date);
    END IF;
END$$
DELIMITER ;

-- Trigger: before_appointment_delete
DROP TRIGGER IF EXISTS `before_appointment_delete`;
DELIMITER $$
CREATE TRIGGER `before_appointment_delete` BEFORE DELETE ON `Appointment` FOR EACH ROW BEGIN
    INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, old_value)
    VALUES (
        @current_user_id,
        'Appointment',
        'DELETE',
        OLD.appointment_id,
        CONCAT('Patient: ', OLD.patient_id,
               ', Doctor: ', OLD.doctor_id,
               ', Date: ', OLD.appointment_date,
               ', Status: ', OLD.status)
    );
END$$
DELIMITER ;

-- Trigger: after_patient_insert
DROP TRIGGER IF EXISTS `after_patient_insert`;
DELIMITER $$
CREATE TRIGGER `after_patient_insert` AFTER INSERT ON `Patient` FOR EACH ROW BEGIN
    INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, new_value)
    VALUES (
        @current_user_id,
        'Patient',
        'INSERT',
        NEW.patient_id,
        CONCAT('Name: ', NEW.first_name, ' ', NEW.last_name, 
               ', DOB: ', NEW.date_of_birth,
               ', Gender: ', NEW.gender,
               ', Phone: ', IFNULL(NEW.phone_number, 'N/A'))
    );
END$$
DELIMITER ;

-- Trigger: after_patient_update
DROP TRIGGER IF EXISTS `after_patient_update`;
DELIMITER $$
CREATE TRIGGER `after_patient_update` AFTER UPDATE ON `Patient` FOR EACH ROW BEGIN
    -- Log each field that changed
    IF OLD.first_name != NEW.first_name THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Patient', 'UPDATE', NEW.patient_id, 'first_name', OLD.first_name, NEW.first_name);
    END IF;

    IF OLD.last_name != NEW.last_name THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Patient', 'UPDATE', NEW.patient_id, 'last_name', OLD.last_name, NEW.last_name);
    END IF;

    IF OLD.date_of_birth != NEW.date_of_birth THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Patient', 'UPDATE', NEW.patient_id, 'date_of_birth', OLD.date_of_birth, NEW.date_of_birth);
    END IF;

    IF OLD.gender != NEW.gender THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Patient', 'UPDATE', NEW.patient_id, 'gender', OLD.gender, NEW.gender);
    END IF;

    IF IFNULL(OLD.phone_number, '') != IFNULL(NEW.phone_number, '') THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Patient', 'UPDATE', NEW.patient_id, 'phone_number', OLD.phone_number, NEW.phone_number);
    END IF;

    IF IFNULL(OLD.email_address, '') != IFNULL(NEW.email_address, '') THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Patient', 'UPDATE', NEW.patient_id, 'email_address', OLD.email_address, NEW.email_address);
    END IF;

    IF IFNULL(OLD.street_address, '') != IFNULL(NEW.street_address, '') THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Patient', 'UPDATE', NEW.patient_id, 'street_address', OLD.street_address, NEW.street_address);
    END IF;

    IF IFNULL(OLD.city, '') != IFNULL(NEW.city, '') THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Patient', 'UPDATE', NEW.patient_id, 'city', OLD.city, NEW.city);
    END IF;

    IF IFNULL(OLD.state, '') != IFNULL(NEW.state, '') THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Patient', 'UPDATE', NEW.patient_id, 'state', OLD.state, NEW.state);
    END IF;

    IF IFNULL(OLD.postal_code, '') != IFNULL(NEW.postal_code, '') THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Patient', 'UPDATE', NEW.patient_id, 'postal_code', OLD.postal_code, NEW.postal_code);
    END IF;

    IF IFNULL(OLD.insurance_id, 0) != IFNULL(NEW.insurance_id, 0) THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Patient', 'UPDATE', NEW.patient_id, 'insurance_id', OLD.insurance_id, NEW.insurance_id);
    END IF;
END$$
DELIMITER ;

-- Trigger: before_patient_delete
DROP TRIGGER IF EXISTS `before_patient_delete`;
DELIMITER $$
CREATE TRIGGER `before_patient_delete` BEFORE DELETE ON `Patient` FOR EACH ROW BEGIN
    -- Save complete patient record before deletion
    INSERT INTO Patient_History (
        patient_id, first_name, last_name, date_of_birth, gender,
        phone_number, email_address, street_address, city, state, postal_code,
        deleted_by, deleted_at
    ) VALUES (
        OLD.patient_id, OLD.first_name, OLD.last_name, OLD.date_of_birth, OLD.gender,
        OLD.phone_number, OLD.email_address, OLD.street_address, OLD.city, OLD.state, OLD.postal_code,
        @current_user_id, NOW()
    );
    
    -- Log the deletion
    INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, old_value)
    VALUES (
        @current_user_id,
        'Patient',
        'DELETE',
        OLD.patient_id,
        CONCAT('Name: ', OLD.first_name, ' ', OLD.last_name,
               ', DOB: ', OLD.date_of_birth,
               ', Gender: ', OLD.gender)
    );
END$$
DELIMITER ;

-- Trigger: after_prescription_insert
DROP TRIGGER IF EXISTS `after_prescription_insert`;
DELIMITER $$
CREATE TRIGGER `after_prescription_insert` AFTER INSERT ON `Prescription` FOR EACH ROW BEGIN
    INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, new_value)
    VALUES (
        @current_user_id,
        'Prescription',
        'INSERT',
        NEW.prescription_id,
        CONCAT('Patient: ', NEW.patient_id,
               ', Medication: ', NEW.medication_id,
               ', Dosage: ', NEW.dosage_instructions,
               ', Start: ', NEW.start_date)
    );
END$$
DELIMITER ;

-- Trigger: after_prescription_update
DROP TRIGGER IF EXISTS `after_prescription_update`;
DELIMITER $$
CREATE TRIGGER `after_prescription_update` AFTER UPDATE ON `Prescription` FOR EACH ROW BEGIN
    -- Track medication_id changes
    IF OLD.medication_id != NEW.medication_id THEN
        INSERT INTO Prescription_History (prescription_id, field_name, old_value, new_value, changed_by, operation_type)
        VALUES (NEW.prescription_id, 'medication_id', OLD.medication_id, NEW.medication_id, @current_user_id, 'UPDATE');

        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Prescription', 'UPDATE', NEW.prescription_id, 'medication_id', OLD.medication_id, NEW.medication_id);
    END IF;

    -- Track refill_count changes
    IF IFNULL(OLD.refill_count, 0) != IFNULL(NEW.refill_count, 0) THEN
        INSERT INTO Prescription_History (prescription_id, field_name, old_value, new_value, changed_by, operation_type)
        VALUES (NEW.prescription_id, 'refill_count', OLD.refill_count, NEW.refill_count, @current_user_id, 'UPDATE');

        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Prescription', 'UPDATE', NEW.prescription_id, 'refill_count', OLD.refill_count, NEW.refill_count);
    END IF;

    -- Track dosage_instructions changes
    IF OLD.dosage_instructions != NEW.dosage_instructions THEN
        INSERT INTO Prescription_History (prescription_id, field_name, old_value, new_value, changed_by, operation_type)
        VALUES (NEW.prescription_id, 'dosage_instructions', OLD.dosage_instructions, NEW.dosage_instructions, @current_user_id, 'UPDATE');

        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Prescription', 'UPDATE', NEW.prescription_id, 'dosage_instructions', OLD.dosage_instructions, NEW.dosage_instructions);
    END IF;

    -- Track start_date changes
    IF IFNULL(OLD.start_date, '1900-01-01') != IFNULL(NEW.start_date, '1900-01-01') THEN
        INSERT INTO Prescription_History (prescription_id, field_name, old_value, new_value, changed_by, operation_type)
        VALUES (NEW.prescription_id, 'start_date', OLD.start_date, NEW.start_date, @current_user_id, 'UPDATE');

        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Prescription', 'UPDATE', NEW.prescription_id, 'start_date', OLD.start_date, NEW.start_date);
    END IF;

    -- Track end_date changes
    IF IFNULL(OLD.end_date, '1900-01-01') != IFNULL(NEW.end_date, '1900-01-01') THEN
        INSERT INTO Prescription_History (prescription_id, field_name, old_value, new_value, changed_by, operation_type)
        VALUES (NEW.prescription_id, 'end_date', OLD.end_date, NEW.end_date, @current_user_id, 'UPDATE');

        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Prescription', 'UPDATE', NEW.prescription_id, 'end_date', OLD.end_date, NEW.end_date);
    END IF;

    -- Track patient_id changes
    IF OLD.patient_id != NEW.patient_id THEN
        INSERT INTO Prescription_History (prescription_id, field_name, old_value, new_value, changed_by, operation_type)
        VALUES (NEW.prescription_id, 'patient_id', OLD.patient_id, NEW.patient_id, @current_user_id, 'UPDATE');

        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Prescription', 'UPDATE', NEW.prescription_id, 'patient_id', OLD.patient_id, NEW.patient_id);
    END IF;

    -- Track doctor_id changes
    IF OLD.doctor_id != NEW.doctor_id THEN
        INSERT INTO Prescription_History (prescription_id, field_name, old_value, new_value, changed_by, operation_type)
        VALUES (NEW.prescription_id, 'doctor_id', OLD.doctor_id, NEW.doctor_id, @current_user_id, 'UPDATE');

        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Prescription', 'UPDATE', NEW.prescription_id, 'doctor_id', OLD.doctor_id, NEW.doctor_id);
    END IF;

    -- Track appointment_id changes
    IF OLD.appointment_id != NEW.appointment_id THEN
        INSERT INTO Prescription_History (prescription_id, field_name, old_value, new_value, changed_by, operation_type)
        VALUES (NEW.prescription_id, 'appointment_id', OLD.appointment_id, NEW.appointment_id, @current_user_id, 'UPDATE');

        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, field_changed, old_value, new_value)
        VALUES (@current_user_id, 'Prescription', 'UPDATE', NEW.prescription_id, 'appointment_id', OLD.appointment_id, NEW.appointment_id);
    END IF;
END$$
DELIMITER ;

-- Trigger: before_prescription_delete
DROP TRIGGER IF EXISTS `before_prescription_delete`;
DELIMITER $$
CREATE TRIGGER `before_prescription_delete` BEFORE DELETE ON `Prescription` FOR EACH ROW BEGIN
    -- Save complete prescription record before deletion
    INSERT INTO Prescription_History (
        prescription_id, field_name, old_value, new_value, changed_by, operation_type
    ) VALUES (
        OLD.prescription_id,
        'FULL_RECORD',
        CONCAT('Patient:', OLD.patient_id, '|Med:', OLD.medication_id, '|Dosage:', OLD.dosage_instructions),
        NULL,
        @current_user_id,
        'DELETE'
    );
    
    -- Log the deletion
    INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id, old_value)
    VALUES (
        @current_user_id,
        'Prescription',
        'DELETE',
        OLD.prescription_id,
        CONCAT('Patient: ', OLD.patient_id,
               ', Medication: ', OLD.medication_id,
               ', Dosage: ', OLD.dosage_instructions)
    );
END$$
DELIMITER ;

