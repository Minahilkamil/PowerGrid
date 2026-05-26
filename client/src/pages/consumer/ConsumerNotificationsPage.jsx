import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../../services/api.js';
import Badge from '../../components/Badge.jsx';
import { FiBell, FiMail, FiMessageSquare, FiAlertTriangle, FiCheckCircle, FiTrash2, FiClock, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Consumer.css';

export default function ConsumerNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) { console.error(err); }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'bill': return <FiMail className="notif-icon bill" />;
      case 'payment': return <FiCheckCircle className="notif-icon payment" />;
      case 'outage': return <FiZap className="notif-icon outage" />;
      case 'complaint': return <FiMessageSquare className="notif-icon complaint" />;
      case 'alert': return <FiAlertTriangle className="notif-icon alert" />;
      default: return <FiBell className="notif-icon default" />;
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with the latest alerts and announcements</p>
        </div>
        <div className="header-actions">
          <button className="btn btn--outline" onClick={markAllRead}>Mark All as Read</button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card-alt">
          <div className="sca-icon blue"><FiBell /></div>
          <div className="sca-info">
            <label>Total Alerts</label>
            <h3>{notifications.length}</h3>
            <span>Communication log</span>
          </div>
        </div>
        <div className="card stat-card-alt">
          <div className="sca-icon red"><FiAlertTriangle /></div>
          <div className="sca-info">
            <label>Unread Messages</label>
            <h3>{notifications.filter(n => !n.isRead).length}</h3>
            <span className="text-danger">Action required</span>
          </div>
        </div>
        <div className="card stat-card-alt">
          <div className="sca-icon green"><FiCheckCircle /></div>
          <div className="sca-info">
            <label>Read & Acknowledged</label>
            <h3>{notifications.filter(n => n.isRead).length}</h3>
            <span className="text-success">Up to date</span>
          </div>
        </div>
      </div>

      <div className="notif-container">
        <div className="notif-sidebar">
          <button className={`ns-item ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All Notifications <span className="count">{notifications.length}</span>
          </button>
          <button className={`ns-item ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
            Unread <span className="count">{notifications.filter(n => !n.isRead).length}</span>
          </button>
          <div className="ns-divider" />
          <div className="ns-preferences">
            <h4>Channel Preferences</h4>
            <div className="pref-item">
              <span>SMS Alerts</span>
              <div className="toggle active"></div>
            </div>
            <div className="pref-item">
              <span>Email Reports</span>
              <div className="toggle active"></div>
            </div>
            <div className="pref-item">
              <span>Push Notifications</span>
              <div className="toggle active"></div>
            </div>
          </div>
        </div>

        <div className="notif-list-card card">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <FiBell className="empty-icon" />
              <p>No notifications to show</p>
            </div>
          ) : (
            <div className="notif-list">
              {filtered.map(n => (
                <div 
                  key={n._id} 
                  className={`notif-item ${n.isRead ? 'read' : 'unread'}`}
                  onClick={() => !n.isRead && markRead(n._id)}
                >
                  <div className="notif-icon-wrap">{getIcon(n.type)}</div>
                  <div className="notif-content">
                    <div className="notif-title-row">
                      <h4>{n.title}</h4>
                      <span className="notif-time"><FiClock /> {new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p>{n.message}</p>
                  </div>
                  {!n.isRead && <div className="unread-dot" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
