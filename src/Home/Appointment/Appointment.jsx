

export default function Appointment(appointmentEntity){

    let appointment = appointmentEntity.appointment;

    console.log(appointment);
    return (
        <tr>
        <td>{appointment.start}</td>
        <td>{appointment.end}</td>
        <td>{appointment.doctor.fullName}</td>
        <td>{appointment.doctor.clinic.name}</td>
        <button className="appointments-button" >Edit Appointment</button>
    </tr>
    )
}