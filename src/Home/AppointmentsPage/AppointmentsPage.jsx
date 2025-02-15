import { useEffect, useState } from "react"
import Spinner from 'react-bootstrap/Spinner';
import { Alert } from 'antd';
import Patient from "../Patient/Patients";
import { getAllPatientAppointments } from "../../services/appointmentService";
import { useNavigate, useParams } from 'react-router-dom';
import Appointment from "../Appointment/Appointment";


export default function Appointments(){

    const { patientId } = useParams();

    let [appointments, setAppointments] = useState([]);
    let [loading, setLoading] = useState(false);
    const [error, setError] = useState([]);
    
    const [showA, setShowA] = useState(true);
    const toggleShowA = () => setShowA(!showA);
    
    const navigate = useNavigate();
    
    const handleNavigation = (event, path) => {
        event.preventDefault(); 
        navigate(path);
            
    };
        
    const fetchAppointments = async () =>{
        setLoading(true);
            
        const newErrors = [];
    
    try{
        const response = await getAllPatientAppointments(patientId);
        if(response.success && response.body?.appointments){
            setAppointments(response.body.appointments);
        }else{
            newErrors.push("Failed to fetch appointments");
        }
    }catch (err){
        newErrors.push(err.message);
    }finally{
        setLoading(false);
    }
        setError(newErrors);
    }
    
    useEffect(() => {
        fetchAppointments();
    }, [])

    return (
        <> 
        <div className="alert-container">
                {
                    error.length > 0&&(
                       <Alert 
                       message="Error"
                       description={error}
                       type="error"
                       showIcon
                       closable
                       />
                   )
               }
               {
                    error.length == 0 && !loading &&(
                        <Alert
                        message="Success"
                        description="Appointments loaded succesfully"
                        type="success"
                        showIcon
                        closable
                        />
                    )
               }
        </div>
            <h1>Appointments</h1>
            <p><a className="button" onClick={(event) => handleNavigation(event, '/new-patient')}>Create New Appointment</a> <a className="button" onClick={(event) => handleNavigation(event, '/Home')}>Cancel</a> </p>
            <table>
                <thead>
                    <tr>
                        <th>Start</th>
                        <th>End</th>
                        <th>Doctor</th>
                        <th>Clinic</th>
                    </tr>
                </thead>
                <tbody>

                    {
                        loading&&(
                            <tr>
                                <td colSpan={4}>
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </td>
                            </tr>
                        )
                    }
                   
                    {
                        !loading && appointments.length > 0 &&
                        appointments.map((ap) => <Appointment key={ap.id} appointment={ap} />)
                    }

                    
                </tbody>
            </table>

            
        </>
    )


}