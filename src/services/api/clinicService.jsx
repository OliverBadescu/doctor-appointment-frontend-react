import {loadConfig} from "./load.jsx";

async function api(path, method = 'GET', body = null) {
  const { API_BASE } = await loadConfig();
  const base = `${API_BASE.replace(/\/$/, '')}/clinic`;
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

    export function getAllClinic(){
      return request('getAllClinics', 'GET');
    }

    export function getTotalClinics(){

      return request('getTotalClinics', 'GET');
    }

    export function createClinic(data){
      return request('createClinic', 'POST', data);
    }

    
    export function deleteClinic(id){
      
      const intId = parseInt(id, 10);
      
      
      if (isNaN(intId)) {
        return Promise.reject(new Error('Invalid clinic ID'));
      }
      
      return request(`deleteClinic/${intId}`, 'DELETE');
    }

    export function updateClinic(id, data){
      return request(`updateClinic/${id}`, 'PUT', data);

    }