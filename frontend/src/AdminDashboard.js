import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [filterOperation, setFilterOperation] = useState('');
  const [limit, setLimit] = useState(100);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadAuditLogs();
  }, [limit]);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:8000/api/audit-logs?limit=${limit}`, {
        headers: {
          'x-user-id': user.user_id
        }
      });

      if (response.data.success) {
        setAuditLogs(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load audit logs');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLog(null);
  };

  const filteredLogs = auditLogs.filter(log => {
    if (filterTable && log.table_name !== filterTable) return false;
    if (filterOperation && log.operation_type !== filterOperation) return false;
    return true;
  });

  const uniqueTables = [...new Set(auditLogs.map(log => log.table_name))];
  const uniqueOperations = [...new Set(auditLogs.map(log => log.operation_type))];

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h2 style={styles.navTitle}>EMR System - Admin Portal</h2>
        <div style={styles.navRight}>
          <span style={styles.username}>Welcome, {user.username}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.header}>
          <h3 style={styles.pageTitle}>Audit Trail Logs</h3>
          <button onClick={loadAuditLogs} style={styles.refreshBtn}>
            Refresh Logs
          </button>
        </div>

        {error && <div style={styles.errorMsg}>{error}</div>}

        <div style={styles.filterCard}>
          <h4 style={styles.filterTitle}>Filters</h4>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Table Name</label>
              <select
                value={filterTable}
                onChange={(e) => setFilterTable(e.target.value)}
                style={styles.input}
              >
                <option value="">All Tables</option>
                {uniqueTables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.label}>Operation Type</label>
              <select
                value={filterOperation}
                onChange={(e) => setFilterOperation(e.target.value)}
                style={styles.input}
              >
                <option value="">All Operations</option>
                {uniqueOperations.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.label}>Limit</label>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                style={styles.input}
              >
                <option value="50">50 records</option>
                <option value="100">100 records</option>
                <option value="200">200 records</option>
                <option value="500">500 records</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <button
                onClick={() => {
                  setFilterTable('');
                  setFilterOperation('');
                }}
                style={styles.clearBtn}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div style={styles.statsCard}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{filteredLogs.length}</div>
            <div style={styles.statLabel}>Total Logs</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{uniqueTables.length}</div>
            <div style={styles.statLabel}>Tables</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>
              {filteredLogs.filter(log => log.operation_type === 'INSERT').length}
            </div>
            <div style={styles.statLabel}>Inserts</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>
              {filteredLogs.filter(log => log.operation_type === 'UPDATE').length}
            </div>
            <div style={styles.statLabel}>Updates</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>
              {filteredLogs.filter(log => log.operation_type === 'DELETE').length}
            </div>
            <div style={styles.statLabel}>Deletes</div>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <div style={styles.tableHint}>
            💡 Click on any row to view full details
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Timestamp</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Table</th>
                <th style={styles.th}>Operation</th>
                <th style={styles.th}>Record ID</th>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Old Value</th>
                <th style={styles.th}>New Value</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={styles.td}>Loading...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="9" style={styles.td}>No audit logs found</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <tr
                    key={log.audit_id}
                    onClick={() => handleRowClick(log)}
                    style={styles.clickableRow}
                  >
                    <td style={styles.td}>{log.audit_id}</td>
                    <td style={styles.td}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={styles.td}>{log.username || `User ${log.user_id}`}</td>
                    <td style={styles.td}>
                      <span style={styles.tableBadge}>{log.table_name}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.operationBadge,
                        ...styles[`operation${log.operation_type}`]
                      }}>
                        {log.operation_type}
                      </span>
                    </td>
                    <td style={styles.td}>{log.record_id || '-'}</td>
                    <td style={styles.td}>{log.field_changed || '-'}</td>
                    <td style={styles.tdValue} title={log.old_value || '-'}>
                      {log.old_value || '-'}
                    </td>
                    <td style={styles.tdValue} title={log.new_value || '-'}>
                      {log.new_value || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedLog && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Audit Log Details</h3>
              <button onClick={closeModal} style={styles.closeBtn} className="modal-close-btn">×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Audit ID:</span>
                <span style={styles.detailValue}>{selectedLog.audit_id}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Timestamp:</span>
                <span style={styles.detailValue}>
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>User:</span>
                <span style={styles.detailValue}>
                  {selectedLog.username || `User ${selectedLog.user_id}`}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Table:</span>
                <span style={styles.tableBadge}>{selectedLog.table_name}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Operation:</span>
                <span style={{
                  ...styles.operationBadge,
                  ...styles[`operation${selectedLog.operation_type}`]
                }}>
                  {selectedLog.operation_type}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Record ID:</span>
                <span style={styles.detailValue}>{selectedLog.record_id || '-'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Field Changed:</span>
                <span style={styles.detailValue}>{selectedLog.field_changed || '-'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>IP Address:</span>
                <span style={styles.detailValue}>{selectedLog.ip_address || '-'}</span>
              </div>
              <div style={styles.detailColumn}>
                <span style={styles.detailLabel}>Old Value:</span>
                <div style={styles.valueBox}>
                  {selectedLog.old_value || '-'}
                </div>
              </div>
              <div style={styles.detailColumn}>
                <span style={styles.detailLabel}>New Value:</span>
                <div style={styles.valueBox}>
                  {selectedLog.new_value || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    animation: 'fadeIn 0.6s ease-out'
  },
  navbar: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
    flexWrap: 'nowrap',
    gap: '20px'
  },
  navTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    whiteSpace: 'nowrap',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'nowrap',
    flexShrink: 0
  },
  username: {
    fontSize: '15px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  logoutBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  content: {
    padding: '40px',
    animation: 'slideIn 0.4s ease-out'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  pageTitle: {
    color: 'white',
    fontSize: '28px',
    fontWeight: '800',
    margin: 0
  },
  refreshBtn: {
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  errorMsg: {
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: '12px',
    marginBottom: '25px',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.1)',
    fontSize: '14px'
  },
  filterCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '25px',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    marginBottom: '30px',
    border: '1px solid rgba(102, 126, 234, 0.2)'
  },
  filterTitle: {
    margin: '0 0 20px 0',
    color: '#374151',
    fontSize: '18px',
    fontWeight: '700'
  },
  filterRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    alignItems: 'end'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '8px',
    color: '#374151',
    fontWeight: '600',
    fontSize: '14px'
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: '#f9fafb',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  clearBtn: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statsCard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statItem: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '25px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    transition: 'all 0.3s ease'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tableContainer: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    overflowX: 'auto',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    animation: 'fadeIn 0.5s ease-out'
  },
  tableHint: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    color: '#667eea',
    fontSize: '13px',
    fontWeight: '600',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
    textAlign: 'center'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '18px 12px',
    textAlign: 'left',
    borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    fontWeight: '700',
    color: '#374151',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap'
  },
  td: {
    padding: '14px 12px',
    borderBottom: '1px solid #e5e7eb',
    color: '#4b5563',
    fontSize: '13px',
    whiteSpace: 'nowrap'
  },
  tdValue: {
    padding: '14px 12px',
    borderBottom: '1px solid #e5e7eb',
    color: '#4b5563',
    fontSize: '12px',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  tableBadge: {
    padding: '4px 10px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
    color: '#667eea',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid rgba(102, 126, 234, 0.3)'
  },
  operationBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  operationINSERT: {
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    color: '#059669',
    border: '1px solid #6ee7b7'
  },
  operationUPDATE: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    color: '#d97706',
    border: '1px solid #fbbf24'
  },
  operationDELETE: {
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    color: '#dc2626',
    border: '1px solid #fca5a5'
  },
  operationSELECT: {
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    color: '#2563eb',
    border: '1px solid #93c5fd'
  },
  clickableRow: {
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)',
    animation: 'fadeIn 0.2s ease-out'
  },
  modalContent: {
    background: 'white',
    borderRadius: '20px',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'slideIn 0.3s ease-out'
  },
  modalHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px 25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px'
  },
  modalTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700'
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    fontSize: '32px',
    cursor: 'pointer',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    padding: 0,
    lineHeight: 1
  },
  modalBody: {
    padding: '25px',
    maxHeight: 'calc(80vh - 80px)',
    overflowY: 'auto'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb',
    gap: '20px'
  },
  detailColumn: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb',
    gap: '10px'
  },
  detailLabel: {
    fontWeight: '700',
    color: '#374151',
    fontSize: '14px',
    minWidth: '120px'
  },
  detailValue: {
    color: '#6b7280',
    fontSize: '14px',
    flex: 1,
    textAlign: 'right',
    wordBreak: 'break-word'
  },
  valueBox: {
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    padding: '15px',
    color: '#374151',
    fontSize: '13px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxHeight: '200px',
    overflowY: 'auto',
    lineHeight: '1.6'
  }
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  input:focus, select:focus {
    border-color: #667eea !important;
    background-color: white !important;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5) !important;
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }

  tbody tr:hover td {
    background-color: rgba(102, 126, 234, 0.08);
  }

  tbody tr {
    transition: all 0.2s ease;
  }

  .modal-close-btn:hover {
    background: rgba(255, 255, 255, 0.3) !important;
    transform: rotate(90deg);
  }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;
