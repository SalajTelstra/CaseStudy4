import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgentDashboard.css';
import api from '../api'; // Ensure this is correctly configured for your API
import { UserContext } from "../UserContext";
import TicketModal from './TicketModal';

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const { user, ready } = useContext(UserContext);
  const navigate = useNavigate();

  const categoryOrder = {
    'Technical': 1,
    'Billing': 2,
    'General': 3,
    'Product': 4,
    'All': 5
  };

  const categories = ['All', 'Technical', 'Billing', 'General', 'Product'];

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate('/');
      return;
    }
    setLoading(true);
    setError(null);
    fetchTickets();
  }, [user, ready, navigate]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const fetchTickets = async () => {
    try {
      const response = await api.get(`/tickets/assigned/${user._id}`);
      const sortedTickets = response.data.sort((a, b) => {
        if (a.category === b.category) return 0;
        return (categoryOrder[a.category] || 999) - (categoryOrder[b.category] || 999);
      });
      setTickets(sortedTickets);
    } catch (error) {
      setError('Error fetching tickets.');
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    fetchTickets();
    setShowModal(false);
    setSelectedTicket(null);
  };

  const handleTicketAction = (action) => {
    // Logic to handle the ticket action, e.g., update ticket status
    handleCloseModal(); 
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesCategory = selectedCategory === 'All' || ticket.category === selectedCategory;
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && ticket.status !== 'Resolved'; // Exclude resolved tickets
  });

  const resolvedTickets = tickets.filter(ticket => ticket.status === 'Resolved'); // Filter resolved tickets

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-sticky">
          <ul className="nav-list">
            <li className="nav-item">
              <a className="nav-link" href="#my-tickets">My Tickets</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#all-tickets">All Tickets</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#customers">Customers</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#reports">Reports</a>
            </li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        <div className="header">
          <h2>Agent Home Page</h2>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>

        {/* Search Bar */}
        <div className="search-bar-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search tickets"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="search-button">Search</button>
        </div>
        <br></br>

        {/* Category Dropdown */}
        <div className="dropdown-container">
          <label htmlFor="category-select">Filter by Category:</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="category-dropdown"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <br></br>

        {/* All Tickets Section */}
        <div id="all-tickets" className="card">
          <div className="card-header">
            <h5>All Tickets</h5>
          </div>
          <br></br>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket Number</th>
                  <th>Customer Name</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date Created</th>
                  <th>View Ticket</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map(ticket => (
                    <tr key={ticket._id}>
                      <td>{ticket._id}</td>
                      <td>{ticket.customer.name}</td>
                      <td>{ticket.title}</td>
                      <td>{ticket.category}</td>
                      <td>{ticket.status}</td>
                      <td>{new Date(ticket.createdAt).toLocaleDateString('en-US')}</td>
                      <td><button onClick={() => handleViewTicket(ticket)}>View</button></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No tickets available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reports Section - Resolved Tickets */}
        <div id="reports" className="card">
          <div className="card-header">
            <h5>Reports - Resolved Tickets</h5>
          </div>
          <br></br>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket Number</th>
                  <th>Customer Name</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Date Resolved</th>
                </tr>
              </thead>
              <tbody>
                {resolvedTickets.length > 0 ? (
                  resolvedTickets.map(ticket => (
                    <tr key={ticket._id}>
                      <td>{ticket._id}</td>
                      <td>{ticket.customer.name}</td>
                      <td>{ticket.title}</td>
                      <td>{ticket.category}</td>
                      <td>{new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No resolved tickets</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <TicketModal
            ticket={selectedTicket}
            onClose={handleCloseModal}
            onAction={handleTicketAction}
          />
        )}
      </main>
    </div>
  );
};

export default AgentDashboard;
