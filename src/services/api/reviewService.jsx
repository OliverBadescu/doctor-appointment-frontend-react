import {request} from "./api-utils.jsx";


  const baseUrl = "review";

  export function getAllReviews(){
    return request(baseUrl+'/getAllReviews', 'GET');
  }

  export function addReview(data){
    return request(baseUrl + '/addReview', 'POST', data);
  }

  export function deleteReview(data, id){
    return request(baseUrl +`/updateReview/${id}`, 'PUT', data );
  }

  export function getReviewsByDoctorId(id){
    return request(baseUrl+ `/getByDoctorId/${id}`, 'GET');
  }