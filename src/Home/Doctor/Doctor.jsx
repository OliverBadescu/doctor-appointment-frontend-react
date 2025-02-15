export default function Doctor({doctor}){

    

    return (
        <tr>
        <td>{doctor.fullName}</td>
        <td>{doctor.email}</td>
        <td>{doctor.phone}</td>
        <td>{doctor.specialization}</td>
        <td>{doctor.clinic.name}</td>
        <button className="clinic-button">Edit doctor</button>
    </tr>
    )
}