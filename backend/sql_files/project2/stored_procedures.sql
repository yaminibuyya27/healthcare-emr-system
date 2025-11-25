USE EMR_System;

-- Procedure: sp_add_patient
DROP PROCEDURE IF EXISTS `sp_add_patient`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_patient`(
    IN p_user_id INT,
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_date_of_birth DATE,
    IN p_gender ENUM('Male', 'Female', 'Other'),
    IN p_phone_number VARCHAR(20),
    IN p_email_address VARCHAR(100),
    IN p_street_address VARCHAR(200),
    IN p_city VARCHAR(100),
    IN p_state VARCHAR(50),
    IN p_postal_code VARCHAR(20)
)
BEGIN
    DECLARE v_has_permission BOOLEAN;
    DECLARE v_new_patient_id INT;
    
    -- Check permission
    CALL sp_check_permission(p_user_id, 'CREATE_PATIENT', v_has_permission);
    
    IF v_has_permission THEN
        -- Set user context for trigger
        SET @current_user_id = p_user_id;
        
        -- Insert patient
        INSERT INTO Patient (
            first_name, last_name, date_of_birth, gender,
            phone_number, email_address, street_address, city, state, postal_code
        ) VALUES (
            p_first_name, p_last_name, p_date_of_birth, p_gender,
            p_phone_number, p_email_address, p_street_address, p_city, p_state, p_postal_code
        );
        
        SET v_new_patient_id = LAST_INSERT_ID();
        
        -- Return success
        SELECT 
            1 as success,
            v_new_patient_id as patient_id,
            'Patient added successfully' as message;
    ELSE
        -- Return permission denied
        SELECT 
            0 as success,
            NULL as patient_id,
            'Permission denied: Cannot create patient' as message;
    END IF;
END$$
DELIMITER ;

-- Procedure: sp_add_prescription
DROP PROCEDURE IF EXISTS `sp_add_prescription`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_prescription`(
    IN p_user_id INT,
    IN p_patient_id INT,
    IN p_appointment_id INT,
    IN p_medication_id INT,
    IN p_dosage_instructions VARCHAR(255),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_refill_count INT,
    OUT p_prescription_id INT,
    OUT p_result VARCHAR(255)
)
BEGIN
    DECLARE v_has_permission BOOLEAN;
    DECLARE v_doctor_id INT;
    
    -- Check if user has permission to create prescriptions
    CALL sp_check_permission(p_user_id, 'UPDATE_PRESCRIPTION', v_has_permission);
    
    IF v_has_permission THEN
        -- Get doctor_id from appointment
        SELECT doctor_id INTO v_doctor_id 
        FROM Appointment 
        WHERE appointment_id = p_appointment_id;
        
        IF v_doctor_id IS NULL THEN
            SET p_result = 'Invalid appointment ID';
            SET p_prescription_id = NULL;
        ELSE
            -- Insert new prescription
            INSERT INTO Prescription (
                patient_id, 
                doctor_id, 
                medication_id, 
                appointment_id, 
                dosage_instructions, 
                start_date, 
                end_date, 
                refill_count
            ) VALUES (
                p_patient_id,
                v_doctor_id,
                p_medication_id,
                p_appointment_id,
                p_dosage_instructions,
                p_start_date,
                p_end_date,
                p_refill_count
            );
            
            SET p_prescription_id = LAST_INSERT_ID();
            
            -- Log the action
            INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id)
            VALUES (p_user_id, 'Prescription', 'INSERT', p_prescription_id);
            
            SET p_result = 'Prescription added successfully';
        END IF;
    ELSE
        SET p_result = 'Permission denied: Cannot add prescription';
        SET p_prescription_id = NULL;
    END IF;
END$$
DELIMITER ;

-- Procedure: sp_check_permission
DROP PROCEDURE IF EXISTS `sp_check_permission`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_check_permission`(
    IN p_user_id INT,
    IN p_permission_name VARCHAR(100),
    OUT p_has_permission BOOLEAN
)
BEGIN
    SELECT COUNT(*) > 0 INTO p_has_permission
    FROM User_Role ur
    JOIN Role_Permission rp ON ur.role_id = rp.role_id
    JOIN Permission p ON rp.permission_id = p.permission_id
    WHERE ur.user_id = p_user_id 
      AND p.permission_name = p_permission_name;
END$$
DELIMITER ;

-- Procedure: sp_delete_prescription
DROP PROCEDURE IF EXISTS `sp_delete_prescription`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_delete_prescription`(
    IN p_user_id INT,
    IN p_prescription_id INT,
    OUT p_result VARCHAR(255)
)
BEGIN
    DECLARE v_has_permission BOOLEAN;
    
    CALL sp_check_permission(p_user_id, 'DELETE_PRESCRIPTION', v_has_permission);
    
    IF v_has_permission THEN
        DELETE FROM Prescription WHERE prescription_id = p_prescription_id;
        
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id)
        VALUES (p_user_id, 'Prescription', 'DELETE', p_prescription_id);
        
        SET p_result = 'Prescription deleted successfully';
    ELSE
        SET p_result = 'Permission denied: Cannot delete prescription';
    END IF;
END$$
DELIMITER ;

-- Procedure: sp_get_doctor_appointments
DROP PROCEDURE IF EXISTS `sp_get_doctor_appointments`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_doctor_appointments`(
        IN p_user_id INT
    )
BEGIN
        DECLARE v_doctor_id INT;
        
        SELECT d.doctor_id INTO v_doctor_id
        FROM User u
        JOIN Doctor d ON CONCAT('dr_', LOWER(d.last_name)) = u.username
        WHERE u.user_id = p_user_id
        LIMIT 1;
        
        IF v_doctor_id IS NOT NULL THEN
            SELECT 
                a.appointment_id,
                a.patient_id,
                CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                a.doctor_id,
                a.appointment_date,
                a.reason_for_visit,
                a.status
            FROM Appointment a
            JOIN Patient p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = v_doctor_id
            ORDER BY a.appointment_id ASC
            LIMIT 100;
        ELSE
            SELECT 
                NULL as appointment_id,
                NULL as patient_id,
                NULL as patient_name,
                NULL as doctor_id,
                NULL as appointment_date,
                NULL as reason_for_visit,
                NULL as status
            LIMIT 0;
        END IF;
    END$$
DELIMITER ;

-- Procedure: sp_list_patients
DROP PROCEDURE IF EXISTS `sp_list_patients`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_list_patients`(
    IN p_user_id INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    -- Log the SELECT operation
    INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id)
    VALUES (p_user_id, 'Patient', 'SELECT', NULL);
    
    -- Return patient list sorted by patient_id with city
    SELECT 
        patient_id, first_name, last_name, date_of_birth, gender,
        phone_number, email_address, city
    FROM Patient
    ORDER BY patient_id
    LIMIT p_limit OFFSET p_offset;
END$$
DELIMITER ;

-- Procedure: sp_schedule_appointment
DROP PROCEDURE IF EXISTS `sp_schedule_appointment`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_schedule_appointment`(
    IN p_user_id INT,
    IN p_patient_id INT,
    IN p_doctor_id INT,
    IN p_appointment_date DATETIME,
    IN p_reason_for_visit VARCHAR(200)
)
BEGIN
    DECLARE v_appointment_id INT;
    
    -- Set user context for trigger
    SET @current_user_id = p_user_id;
    
    -- Insert appointment
    INSERT INTO Appointment (patient_id, doctor_id, appointment_date, reason_for_visit, status)
    VALUES (p_patient_id, p_doctor_id, p_appointment_date, p_reason_for_visit, 'Scheduled');
    
    SET v_appointment_id = LAST_INSERT_ID();
    
    SELECT v_appointment_id as appointment_id, 'Appointment scheduled successfully' as message;
END$$
DELIMITER ;

-- Procedure: sp_search_patients
DROP PROCEDURE IF EXISTS `sp_search_patients`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_search_patients`(
    IN p_user_id INT,
    IN p_search_term VARCHAR(100)
)
BEGIN
    -- Log the SELECT operation
    INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id)
    VALUES (p_user_id, 'Patient', 'SELECT', NULL);
    
    -- Return search results with city
    SELECT 
        patient_id, first_name, last_name, date_of_birth, gender,
        phone_number, email_address, city
    FROM Patient
    WHERE CONCAT(first_name, ' ', last_name) LIKE CONCAT('%', p_search_term, '%')
       OR last_name LIKE CONCAT('%', p_search_term, '%')
       OR first_name LIKE CONCAT('%', p_search_term, '%')
    ORDER BY last_name, first_name
    LIMIT 50;
END$$
DELIMITER ;

-- Procedure: sp_update_prescription
DROP PROCEDURE IF EXISTS `sp_update_prescription`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_prescription`(
    IN p_user_id INT,
    IN p_prescription_id INT,
    IN p_medication_id INT,
    IN p_dosage_instructions VARCHAR(255),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_refill_count INT,
    OUT p_result VARCHAR(255)
)
BEGIN
    DECLARE v_has_permission BOOLEAN;
    
    CALL sp_check_permission(p_user_id, 'UPDATE_PRESCRIPTION', v_has_permission);
    
    IF v_has_permission THEN
        UPDATE Prescription 
        SET medication_id = p_medication_id,
            dosage_instructions = p_dosage_instructions,
            start_date = p_start_date,
            end_date = p_end_date,
            refill_count = p_refill_count
        WHERE prescription_id = p_prescription_id;
        
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id)
        VALUES (p_user_id, 'Prescription', 'UPDATE', p_prescription_id);
        
        SET p_result = 'Prescription updated successfully';
    ELSE
        SET p_result = 'Permission denied: Cannot update prescription';
    END IF;
END$$
DELIMITER ;

-- Procedure: sp_user_login
DROP PROCEDURE IF EXISTS `sp_user_login`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_user_login`(
    IN p_username VARCHAR(50),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_username VARCHAR(50);
    DECLARE v_stored_hash VARCHAR(64);
    DECLARE v_input_hash VARCHAR(64);
    DECLARE v_specialty VARCHAR(100);
    DECLARE v_doctor_name VARCHAR(200);
    
    SELECT user_id, username, password_hash 
    INTO v_user_id, v_username, v_stored_hash
    FROM User 
    WHERE username = p_username AND is_active = 1
    LIMIT 1;
    
    SET v_input_hash = SHA2(p_password, 256);
    
    IF v_user_id IS NOT NULL AND v_stored_hash = v_input_hash THEN
        SELECT 
            specialty,
            CONCAT(first_name, ' ', last_name)
        INTO v_specialty, v_doctor_name
        FROM Doctor
        WHERE CONCAT('dr_', LOWER(last_name)) = p_username
        LIMIT 1;
        
        UPDATE User SET last_login = NOW() WHERE user_id = v_user_id;
        
        SELECT 
            v_user_id as user_id, 
            v_username as username,
            v_specialty as specialty,
            v_doctor_name as doctor_name,
            'Login Successful' as message;
    ELSE
        SELECT NULL as user_id, NULL as username, NULL as specialty, NULL as doctor_name, 'Invalid credentials' as message;
    END IF;
END$$
DELIMITER ;

-- Procedure: sp_view_audit_log
DROP PROCEDURE IF EXISTS `sp_view_audit_log`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_view_audit_log`(
    IN p_user_id INT,
    IN p_limit INT
)
BEGIN
    -- Log the SELECT operation (accessing audit log itself)
    INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id)
    VALUES (p_user_id, 'Audit_Log', 'SELECT', NULL);
    
    -- Return audit log entries
    SELECT 
        a.audit_id, a.user_id, u.username, a.table_name, a.operation_type,
        a.record_id, a.field_changed, a.old_value, a.new_value, a.timestamp
    FROM Audit_Log a
    LEFT JOIN User u ON a.user_id = u.user_id
    ORDER BY a.timestamp DESC
    LIMIT p_limit;
END$$
DELIMITER ;

-- Procedure: sp_view_patient
DROP PROCEDURE IF EXISTS `sp_view_patient`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_view_patient`(
    IN p_user_id INT,
    IN p_patient_id INT
)
BEGIN
    DECLARE v_has_permission BOOLEAN;
    
    CALL sp_check_permission(p_user_id, 'VIEW_PATIENT', v_has_permission);
    
    IF v_has_permission THEN
        INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id)
        VALUES (p_user_id, 'Patient', 'SELECT', p_patient_id);
        
        SELECT * FROM Patient WHERE patient_id = p_patient_id;
    ELSE
        SELECT 'Permission denied' AS message;
    END IF;
END$$
DELIMITER ;

