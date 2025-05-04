import {loadConfig} from "./load.jsx";

async function  api(path, method = 'GET', body = null) {
  const { API_BASE } = await loadConfig();
  const base = `${API_BASE.replace(/\/$/, '')}/appointment`;
  const url  = `${base}/${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return fetch(url, options);
}

async function request(path, method = 'GET', body = null) {
  try {
    const response = await api(path, method, body);
    const data = await response.json().catch(() => null);

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        status: response.status,
        body: data
      };
    }

    const errorMessage = (data && data.message) || response.statusText || 'Request failed';
    return {
      success: false,
      status: response.status,
      message: errorMessage
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Something went wrong',
    };
  }
}

export function getAllPatientAppointments(patientId) {
  return request(`patient/${patientId}`, 'GET');
}

export function getAppointmentById(appointmentId) {
  return request(`${appointmentId}`, 'GET');
}

export function createAppointment(appointmentData) {
  return request('addAppointment', 'POST', appointmentData);
}

export function updateAppointment(appointmentId, updateData) {
  return request(`${appointmentId}`, 'PUT', updateData);
}

export function deleteAppointment(appointmentId) {
  return request(`${appointmentId}`, 'DELETE');
}

export function deletePatientAppointment(patientId, appointmentId) {
  return request(`patient/${patientId}/${appointmentId}`, 'DELETE');
}

export function getDoctorAppointments(doctorId) {
  return request(`doctor/${doctorId}`, 'GET');
}

export function getTotalAppointments(){
  return request('getTotalAppointments', 'GET');
}