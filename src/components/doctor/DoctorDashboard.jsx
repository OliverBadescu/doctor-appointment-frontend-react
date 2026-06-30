import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../services/state/doctorContext';
import { getAllDoctorAppointments } from '../../services/api/doctorService';
import { getAllPatientAppointments, updateStatus } from '../../services/api/appointmentService';

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
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });

    const [showModal, setShowModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientAppointments, setPatientAppointments] = useState([]);
    const [loadingPatientHistory, setLoadingPatientHistory] = useState(false);
    const [patientHistoryError, setPatientHistoryError] = useState(null);

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
                    const raw = response.body.list || [];
                    const normalized = raw.map(app => ({
                      ...app,
                      status: app.status.toLowerCase()
                    }));
                    setAppointments(normalized);
                    calculateStats(normalized);
                  } else {
                    setError("Încărcarea programărilor a eșuat");
                    console.error("Error fetching appointments:", response.message);
                }
            } catch (err) {
                setError("A apărut o eroare la încărcarea programărilor");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [doctor, navigate]);

    useEffect(() => {
        
        if (updateMessage.text) {
            const timer = setTimeout(() => {
                setUpdateMessage({ text: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [updateMessage]);

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
        if (filter === 'all') return appointments;
        return appointments.filter(app => app.status.toLowerCase() === filter);
      };
      

    const handleOpenPatientModal = async (patientId, patientName) => {
        setSelectedPatient({ id: patientId, name: patientName });
        setShowModal(true);
        setLoadingPatientHistory(true);
        setPatientHistoryError(null);
        
        try {
           
            const response = await getAllPatientAppointments(patientId);

            console.log(response);
            if (response.success) {
                const raw = response.body.appointments || [];
                const normalized = raw.map(app => ({
                    ...app,
                    status: app.status.toLowerCase()
                }));
                setPatientAppointments(normalized);
            } else {
                setPatientHistoryError("Încărcarea istoricului pacientului a eșuat");
                console.error("Error fetching patient history:", response.message);
            }
        } catch (err) {
            setPatientHistoryError("A apărut o eroare la încărcarea istoricului pacientului");
            console.error(err);
        } finally {
            setLoadingPatientHistory(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPatient(null);
        setPatientAppointments([]);
        setPatientHistoryError(null);
    };

    const handleUpdateStatus = async (appointmentId, newStatus) => {
        setStatusUpdating(true);
        
        
        const statusForBackend = newStatus.toUpperCase();
        
        try {
            const response = await updateStatus({status:statusForBackend},appointmentId );
            
            if (response.success) {
            
                const updatedAppointments = appointments.map(appointment => {
                    if (appointment.id === appointmentId) {
                        return { ...appointment, status: newStatus.toLowerCase() };
                    }
                    return appointment;
                });
                
                setAppointments(updatedAppointments);
                calculateStats(updatedAppointments);
                
                setUpdateMessage({
                    text: `Statusul programării a fost actualizat la ${newStatus}`,
                    type: 'success'
                });
                
            } else {
                setUpdateMessage({
                    text: `Actualizarea statusului a eșuat: ${response.message}`,
                    type: 'error'
                });
                console.error("Error updating appointment status:", response.message);
            }
        } catch (err) {
            setUpdateMessage({
                text: "A apărut o eroare la actualizarea statusului",
                type: 'error'
            });
            console.error("Exception during status update:", err);
        } finally {
            setStatusUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="loading animate-fadeIn">
                Se încarcă programările tale...
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
                        Bun venit, Dr. {doctor.fullName}
                    </h1>
                    <p className="welcome-subtitle animate-fadeIn delay-50">
                        Gestionează programările și orarul pacienților
                    </p>
                </div>
            </div>

            {updateMessage.text && (
                <div className={`status-message ${updateMessage.type} animate-fadeIn`}>
                    {updateMessage.text}
                </div>
            )}

            <div className="dashboard-stats animate-fadeIn delay-150">
                <div className="stat-card animate-slideUp">
                    <div className="stat-header">
                        <div className="stat-title">Programările de astăzi</div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.today}</div>
                    </div>
                </div>

                <div className="stat-card animate-slideUp delay-50">
                    <div className="stat-header">
                        <div className="stat-title">Săptămâna aceasta</div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.thisWeek}</div>
                    </div>
                </div>

                <div className="stat-card animate-slideUp delay-100">
                    <div className="stat-header">
                        <div className="stat-title">Total viitoare</div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.upcoming}</div>
                    </div>
                </div>

                <div className="stat-card animate-slideUp delay-150">
                    <div className="stat-header">
                        <div className="stat-title">Finalizată</div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.completed}</div>
                    </div>
                </div>
            </div>

            <div className="appointments-section animate-fadeIn delay-200">
                <div className="section-header">
                    <h2 className="section-title">Programări</h2>
                    <div className="filter-controls">
                        <button
                            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Toate
                        </button>
                        <button
                            className={`filter-button ${filter === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setFilter('upcoming')}
                        >
                            Viitoare
                        </button>
                        <button
                            className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Finalizată
                        </button>
                        <button
                            className={`filter-button ${filter === 'cancelled' ? 'active' : ''}`}
                            onClick={() => setFilter('cancelled')}
                        >
                            Anulată
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
                                                        {appointment.user?.fullName || "Pacient necunoscut"}
                                                    </h3>
                                                    <p className="appointment-id">
                                                        ID: {appointment.id}
                                                    </p>
                                                </div>
                                                <div className="appointment-status">
                                                    <span className={`status-badge ${appointment.status}`}>
                                                        {appointment.status === 'upcoming' ? 'Viitoare' :
                                                            appointment.status === 'completed' ? 'Finalizată' :
                                                            appointment.status === 'cancelled' ? 'Anulată' :
                                                            appointment.status || 'Programată'}
                                                    </span>
                                                    {isToday && <span className="today-badge">Astăzi</span>}
                                                </div>
                                            </div>
                                            <p className="appointment-reason">
                                                {appointment.reason || "Niciun motiv specificat"}
                                            </p>
                                            <div className="appointment-time-info">
                                                <div className="time-detail">
                                                    <p className="detail-label">Dată</p>
                                                    <p className="detail-value">
                                                        {startDate.toLocaleDateString('ro-RO', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="time-detail">
                                                    <p className="detail-label">Oră</p>
                                                    <p className="detail-value">
                                                        {startDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - {endDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                                    </p>
                                                </div>
                                                <div className="time-detail">
                                                    <p className="detail-label">ID pacient</p>
                                                    <p className="detail-value">
                                                        {appointment.user?.id || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="appointment-actions">
                                            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                                                <>
                                                    <button
                                                        className="action-button complete-button animate-fadeIn"
                                                        onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                                                        disabled={statusUpdating}
                                                    >
                                                        {statusUpdating ? 'Se actualizează...' : 'Marchează finalizată'}
                                                    </button>
                                                    <button
                                                        className="action-button cancel-button animate-fadeIn"
                                                        onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                                                        disabled={statusUpdating}
                                                    >
                                                        {statusUpdating ? 'Se actualizează...' : 'Anulează'}
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                className="action-button view-patient-button animate-fadeIn "
                                                onClick={() => handleOpenPatientModal(
                                                    appointment.user?.id || 0, 
                                                    appointment.user?.fullName || "Pacient necunoscut"
                                                )}
                                            >
                                                Detalii pacient
                                            </button>
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
                            Nicio programare
                        </h3>
                        <p className="empty-message animate-fadeIn delay-100">
                            {filter === 'all'
                                ? "Nu ai nicio programare planificată."
                                : `Nu ai nicio programare ${({ upcoming: 'viitoare', completed: 'finalizată', cancelled: 'anulată' }[filter] || filter)}.`}
                        </p>
                        <button
                            className="return-button animate-slideUp delay-150"
                            onClick={() => setFilter('all')}
                        >
                            Vezi toate programările
                        </button>
                    </div>
                )}
            </div>

           
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Istoric programări pacient - {selectedPatient?.name}</h2>
                            <button className="close-button" onClick={handleCloseModal}>×</button>
                        </div>
                        
                        <div className="modal-content">
                            {loadingPatientHistory ? (
                                <div className="loading-spinner">Se încarcă istoricul pacientului...</div>
                            ) : patientHistoryError ? (
                                <div className="error-message">{patientHistoryError}</div>
                            ) : patientAppointments.length === 0 ? (
                                <div className="empty-state">Nu s-au găsit programări anterioare pentru acest pacient.</div>
                            ) : (
                                <div className="patient-appointments-list">
                                    <h3>Programări anterioare</h3>
                                    <table className="appointments-table">
                                        <thead>
                                            <tr>
                                                <th>Dată</th>
                                                <th>Oră</th>
                                                <th>Motiv</th>
                                                <th>Status</th>
                                                <th>Doctor</th>
                    
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {patientAppointments.map((appointment) => {
                                                const appointmentDate = new Date(appointment.start.replace(" ", "T"));
                                                return (
                                                    <tr key={appointment.id} className={`appointment-row ${appointment.status}`}>
                                                        <td>{appointmentDate.toLocaleDateString('ro-RO', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}</td>
                                                        <td>{appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
                                                        <td>{appointment.reason || "Nespecificat"}</td>
                                                        <td>
                                                            <span className={`status-indicator ${appointment.status}`}>
                                                                {appointment.status === 'upcoming' ? 'Viitoare' :
                                                                 appointment.status === 'completed' ? 'Finalizată' :
                                                                 appointment.status === 'cancelled' ? 'Anulată' :
                                                                 appointment.status || 'Necunoscut'}
                                                            </span>
                                                        </td>
                                                        <td>{appointment.doctor?.fullName || "N/A"}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button className="modal-button secondary" onClick={handleCloseModal}>Închide</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}