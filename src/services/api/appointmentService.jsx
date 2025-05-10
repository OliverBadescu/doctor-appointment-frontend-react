import {request} from "./api-utils.jsx";


const baseUrl = "appointment"

export function getAllPatientAppointments(patientId) {
  return request(baseUrl+`/patient/${patientId}`, 'GET');
}

export function getAppointmentById(appointmentId) {
  return request(baseUrl+`/getAppointment/${appointmentId}`, 'GET');
}

export function createAppointment(appointmentData) {
  return request(baseUrl+'/addAppointment', 'POST', appointmentData);
}

export function updateAppointment(appointmentId, updateData) {
  return request(baseUrl+`/updateAppointment/${appointmentId}`, 'PUT', updateData);
}

export function deleteAppointment(appointmentId) {
  return request(baseUrl+`/deleteAppointment/${appointmentId}`, 'DELETE');
}

export function deletePatientAppointment(patientId, appointmentId) {
  return request(baseUrl+`/patient/${patientId}/${appointmentId}`, 'DELETE');
}

export function getDoctorAppointments(doctorId) {
  return request(baseUrl+`/doctor/${doctorId}`, 'GET');
}

export function getTotalAppointments(){
  return request(baseUrl+'/getTotalAppointments', 'GET');
}

export function updateStatus(status, appointmentId){
  return request(baseUrl+`/updateStatus/${appointmentId}`, 'PUT', status);
}