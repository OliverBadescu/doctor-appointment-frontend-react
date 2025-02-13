



export default function Patient({patient}){


    const handleViewAppointmentsButton = (event) =>{

        event.preventDefault();

    }

    return (
        <tr>
        <td>
            <a href="#">{patient.fullName}</a>
        </td>
        <td>{patient.email}</td>
        <td>{patient.phone}</td>
        <button className="appointments-button" onClick={handleViewAppointmentsButton}>View appointments</button>
    </tr>
    )
}