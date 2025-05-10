import {request} from "./api-utils.jsx";


  const baseUrl = "doctor";

  export function getAllDoctors(){
    return request(baseUrl+'/getAllDoctors', 'GET');
  }

  export function login(loginRequest){
    return request(baseUrl+'/login/doctor', 'POST', loginRequest);
  }

  export function getAllDoctorAppointments(doctorId){
   return request(baseUrl+`/getAllDoctorAppointments/${doctorId}`, "GET");
  }

  export function getDoctorAvailability(date, doctorId){
    const data = { getDate: date };
    return request(baseUrl+`/available/${doctorId}`, 'POST', data);
  }

  export function getTotalDoctors(){
    return request(baseUrl+'/getTotalDoctors', 'GET');
  }

  export function createDoctor(data){
    return request(baseUrl+'/addDoctor', 'POST', data);

  }

  export function deleteDoctor(id){ 
    return request(baseUrl+`/deleteDoctor/${id}`, 'DELETE')

  }

  export function updateDoctor(id, data){
    return request(baseUrl+`/updateDoctor/${id}`, 'PUT', data);
    
  }