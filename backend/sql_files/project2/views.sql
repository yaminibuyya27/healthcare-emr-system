USE EMR_System;

-- View: vw_doctor_workload
DROP VIEW IF EXISTS `vw_doctor_workload`;
CREATE VIEW `vw_doctor_workload` AS select `d`.`doctor_id` AS `doctor_id`,`d`.`first_name` AS `first_name`,`d`.`last_name` AS `last_name`,`d`.`specialty` AS `specialty`,count(distinct `a`.`appointment_id`) AS `total_appointments`,count(distinct `pr`.`prescription_id`) AS `total_prescriptions`,sum(`b`.`total_amount`) AS `total_revenue` from (((`doctor` `d` left join `appointment` `a` on((`d`.`doctor_id` = `a`.`doctor_id`))) left join `prescription` `pr` on((`d`.`doctor_id` = `pr`.`doctor_id`))) left join `billing` `b` on((`a`.`appointment_id` = `b`.`appointment_id`))) group by `d`.`doctor_id`;

-- View: vw_patient_summary
DROP VIEW IF EXISTS `vw_patient_summary`;
CREATE VIEW `vw_patient_summary` AS select `p`.`patient_id` AS `patient_id`,`p`.`first_name` AS `first_name`,`p`.`last_name` AS `last_name`,`p`.`date_of_birth` AS `date_of_birth`,timestampdiff(YEAR,`p`.`date_of_birth`,curdate()) AS `age`,`p`.`gender` AS `gender`,`i`.`provider_name` AS `insurance_provider`,count(distinct `a`.`appointment_id`) AS `total_appointments`,count(distinct `pr`.`prescription_id`) AS `total_prescriptions` from (((`patient` `p` left join `insurance` `i` on((`p`.`insurance_id` = `i`.`insurance_id`))) left join `appointment` `a` on((`p`.`patient_id` = `a`.`patient_id`))) left join `prescription` `pr` on((`p`.`patient_id` = `pr`.`patient_id`))) group by `p`.`patient_id`;

-- View: vw_pending_bills
DROP VIEW IF EXISTS `vw_pending_bills`;
CREATE VIEW `vw_pending_bills` AS select `b`.`billing_id` AS `billing_id`,concat(`p`.`first_name`,' ',`p`.`last_name`) AS `patient_name`,`b`.`total_amount` AS `total_amount`,`b`.`amount_paid` AS `amount_paid`,(`b`.`total_amount` - `b`.`amount_paid`) AS `amount_due`,`b`.`billing_date` AS `billing_date`,`b`.`billing_status` AS `billing_status` from (`billing` `b` join `patient` `p` on((`b`.`patient_id` = `p`.`patient_id`))) where (`b`.`billing_status` in ('Pending','Partial'));

-- View: vw_recent_appointments
DROP VIEW IF EXISTS `vw_recent_appointments`;
CREATE VIEW `vw_recent_appointments` AS select `a`.`appointment_id` AS `appointment_id`,`a`.`appointment_date` AS `appointment_date`,concat(`p`.`first_name`,' ',`p`.`last_name`) AS `patient_name`,concat(`d`.`first_name`,' ',`d`.`last_name`) AS `doctor_name`,`d`.`specialty` AS `specialty`,`r`.`room_number` AS `room_number`,`a`.`status` AS `status`,`a`.`reason_for_visit` AS `reason_for_visit` from (((`appointment` `a` join `patient` `p` on((`a`.`patient_id` = `p`.`patient_id`))) join `doctor` `d` on((`a`.`doctor_id` = `d`.`doctor_id`))) left join `room` `r` on((`a`.`room_id` = `r`.`room_id`))) where (`a`.`appointment_date` >= (now() - interval 30 day));

-- View: vw_user_permissions
DROP VIEW IF EXISTS `vw_user_permissions`;
CREATE VIEW `vw_user_permissions` AS select `u`.`user_id` AS `user_id`,`u`.`username` AS `username`,`r`.`role_name` AS `role_name`,`p`.`permission_name` AS `permission_name` from ((((`user` `u` join `user_role` `ur` on((`u`.`user_id` = `ur`.`user_id`))) join `role` `r` on((`ur`.`role_id` = `r`.`role_id`))) join `role_permission` `rp` on((`r`.`role_id` = `rp`.`role_id`))) join `permission` `p` on((`rp`.`permission_id` = `p`.`permission_id`)));

