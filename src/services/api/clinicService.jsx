import {request} from "./api-utils.jsx";



const baseUrl = "clinic";

    export function getAllClinic(){
      return request(baseUrl+'/getAllClinics', 'GET');
    }

    export function getTotalClinics(){

      return request(baseUrl+'/getTotalClinics', 'GET');
    }

    export function createClinic(data){
      return request(baseUrl+'/createClinic', 'POST', data);
    }

    
    export function deleteClinic(id){
      
      const intId = parseInt(id, 10);
      
      
      if (isNaN(intId)) {
        return Promise.reject(new Error('Invalid clinic ID'));
      }
      
      return request(baseUrl+`/deleteClinic/${intId}`, 'DELETE');
    }

    export function updateClinic(id, data){
      return request(baseUrl+`/updateClinic/${id}`, 'PUT', data);

    }