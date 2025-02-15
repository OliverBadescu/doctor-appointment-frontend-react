


export default function Clinic({clinic}){

   

    return (
        <tr>
        <td>{clinic.name}</td>
        <td>{clinic.address}</td>
        <button className="clinic-button">Edit clinic</button>
    </tr>
    )
}