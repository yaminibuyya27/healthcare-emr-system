import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from './api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));

        const role = response.data.user.role.toLowerCase();
        if (role === 'receptionist') {
          navigate('/receptionist');
        } else if (role === 'physician' || role === 'doctor') {
          navigate('/doctor');
        } else if (role === 'administrator') {
          navigate('/admin');
        } else {
          setError('Invalid user role');
        }
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}>
        <div style={styles.shape}></div>
        <div style={styles.shape2}></div>
      </div>

      <div style={styles.card}>

        <h1 style={styles.title}>HealthCare EMR</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>👤</span>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Enter your username"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🔒</span>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? (
              <span style={styles.buttonLoading}>
                <span style={styles.spinner}></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px'
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  },
  shape: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    top: '-100px',
    right: '-100px',
    animation: 'pulse 4s ease-in-out infinite'
  },
  shape2: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    bottom: '-50px',
    left: '-50px',
    animation: 'pulse 5s ease-in-out infinite'
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '50px 40px',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '480px',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeIn 0.6s ease-out'
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  icon: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    textAlign: 'center',
    marginBottom: '8px',
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '15px',
    marginBottom: '35px',
    fontWeight: '500'
  },
  form: {
    width: '100%'
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    color: '#374151',
    fontWeight: '600',
    fontSize: '14px'
  },
  labelIcon: {
    fontSize: '18px'
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#f9fafb',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  buttonLoading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block'
  },
  error: {
    color: '#dc2626',
    marginBottom: '20px',
    padding: '14px',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  divider: {
    margin: '35px 0 25px',
    textAlign: 'center',
    position: 'relative'
  },
  dividerText: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '0 15px',
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    position: 'relative',
    zIndex: 1
  },
  credentials: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px'
  },
  credentialCard: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease'
  },
  credentialHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: '1px solid #e5e7eb'
  },
  credentialIcon: {
    fontSize: '24px'
  },
  credentialRole: {
    fontWeight: '700',
    fontSize: '13px',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  credentialInfo: {
    fontSize: '11px',
    lineHeight: '1.8',
    color: '#6b7280',
    fontFamily: 'monospace'
  }
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  input:focus {
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

  .credentialCard:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
`;
document.head.appendChild(styleSheet);

export default Login;
