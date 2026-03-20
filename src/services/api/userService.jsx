import {request} from "./api-utils.jsx";


const baseUrl = "user";

export function login(loginRequest){
  return request(baseUrl+'/login', 'POST', loginRequest);
}

export function register(registerRequest){
  return request(baseUrl+'/register', 'POST', registerRequest);
}

export function getById(userId){
  return request (baseUrl+`/getUserById/${userId}`, 'GET');
}

export async function updateUser(userId, updateRequest){
  return request(baseUrl+`/update/${userId}`, 'PUT', updateRequest);
}

