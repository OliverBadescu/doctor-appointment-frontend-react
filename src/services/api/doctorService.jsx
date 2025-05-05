import {loadConfig} from "./load.jsx";

async function api(path, method = 'GET', body = null) {
  const { API_BASE } = await loadConfig();
  const base = `${API_BASE.replace(/\/$/, '')}/doctor`;
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
  
      if (!response.ok) {
        const errorMessage =
          (data && data.message) || response.statusText || 'Request failed';
        throw new Error(Error `${response.status}: ${errorMessage}`);
      }
  
      return {
        success: true,
        status: response.status,
        body: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Something went wrong',
      };
    }
  }

  export function getAllDoctors(){
    return request('getAllDoctors', 'GET');
  }

  export function login(loginRequest){
    return request('login/doctor', 'POST', loginRequest);
  }

  export function getAllDoctorAppointments(doctorId){
   return request(`getAllDoctorAppointments/${doctorId}`, "GET");
  }

  export function getDoctorAvailability(date, doctorId){
    const data = { getDate: date };
    return request(`available/${doctorId}`, 'POST', data);
  }

  export function getTotalDoctors(){
    return request('getTotalDoctors', 'GET');
  }

  export function createDoctor(data){
    return request('addDoctor', 'POST', data);

  }

  export function deleteDoctor(id){ 
    return request(`deleteDoctor/${id}`, 'DELETE')

  }

  export function updateDoctor(id, data){
    return request(`updateDoctor/${id}`, 'PUT', data);
    
  }