import React, { useState } from 'react';
import { 
  FiBriefcase, FiMapPin, FiClock, FiAlertCircle, 
  FiCheckCircle, FiSearch, FiFilter, FiChevronRight,
  FiUser, FiCalendar
} from 'react-icons/fi';
import Badge from '../../components/Badge.jsx';
import Table from '../../components/Table.jsx';
import Modal from '../../components/Modal.jsx';
import toast from 'react-hot-toast';

export default function EmployeeTasksPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [tasks, setTasks] = useState([
    { 
      id: 'TSK-1001', type: 'Meter Reading', priority: 'medium', status: 'pending',
      consumer: 'Mohammad Ahmed', address: 'Flat 402, Block 13, Gulshan-e-Iqbal',
      deadline: '2024-05-25 05:00 PM', area: 'Gulshan', assignedDate: '2024-05-24'
    },
    { 
      id: 'TSK-1002', type: 'Complaint Resolution', priority: 'high', status: 'in-progress',
      consumer: 'Saira Bano', address: 'House 22, Lane 4, North Nazimabad',
      deadline: '2024-05-24 08:00 PM', area: 'Nazimabad', assignedDate: '2024-05-24'
    },
    { 
      id: 'TSK-1003', type: 'Emergency Repair', priority: 'emergency', status: 'pending',
      consumer: 'Grid Station 4', address: 'Sector 5, Korangi Industrial Area',
      deadline: '2024-05-24 04:00 PM', area: 'Korangi', assignedDate: '2024-05-24'
    },
    { 
      id: 'TSK-1004', type: 'Maintenance Visit', priority: 'low', status: 'completed',
      consumer: 'Public Park B', address: 'Block 2, DHA Phase 1',
      deadline: '2024-05-23 02:00 PM', area: 'DHA', assignedDate: '2024-05-23'
    },
  ]);

  const [search, setSearch] = useState('');
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskNotes, setTaskNotes] = useState('');

  const filteredTasks = tasks.filter(t => {
    const matchesTab = activeTab === 'all' || t.status === activeTab;
    const matchesSearch = t.consumer.toLowerCase().includes(search.toLowerCase()) || 
                         t.id.toLowerCase().includes(search.toLowerCase()) ||
                         t.address.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleStatusUpdate = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    toast.success(`Task status updated to ${newStatus.replace('-', ' ')}!`);
    setModalOpen(false);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const columns = [
    {
      key: 'type', label: 'Task Type',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', 
            color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiBriefcase size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{r.type}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'consumer', label: 'Consumer/Location',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.consumer}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}><FiMapPin size={10} /> {r.area}</div>
        </div>
      )
    },
    {
      key: 'priority', label: 'Priority',
      render: (r) => <Badge value={r.priority} color={r.priority === 'emergency' ? 'red' : r.priority === 'high' ? 'orange' : r.priority === 'medium' ? 'blue' : 'green'} />
    },
    {
      key: 'deadline', label: 'Deadline',
      render: (r) => (
        <div style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 500 }}>
          <FiClock size={12} style={{marginRight: '4px'}} /> {r.deadline.split(' ')[0]}
        </div>
      )
    },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge value={r.status} />
    },
    {
      key: 'actions', label: '',
      render: (r) => (
        <button className="icon-btn" onClick={() => handleTaskClick(r)}><FiChevronRight /></button>
      )
    }
  ];

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>My Tasks</h1>
        <p>Manage and track your assigned work orders</p>
      </div>

      <div className="filter-bar" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div className="search-wrap" style={{ flex: 1, maxWidth: '400px' }}>
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search tasks by ID, consumer or location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="tabs" style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            {['all', 'pending', 'in-progress', 'completed'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  background: activeTab === tab ? 'white' : 'transparent',
                  color: activeTab === tab ? '#1e293b' : '#64748b',
                  fontWeight: activeTab === tab ? 600 : 500,
                  boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-card">
        <Table columns={columns} data={filteredTasks} loading={false} emptyMsg="No tasks found." />
      </div>

      {/* Task Detail Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Task Details">
        {selectedTask && (
          <div className="task-detail-modal" style={{ padding: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: 0 }}>{selectedTask.type}</h2>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Task ID: {selectedTask.id}</span>
              </div>
              <Badge value={selectedTask.status} />
            </div>

            <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="detail-item">
                <label style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Consumer Name</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                  <FiUser className="text-blue" /> {selectedTask.consumer}
                </div>
              </div>
              <div className="detail-item">
                <label style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Priority Level</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                  <FiAlertCircle className={selectedTask.priority === 'emergency' ? 'text-red' : 'text-orange'} /> 
                  <span style={{textTransform: 'capitalize'}}>{selectedTask.priority}</span>
                </div>
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                <label style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Site Address</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                  <FiMapPin className="text-blue" /> {selectedTask.address}
                </div>
              </div>

              {selectedTask.status === 'in-progress' && (
                <>
                  <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                    <label style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>Task Progress ({taskProgress}%)</label>
                    <input 
                      type="range" min="0" max="100" 
                      value={taskProgress} 
                      onChange={(e) => setTaskProgress(e.target.value)}
                      style={{ width: '100%', accentColor: '#3b82f6' }} 
                    />
                  </div>
                  <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                    <label style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Field Notes</label>
                    <textarea 
                      className="modal-input" 
                      placeholder="Add observations or notes..." 
                      value={taskNotes}
                      onChange={(e) => setTaskNotes(e.target.value)}
                      style={{ minHeight: '80px', padding: '10px' }}
                    />
                  </div>
                </>
              )}

              <div className="detail-item">
                <label style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Assigned On</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                  <FiCalendar className="text-blue" /> {selectedTask.assignedDate}
                </div>
              </div>
              <div className="detail-item">
                <label style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Deadline</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, color: '#ef4444' }}>
                  <FiClock /> {selectedTask.deadline}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {selectedTask.status === 'pending' && (
                <>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleStatusUpdate(selectedTask.id, 'accepted')}>Accept Task</button>
                  <button className="btn-secondary" style={{ flex: 1, color: '#ef4444' }} onClick={() => handleStatusUpdate(selectedTask.id, 'cancelled')}>Reject</button>
                </>
              )}
              {selectedTask.status === 'accepted' && (
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleStatusUpdate(selectedTask.id, 'in-progress')}>Start Progress</button>
              )}
              {selectedTask.status === 'in-progress' && (
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleStatusUpdate(selectedTask.id, 'completed')}>Mark as Completed</button>
              )}
              {(selectedTask.status === 'completed' || selectedTask.status === 'cancelled') && (
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Close</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
