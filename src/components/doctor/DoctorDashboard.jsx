import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../services/state/doctorContext';
import { getAllDoctorAppointments } from '../../services/api/doctorService';

export default function DoctorDashboard() {
    const { doctor } = useContext(DoctorContext);
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState({
        upcoming: 0,
        today: 0,
        thisWeek: 0,
        completed: 0
    });

    useEffect(() => {
        if (!doctor || doctor.id === 0) {
            navigate('/login');
            return;
        }

        
        if (doctor.userRole !== 'DOCTOR') {
            navigate('/unauthorized');
            return;
        }

        const fetchAppointments = async () => {
            setLoading(true);
            try {
                const response = await getAllDoctorAppointments(doctor.id);
                if (response.success) {
                    const appointmentsList = response.body.list || [];
                    setAppointments(appointmentsList);
                    calculateStats(appointmentsList);
                } else {
                    setError("Failed to load appointments");
                    console.error("Error fetching appointments:", response.message);
                }
            } catch (err) {
                setError("An error occurred while fetching appointments");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [doctor, navigate]);

    const calculateStats = (appointmentsList) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

        const stats = {
            upcoming: 0,
            today: 0,
            thisWeek: 0,
            completed: 0
        };

        appointmentsList.forEach(appointment => {
            const appointmentDate = new Date(appointment.start.replace(" ", "T"));

            if (appointment.status === 'completed') {
                stats.completed++;
            } else if (appointment.status !== 'cancelled') {
                stats.upcoming++;

                if (appointmentDate.getDate() === today.getDate() &&
                    appointmentDate.getMonth() === today.getMonth() &&
                    appointmentDate.getFullYear() === today.getFullYear()) {
                    stats.today++;
                }

    
                if (appointmentDate >= today && appointmentDate <= endOfWeek) {
                    stats.thisWeek++;
                }
            }
        });

        setStats(stats);
    };

    const getFilteredAppointments = () => {
        if (filter === 'all') {
            return appointments;
        }

        return appointments.filter(appointment => appointment.status === filter);
    };


    if (loading) {
        return (
            <div className="loading animate-fadeIn">
                Loading your appointments...
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message animate-fadeIn">
                {error}
            </div>
        );
    }

    const filteredAppointments = getFilteredAppointments();

    return (
        <div className="doctor-dashboard-container animate-fadeIn">
            <div className="header-section animate-slideUp">
                <div className="user-welcome">
                    <h1 className="welcome-title animate-fadeIn">
                        Welcome, Dr. {doctor.fullName}
                    </h1>
                    <p className="welcome-subtitle animate-fadeIn delay-50">
                        Manage your patient appointments and schedule
                    </p>
                </div>
            </div>

            <div className="dashboard-stats animate-fadeIn delay-150">
                <div className="stat-card animate-slideUp">
                    <div className="stat-header">
                        <div className="stat-title">Today&#39;s Appointments</div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.today}</div>
                    </div>
                </div>

                <div className="stat-card animate-slideUp delay-50">
                    <div className="stat-header">
                        <div className="stat-title">This Week</div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.thisWeek}</div>
                    </div>
                </div>

                <div className="stat-card animate-slideUp delay-100">
                    <div className="stat-header">
                        <div className="stat-title">Upcoming Total</div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.upcoming}</div>
                    </div>
                </div>

                <div className="stat-card animate-slideUp delay-150">
                    <div className="stat-header">
                        <div className="stat-title">Completed</div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.completed}</div>
                    </div>
                </div>
            </div>

            <div className="appointments-section animate-fadeIn delay-200">
                <div className="section-header">
                    <h2 className="section-title">Appointments</h2>
                    <div className="filter-controls">
                        <button
                            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-button ${filter === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setFilter('upcoming')}
                        >
                            Upcoming
                        </button>
                        <button
                            className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                        <button
                            className={`filter-button ${filter === 'cancelled' ? 'active' : ''}`}
                            onClick={() => setFilter('cancelled')}
                        >
                            Cancelled
                        </button>
                    </div>
                </div>

                {filteredAppointments.length > 0 ? (
                    <div className="appointment-list">
                        {filteredAppointments.map((appointment) => {
                            const startDate = new Date(appointment.start.replace(" ", "T"));
                            const endDate = new Date(appointment.end.replace(" ", "T"));
                            const isToday =
                                startDate.getDate() === new Date().getDate() &&
                                startDate.getMonth() === new Date().getMonth() &&
                                startDate.getFullYear() === new Date().getFullYear();

                            return (
                                <div
                                    key={appointment.id}
                                    className={`appointment-card animate-slideUp ${appointment.status}`}
                                >
                                    <div className="appointment-layout">
                                        <div className="appointment-details">
                                            <div className="appointment-header">
                                                <div>
                                                    <h3 className="patient-name">
                                                        {appointment.patient?.fullName || "Unknown Patient"}
                                                    </h3>
                                                    <p className="appointment-id">
                                                        ID: {appointment.id}
                                                    </p>
                                                </div>
                                                <div className="appointment-status">
                          <span className={`status-badge ${appointment.status}`}>
                            {appointment.status === 'upcoming' ? 'Upcoming' :
                                appointment.status === 'completed' ? 'Completed' :
                                    appointment.status === 'cancelled' ? 'Cancelled' :
                                        appointment.status || 'Scheduled'}
                          </span>
                                                    {isToday && <span className="today-badge">Today</span>}
                                                </div>
                                            </div>
                                            <p className="appointment-reason">
                                                {appointment.reason || "No reason provided"}
                                            </p>
                                            <div className="appointment-time-info">
                                                <div className="time-detail">
                                                    <p className="detail-label">Date</p>
                                                    <p className="detail-value">
                                                        {startDate.toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="time-detail">
                                                    <p className="detail-label">Time</p>
                                                    <p className="detail-value">
                                                        {startDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - {endDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                                    </p>
                                                </div>
                                                <div className="time-detail">
                                                    <p className="detail-label">Patient ID</p>
                                                    <p className="detail-value">
                                                        {appointment.patient?.id || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="appointment-actions">
                                            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                                                <>
                                                    <button
                                                        className="action-button complete-button animate-fadeIn delay-300"
                                                        onClick={() => updateStatus(appointment.id, 'completed')}
                                                    >
                                                        Mark Completed
                                                    </button>
                                                    <button
                                                        className="action-button cancel-button animate-fadeIn delay-350"
                                                        onClick={() => updateStatus(appointment.id, 'cancelled')}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            <Link to={`/patients/${appointment.patient?.id || 0}`}>
                                                <button className="action-button view-patient-button animate-fadeIn delay-400">
                                                    Patient Details
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-appointments animate-fadeIn delay-200">
                        <div className="empty-icon animate-fadeIn">
                        
                        </div>
                        <h3 className="empty-title animate-fadeIn delay-50">
                            No Appointments
                        </h3>
                        <p className="empty-message animate-fadeIn delay-100">
                            {filter === 'all'
                                ? "You don't have any appointments scheduled."
                                : `You don't have any ${filter} appointments.`}
                        </p>
                        <button
                            className="return-button animate-slideUp delay-150"
                            onClick={() => setFilter('all')}
                        >
                            View All Appointments
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}