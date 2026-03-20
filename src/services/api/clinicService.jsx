import {request} from "./api-utils.jsx";



const baseUrl = "clinic";

    export function getAllClinic(){
      return request(baseUrl+'/getAllClinics', 'GET');
    }

