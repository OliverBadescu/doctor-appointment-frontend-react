import { useNavigate } from 'react-router-dom';



export default function Patient({patient}){

    const navigate = useNavigate();

    const handleNavigation = (event, path) => {
        event.preventDefault();
        navigate(path);
      };

    return (
        <tr>
        <td>
            <a href="#">{patient.fullName}</a>
        </td>
        <td>{patient.email}</td>
        <td>{patient.phone}</td>
        <button className="appointments-button" onClick={(event) => handleNavigation(event, `/appointment-page/${patient.id}`)}>View appointments</button>
    </tr>
    )
}