import React, { useEffect, useState } from 'react';
import { supportAPI } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import Badge from '../../components/Badge.jsx';
import { FiMessageCircle, FiFileText, FiHelpCircle, FiPhone, FiPlus, FiSend, FiUser, FiArrowRight, FiCheckCircle, FiZap, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Consumer.css';

const FAQS = [
  { q: 'How do I pay my bill online?', a: 'You can pay via EasyPaisa, JazzCash, or Credit Card through the Payments section.' },
  { q: 'What to do during a power outage?', a: 'Check the Load Shedding section for schedules. If not scheduled, register a complaint.' },
  { q: 'How to apply for a new connection?', a: 'Go to Services > New Connection and fill out the application form with required documents.' },
  { q: 'Where can I find my consumer ID?', a: 'Your consumer ID is printed on your physical bill and also visible in your Profile.' },
];

export default function ConsumerSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [newTicketModal, setNewTicketModal] = useState(false);
  const [viewTicketModal, setViewTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Chatbot states
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hello! I'm your PowerGrid AI assistant. How can I help you today?", sender: 'bot', time: new Date() }
  ]);

  const chatEndRef = React.useRef(null);

  const [form, setForm] = useState({ subject: '', category: 'general', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const loadData = async () => {
    try {
      const res = await supportAPI.getTickets();
      setTickets(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { id: Date.now(), text: chatInput, sender: 'user', time: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    // Simulated AI Response Logic
    setTimeout(() => {
      let response = "I'm sorry, I don't have information on that specific topic. Would you like to create a support ticket?";
      const input = chatInput.toLowerCase();

      if (input.includes('bill') || input.includes('pay')) {
        response = "You can pay your bill via EasyPaisa, JazzCash, or Debit/Credit Card in the 'Billing & Payments' section.";
      } else if (input.includes('outage') || input.includes('electricity') || input.includes('light')) {
        response = "You can check the load shedding schedule in the 'Outages' section. If it's an emergency, please register a complaint.";
      } else if (input.includes('connection') || input.includes('new')) {
        response = "To apply for a new connection, navigate to the 'Services' section and fill out the application form.";
      } else if (input.includes('meter')) {
        response = "You can view your meter readings and health status in the 'Meter Information' page.";
      } else if (input.includes('hi') || input.includes('hello') || input.includes('hey')) {
        response = "Hello! How can I assist you with your PowerGrid services today?";
      }

      const botMsg = { id: Date.now() + 1, text: response, sender: 'bot', time: new Date() };
      setChatMessages(prev => [...prev, botMsg]);
      setChatLoading(false);
    }, 1000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await supportAPI.createTicket(form);
      toast.success('Support ticket created!');
      setNewTicketModal(false);
      setForm({ subject: '', category: 'general', description: '' });
      loadData();
    } catch (err) {
      toast.error('Failed to create ticket');
    } finally {
      setSaving(false);
    }
  };

  const openTicket = (t) => {
    setSelectedTicket(t);
    setViewTicketModal(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    try {
      // Simulate sending message
      const updated = {
        ...selectedTicket,
        messages: [...(selectedTicket.messages || []), {
          _id: Date.now().toString(),
          text: msg,
          sender: { name: 'You', role: 'consumer' },
          createdAt: new Date().toISOString()
        }]
      };
      setSelectedTicket(updated);
      setTickets(tickets.map(t => t._id === updated._id ? updated : t));
      setMsg('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="support-page">
      <div className="page-header">
        <h1>Help & Support</h1>
        <p>Get assistance with your account and services</p>
      </div>

      <div className="support-tabs">
        <button className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
          <FiFileText /> My Tickets
        </button>
        <button className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => setActiveTab('faq')}>
          <FiHelpCircle /> FAQs
        </button>
        <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
          <FiMessageCircle /> AI Chatbot
        </button>
      </div>

      {activeTab === 'tickets' && (
        <div className="tickets-section">
          <div className="card-header-row">
            <h3>Support Tickets</h3>
            <button className="btn btn--primary" onClick={() => setNewTicketModal(true)}><FiPlus /> New Ticket</button>
          </div>
          
          <div className="tickets-list">
            {tickets.length === 0 ? (
              <div className="empty-msg">No support tickets found</div>
            ) : tickets.map(t => (
              <div key={t._id} className="card ticket-item" onClick={() => openTicket(t)}>
                <div className="ti-info">
                  <div className="ti-header">
                    <h4>{t.subject}</h4>
                    <Badge value={t.status} />
                  </div>
                  <p>{t.description.substring(0, 80)}...</p>
                  <div className="ti-meta">
                    <span>ID: #{t._id.slice(-6).toUpperCase()}</span>
                    <span>Category: {t.category}</span>
                    <span>Last Update: {new Date(t.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <FiArrowRight className="ti-arrow" />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="faq-section">
          <div className="faq-grid">
            {FAQS.map((f, i) => (
              <div key={i} className="card faq-item">
                <h4>{f.q}</h4>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
          <div className="contact-support-card card">
            <h3>Still need help?</h3>
            <p>Our support team is available 24/7 to assist you.</p>
            <div className="contact-options">
              <div className="co-item"><FiPhone /> <span>118 (Toll Free)</span></div>
              <div className="co-item"><FiMail /> <span>support@powergrid.com</span></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="ai-chat-section card">
          <div className="chat-header">
            <div className="bot-avatar"><FiZap /></div>
            <div>
              <h4>PowerGrid AI Assistant</h4>
              <p><span className="dot green"></span> Online</p>
            </div>
          </div>
          <div className="chat-body">
            {chatMessages.map(m => (
              <div key={m.id} className={`msg-bubble ${m.sender}`}>
                <div className="msg-text">{m.text}</div>
                <div className="msg-time">{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            ))}
            {chatLoading && (
              <div className="msg-bubble bot loading">
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} className="chat-footer">
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
            />
            <button type="submit" className="icon-btn blue" disabled={!chatInput.trim() || chatLoading}>
              <FiSend />
            </button>
          </form>
        </div>
      )}

      {/* New Ticket Modal */}
      <Modal open={newTicketModal} onClose={() => setNewTicketModal(false)} title="Create Support Ticket" width="500px">
        <form onSubmit={handleCreate} className="support-form">
          <div className="form-group">
            <label>Subject</label>
            <input 
              type="text" 
              placeholder="What do you need help with?"
              value={form.subject}
              onChange={(e) => setForm({...form, subject: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
              <option value="general">General Inquiry</option>
              <option value="billing">Billing Issue</option>
              <option value="technical">Technical Support</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              placeholder="Describe your issue in detail..."
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              required
              rows={5}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn--light" onClick={() => setNewTicketModal(false)}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Ticket Modal */}
      <Modal open={viewTicketModal} onClose={() => setViewTicketModal(false)} title="Ticket Conversation" width="600px">
        {selectedTicket && (
          <div className="ticket-view">
            <div className="tv-header">
              <h3>{selectedTicket.subject}</h3>
              <Badge value={selectedTicket.status} />
            </div>
            <div className="tv-chat">
              <div className="msg-item initial">
                <div className="msg-sender">You &bull; {new Date(selectedTicket.createdAt).toLocaleString()}</div>
                <div className="msg-text">{selectedTicket.description}</div>
              </div>
              {selectedTicket.messages?.map(m => (
                <div key={m._id} className={`msg-item ${m.sender.role}`}>
                  <div className="msg-sender">{m.sender.name} &bull; {new Date(m.createdAt).toLocaleString()}</div>
                  <div className="msg-text">{m.text}</div>
                </div>
              ))}
            </div>
            {selectedTicket.status !== 'closed' && (
              <form onSubmit={handleSendMessage} className="tv-footer">
                <input 
                  type="text" 
                  placeholder="Type a reply..." 
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                />
                <button type="submit" className="icon-btn blue"><FiSend /></button>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
