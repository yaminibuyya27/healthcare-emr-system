// dbManager.js
const mysql = require('mysql2/promise');
const config = require('./config');

// Create a shared connection pool for serverless functions
let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(config.db);
  }
  return pool;
}

class DatabaseManager {
  constructor() {
    this.config = config.db;
    this.connection = null;
    this.pool = getPool();
  }

  async connect() {
    try {
      // Get connection from pool instead of creating new one
      this.connection = await this.pool.getConnection();
      return true;
    } catch (error) {
      console.error('Error connecting to database:', error.message);
      console.error('Connection config:', {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        ssl: this.config.ssl ? 'enabled' : 'disabled'
      });
      return false;
    }
  }

  async close() {
    if (this.connection) {
      // Release connection back to pool instead of closing it
      this.connection.release();
      this.connection = null;
    }
  }

  async setUserContext(userId) {
    try {
      await this.connection.query('SET @current_user_id = ?', [userId]);
    } catch (error) {
      console.error('Error setting user context:', error.message);
    }
  }

  async executeProcedure(procName, args, userId = null) {
    try {
      // Set user context if provided
      if (userId) {
        await this.setUserContext(userId);
      }

      const placeholders = args.map(() => '?').join(', ');
      const query = `CALL ${procName}(${placeholders})`;

      const [results] = await this.connection.query(query, args);

      // Return the first result set
      const data = Array.isArray(results[0]) ? results[0] : [];

      return { success: true, data };
    } catch (error) {
      console.error('Procedure execution error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async login(username, password) {
    try {
      // Call login stored procedure
      const [loginResults] = await this.connection.query(
        'CALL sp_user_login(?, ?)',
        [username, password]
      );

      const userData = loginResults[0][0];

      if (userData && userData.user_id) {
        // Get user email
        const [userDetails] = await this.connection.query(
          'SELECT email FROM User WHERE user_id = ?',
          [userData.user_id]
        );

        // Get user permissions from view
        const [permResults] = await this.connection.query(
          'SELECT role_name, GROUP_CONCAT(permission_name SEPARATOR ", ") as permissions FROM vw_user_permissions WHERE user_id = ? GROUP BY user_id, role_name',
          [userData.user_id]
        );

        const permData = permResults[0];

        return {
          success: true,
          user: {
            user_id: userData.user_id,
            username: userData.username,
            email: userDetails[0]?.email || '',
            role: permData?.role_name || 'Unknown',
            specialty: userData.specialty || null,
            doctor_name: userData.doctor_name || null,
            permissions: permData?.permissions ? permData.permissions.split(', ') : []
          },
          message: userData.message
        };
      } else {
        return {
          success: false,
          message: userData?.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async getPatients(userId, limit = 100, offset = 0) {
    return await this.executeProcedure('sp_list_patients', [userId, limit, offset]);
  }

  async getPatientById(userId, patientId) {
    return await this.executeProcedure('sp_view_patient', [userId, patientId]);
  }

  async searchPatients(userId, searchTerm) {
    return await this.executeProcedure('sp_search_patients', [userId, searchTerm]);
  }

  async addPatient(userId, patientData) {
    await this.setUserContext(userId);
    const args = [
      userId,
      patientData.first_name,
      patientData.last_name,
      patientData.date_of_birth,
      patientData.gender,
      patientData.phone_number,
      patientData.email_address,
      patientData.street_address,
      patientData.city,
      patientData.state,
      patientData.postal_code
    ];

    const result = await this.executeProcedure('sp_add_patient', args, userId);

    // Return first row of result
    if (result.success && result.data && result.data.length > 0) {
      const row = result.data[0];
      return {
        success: row.success === 1,
        patient_id: row.patient_id,
        message: row.message
      };
    }

    return result;
  }

  async updatePatient(userId, patientData) {
    await this.setUserContext(userId);
    const args = [
      userId,
      patientData.patient_id,
      patientData.first_name,
      patientData.last_name,
      patientData.date_of_birth,
      patientData.gender,
      patientData.phone_number,
      patientData.email_address,
      patientData.street_address,
      patientData.city,
      patientData.state,
      patientData.postal_code
    ];

    const result = await this.executeProcedure('sp_update_patient', args, userId);

    // Return first row of result
    if (result.success && result.data && result.data.length > 0) {
      const row = result.data[0];
      return {
        success: row.success === 1,
        message: row.message
      };
    }

    return result;
  }

  async scheduleAppointment(userId, appointmentData) {
    const args = [
      userId,
      appointmentData.patient_id,
      appointmentData.doctor_id,
      appointmentData.appointment_date,
      appointmentData.reason_for_visit
    ];
    return await this.executeProcedure('sp_schedule_appointment', args);
  }

  async updateAppointment(userId, appointmentData) {
    try {
      await this.setUserContext(userId);

      const [result] = await this.connection.query(
        'UPDATE Appointment SET patient_id = ?, doctor_id = ?, appointment_date = ?, reason_for_visit = ?, status = ? WHERE appointment_id = ?',
        [
          appointmentData.patient_id,
          appointmentData.doctor_id,
          appointmentData.appointment_date,
          appointmentData.reason_for_visit,
          appointmentData.status || 'Scheduled',
          appointmentData.appointment_id
        ]
      );

      if (result.affectedRows > 0) {
        await this.connection.query(
          'INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id) VALUES (?, ?, ?, ?)',
          [userId, 'Appointment', 'UPDATE', appointmentData.appointment_id]
        );
        return { success: true, message: 'Appointment updated successfully' };
      } else {
        return { success: false, message: 'Appointment not found' };
      }
    } catch (error) {
      console.error('Error updating appointment:', error.message);
      return { success: false, error: error.message };
    }
  }

  async deleteAppointment(userId, appointmentId) {
    try {
      await this.setUserContext(userId);

      const [result] = await this.connection.query(
        'DELETE FROM Appointment WHERE appointment_id = ?',
        [appointmentId]
      );

      if (result.affectedRows > 0) {
        await this.connection.query(
          'INSERT INTO Audit_Log (user_id, table_name, operation_type, record_id) VALUES (?, ?, ?, ?)',
          [userId, 'Appointment', 'DELETE', appointmentId]
        );
        return { success: true, message: 'Appointment deleted successfully' };
      } else {
        return { success: false, message: 'Appointment not found' };
      }
    } catch (error) {
      console.error('Error deleting appointment:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getDoctorAppointments(userId) {
    return await this.executeProcedure('sp_get_doctor_appointments', [userId]);
  }

  async getAllAppointments() {
    try {
      const [results] = await this.connection.query(`
        SELECT
          a.appointment_id,
          a.patient_id,
          COALESCE(CONCAT(p.first_name, ' ', p.last_name), 'Unknown Patient') as patient_name,
          a.doctor_id,
          COALESCE(CONCAT(d.first_name, ' ', d.last_name), 'Unknown Doctor') as doctor_name,
          COALESCE(d.specialty, 'N/A') as specialty,
          a.appointment_date,
          a.reason_for_visit,
          a.status
        FROM Appointment a
        LEFT JOIN Patient p ON a.patient_id = p.patient_id
        LEFT JOIN Doctor d ON a.doctor_id = d.doctor_id
        ORDER BY a.appointment_id ASC
      `);
      return { success: true, data: results };
    } catch (error) {
      console.error('Error fetching all appointments:', error.message);
      return { success: false, error: error.message };
    }
  }

  async updatePrescription(userId, prescriptionData) {
    try {
      await this.setUserContext(userId);

      // Call stored procedure with OUT parameter and all fields
      await this.connection.query(
        'CALL sp_update_prescription(?, ?, ?, ?, ?, ?, ?, @result)',
        [
          userId,
          prescriptionData.prescription_id,
          prescriptionData.medication_id,
          prescriptionData.dosage_instructions,
          prescriptionData.start_date,
          prescriptionData.end_date,
          prescriptionData.refill_count
        ]
      );

      // Get the OUT parameter value
      const [resultRow] = await this.connection.query('SELECT @result as result');
      const message = resultRow[0].result;

      const success = message.includes('successfully');

      return {
        success: success,
        message: message,
        data: success ? [{ message: message }] : []
      };
    } catch (error) {
      console.error('Error updating prescription:', error.message);
      return { success: false, error: error.message };
    }
  }

  async deletePrescription(userId, prescriptionId) {
    try {
      await this.setUserContext(userId);

      // Call stored procedure with OUT parameter
      await this.connection.query(
        'CALL sp_delete_prescription(?, ?, @result)',
        [userId, prescriptionId]
      );

      // Get the OUT parameter value
      const [resultRow] = await this.connection.query('SELECT @result as result');
      const message = resultRow[0].result;

      const success = message.includes('successfully');

      return {
        success: success,
        message: message,
        data: success ? [{ message: message }] : []
      };
    } catch (error) {
      console.error('Error deleting prescription:', error.message);
      return { success: false, error: error.message };
    }
  }

  async createPrescription(userId, prescriptionData) {
    try {
      await this.setUserContext(userId);

      // Call stored procedure with OUT parameters
      await this.connection.query(
        'CALL sp_add_prescription(?, ?, ?, ?, ?, ?, ?, ?, @prescription_id, @result)',
        [
          userId,
          prescriptionData.patient_id,
          prescriptionData.appointment_id,
          prescriptionData.medication_id,
          prescriptionData.dosage_instructions,
          prescriptionData.start_date,
          prescriptionData.end_date,
          prescriptionData.refill_count || 0
        ]
      );

      // Get the OUT parameter values
      const [resultRow] = await this.connection.query('SELECT @prescription_id as prescription_id, @result as result');
      const message = resultRow[0].result;
      const prescriptionId = resultRow[0].prescription_id;

      const success = message.includes('successfully');

      return {
        success: success,
        message: message,
        prescription_id: prescriptionId,
        data: success ? [{ message: message, prescription_id: prescriptionId }] : []
      };
    } catch (error) {
      console.error('Error creating prescription:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getAuditLog(userId, limit = 50) {
    return await this.executeProcedure('sp_view_audit_log', [userId, limit]);
  }

  async getDoctors() {
    try {
      const [results] = await this.connection.query(
        'SELECT doctor_id, first_name, last_name, specialty FROM Doctor ORDER BY doctor_id ASC'
      );
      return { success: true, data: results };
    } catch (error) {
      console.error('Error fetching doctors:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getAllPatients() {
    try {
      const [results] = await this.connection.query(`
        SELECT
          patient_id,
          first_name,
          last_name,
          date_of_birth,
          gender,
          phone_number,
          email_address
        FROM Patient
        ORDER BY patient_id ASC
      `);
      return { success: true, data: results };
    } catch (error) {
      console.error('Error fetching all patients:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getPrescriptions(userId) {
    try {
      const [doctorResult] = await this.connection.query(`
        SELECT d.doctor_id
        FROM User u
        JOIN Doctor d ON CONCAT('dr_', LOWER(d.last_name)) = u.username
        WHERE u.user_id = ?
        LIMIT 1
      `, [userId]);

      if (!doctorResult || doctorResult.length === 0) {
        return { success: true, data: [] };
      }

      const doctorId = doctorResult[0].doctor_id;

      const [results] = await this.connection.query(`
        SELECT
          p.prescription_id,
          p.patient_id,
          CONCAT(pat.first_name, ' ', pat.last_name) as patient_name,
          p.doctor_id,
          CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
          p.medication_id,
          m.medication_name,
          p.dosage_instructions,
          p.start_date,
          p.end_date,
          p.refill_count
        FROM Prescription p
        JOIN Patient pat ON p.patient_id = pat.patient_id
        JOIN Doctor d ON p.doctor_id = d.doctor_id
        JOIN Medication m ON p.medication_id = m.medication_id
        WHERE p.doctor_id = ?
        ORDER BY p.prescription_id ASC
        LIMIT 100
      `, [doctorId]);
      return { success: true, data: results };
    } catch (error) {
      console.error('Error fetching prescriptions:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getMedications() {
    try {
      const [results] = await this.connection.query(
        'SELECT medication_id, medication_name, dosage_form, strength FROM Medication ORDER BY medication_id ASC'
      );
      return { success: true, data: results };
    } catch (error) {
      console.error('Error fetching medications:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = DatabaseManager;
