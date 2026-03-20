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

