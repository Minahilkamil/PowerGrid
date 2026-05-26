import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiClock, FiMapPin, FiCalendar, FiUserCheck, 
  FiLogOut, FiLogIn, FiCheckCircle, FiXCircle,
  FiMap
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function EmployeeAttendancePage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checked-out');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const history = [
    { date: '2024-05-23', checkIn: '08:55 AM', checkOut: '05:10 PM', duration: '8h 15m', status: 'present' },
    { date: '2024-05-22', checkIn: '09:05 AM', checkOut: '05:00 PM', duration: '7h 55m', status: 'late' },
    { date: '2024-05-21', checkIn: '08:50 AM', checkOut: '05:15 PM', duration: '8h 25m', status: 'present' },
    { date: '2024-05-20', checkIn: '09:15 AM', checkOut: '05:30 PM', duration: '8h 15m', status: 'late' },
  ];

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('checked-in');
        toast.success('Checked in successfully from your location!');
        setLoading(false);
      },
      (err) => {
        toast.error('Location access denied. GPS is required for attendance.');
        setLoading(false);
      }
    );
  };

  const [reportModal, setReportModal] = useState(false);

  const fullHistory = [
    ...history,
    { date: '2024-05-19', checkIn: '08:58 AM', checkOut: '05:05 PM', duration: '8h 07m', status: 'present' },
    { date: '2024-05-18', checkIn: '09:10 AM', checkOut: '05:20 PM', duration: '8h 10m', status: 'late' },
    { date: '2024-05-17', checkIn: '08:45 AM', checkOut: '05:00 PM', duration: '8h 15m', status: 'present' },
    { date: '2024-05-16', checkIn: '09:00 AM', checkOut: '05:05 PM', duration: '8h 05m', status: 'present' },
  ];

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add Title
    doc.setFontSize(18);
    doc.text('Attendance Report - May 2024', 14, 20);
    
    // Add Employee Info
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Employee: Ali Hassan`, 14, 30);
    doc.text(`ID: EMP-2024-045`, 14, 36);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 42);

    // Create Table
    const tableColumn = ["Date", "Check In", "Check Out", "Duration", "Status"];
    const tableRows = fullHistory.map(item => [
      item.date,
      item.checkIn,
      item.checkOut,
      item.duration,
      item.status.toUpperCase()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175] }, // PowerGrid blue
    });

    doc.save(`Attendance_Report_Ali_Hassan_${Date.now()}.pdf`);
    toast.success('Report downloaded successfully!');
  };

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'duration', label: 'Working Hours' },
    { 
      key: 'status', label: 'Status',
      render: (r) => <Badge value={r.status} color={r.status === 'present' ? 'green' : 'orange'} />
    }
  ];

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Attendance Management</h1>
        <p>Log your daily attendance with GPS verification</p>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        {/* Check-in Card */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
            color: '#1e40af', fontSize: '2rem'
          }}>
            <FiUserCheck />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>{currentTime.toLocaleTimeString()}</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div style={{ width: '100%', marginBottom: '1.5rem' }}>
            {status === 'checked-out' ? (
              <button 
                className="btn-primary" 
                onClick={handleCheckIn}
                disabled={loading}
                style={{ width: '100%', height: '56px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
              >
                {loading ? 'Verifying GPS...' : <><FiLogIn /> Check In Now</>}
              </button>
            ) : (
              <button 
                className="btn-secondary" 
                onClick={() => { setStatus('checked-out'); toast.success('Checked out successfully!'); }}
                style={{ width: '100%', height: '56px', fontSize: '1.1rem', background: '#fef2f2', color: '#ef4444', borderColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
              >
                <FiLogOut /> Check Out
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            <FiMapPin /> {location ? `GPS Verified: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Location access required'}
          </div>
        </div>

        {/* Attendance Stats & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="section-card" style={{ textAlign: 'center' }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Present Days</div>
              <strong style={{ fontSize: '1.5rem', color: '#10b981' }}>18</strong>
            </div>
            <div className="section-card" style={{ textAlign: 'center' }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Late Arrivals</div>
              <strong style={{ fontSize: '1.5rem', color: '#f59e0b' }}>04</strong>
            </div>
            <div className="section-card" style={{ textAlign: 'center' }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Working Hours</div>
              <strong style={{ fontSize: '1.5rem', color: '#3b82f6' }}>142h</strong>
            </div>
          </div>

          <div className="section-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>Attendance History</h3>
              <button className="text-btn" onClick={() => setReportModal(true)}>View Full Report</button>
            </div>
            <Table columns={columns} data={history} loading={false} />
          </div>
        </div>
      </div>

      <Modal open={reportModal} onClose={() => setReportModal(false)} title="Detailed Attendance Report">
        <div style={{ padding: '0.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div className="section-card" style={{ background: '#f8fafc' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Employee Name</div>
              <strong style={{ fontSize: '1rem' }}>Ali Hassan</strong>
            </div>
            <div className="section-card" style={{ background: '#f8fafc' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Report Period</div>
              <strong style={{ fontSize: '1rem' }}>May 2024</strong>
            </div>
          </div>
          
          <Table 
            columns={[
              ...columns,
              { key: 'location', label: 'GPS Status', render: () => <span style={{fontSize:'0.8rem', color:'#10b981'}}><FiMapPin size={12}/> Verified</span> }
            ]} 
            data={fullHistory} 
            loading={false} 
          />

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={handleDownloadPDF}>
              Download PDF Report
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
