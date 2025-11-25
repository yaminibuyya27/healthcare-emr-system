USE EMR_System;

-- Insert data for Role
INSERT INTO Role (role_id, role_name, description) VALUES
(1, 'Administrator', 'Full system access'),
(2, 'Physician', 'Can diagnose, prescribe, and view patient records'),
(3, 'Nurse', 'Can view and update patient vitals'),
(4, 'Receptionist', 'Can schedule appointments and view basic info'),
(5, 'Patient', 'Can view own records only');

-- Insert data for Permission
INSERT INTO Permission (permission_id, permission_name, description) VALUES
(1, 'VIEW_PATIENT', 'View patient information'),
(2, 'CREATE_PATIENT', 'Add new patients'),
(3, 'UPDATE_PATIENT', 'Modify patient information'),
(4, 'DELETE_PATIENT', 'Remove patient records'),
(5, 'VIEW_PRESCRIPTION', 'View prescriptions'),
(6, 'CREATE_PRESCRIPTION', 'Create new prescriptions'),
(7, 'UPDATE_PRESCRIPTION', 'Modify prescriptions'),
(8, 'DELETE_PRESCRIPTION', 'Delete prescriptions'),
(9, 'VIEW_APPOINTMENT', 'View appointments'),
(10, 'CREATE_APPOINTMENT', 'Schedule appointments'),
(11, 'UPDATE_APPOINTMENT', 'Modify appointments'),
(12, 'DELETE_APPOINTMENT', 'Cancel appointments'),
(13, 'VIEW_BILLING', 'View billing information'),
(14, 'UPDATE_BILLING', 'Modify billing records'),
(15, 'VIEW_AUDIT_LOG', 'View system audit logs');

-- Insert data for Role_Permission
INSERT INTO Role_Permission (role_permission_id, role_id, permission_id) VALUES
(37, 1, 1),
(25, 1, 2),
(32, 1, 3),
(28, 1, 4),
(38, 1, 5),
(26, 1, 6),
(33, 1, 7),
(29, 1, 8),
(34, 1, 9),
(24, 1, 10),
(30, 1, 11),
(27, 1, 12),
(36, 1, 13),
(31, 1, 14),
(35, 1, 15),
(9, 2, 5),
(2, 2, 6),
(6, 2, 7),
(3, 2, 8),
(7, 2, 9),
(1, 2, 10),
(4, 2, 11),
(20, 4, 1),
(17, 4, 2),
(23, 4, 4),
(19, 4, 9),
(16, 4, 10),
(18, 4, 11);

-- Insert data for User
-- Passwords are hashed using SHA2(password, 256)
-- Default passwords:
--   admin: admin123
--   receptionist_jane: receptionist123
--   doctors: doctor123
INSERT INTO User (user_id, username, password_hash, email, is_active) VALUES
(2, 'receptionist_jane', SHA2('receptionist123', 256), 'jane@hospital.com', 1),
(3, 'dr_patel', SHA2('doctor123', 256), 'dr.patel@hospital.com', 1),
(4, 'dr_sharma', SHA2('doctor123', 256), 'dr.sharma@hospital.com', 1),
(5, 'dr_reddy', SHA2('doctor123', 256), 'dr.reddy@hospital.com', 1),
(6, 'dr_kumar', SHA2('doctor123', 256), 'dr.kumar@hospital.com', 1),
(7, 'dr_naidu', SHA2('doctor123', 256), 'dr.naidu@hospital.com', 1),
(12, 'admin', SHA2('admin123', 256), 'admin@emr.com', 1);

-- Insert data for User_Role
INSERT INTO User_Role (user_role_id, user_id, role_id, assigned_date) VALUES
(2, 2, 4, '2025-11-22 16:36:01'),
(3, 3, 2, '2025-11-23 19:28:44'),
(4, 4, 2, '2025-11-23 19:28:44'),
(5, 5, 2, '2025-11-23 19:28:44'),
(6, 6, 2, '2025-11-23 19:28:44'),
(7, 7, 2, '2025-11-23 19:28:44'),
(8, 1, 2, '2025-11-23 19:52:53'),
(9, 9, 2, '2025-11-23 22:44:42'),
(10, 11, 2, '2025-11-23 22:44:42'),
(11, 8, 2, '2025-11-23 22:44:42'),
(12, 10, 2, '2025-11-23 22:44:42'),
(16, 12, 1, '2025-11-24 01:23:48');

