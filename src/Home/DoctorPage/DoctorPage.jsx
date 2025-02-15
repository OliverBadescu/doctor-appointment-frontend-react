import { getAllDoctors } from "../../services/doctorService";
import { useEffect, useState } from "react"
import Spinner from 'react-bootstrap/Spinner';
import { Alert } from 'antd';
import Doctor from "../Doctor/Doctor";
import { useNavigate } from 'react-router-dom';


export default function DoctorPage(){

    let [doctors, setDoctors] = useState([]);
    let [loading, setLoading] = useState(false);
    const [error, setError] = useState([]);

    const [showA, setShowA] = useState(true);
    const toggleShowA = () => setShowA(!showA);

    const navigate = useNavigate();

    const handleNavigation = (event, path) => {
        event.preventDefault(); 
        navigate(path);
        
    };
    
    const fetchDoctors = async () =>{
        setLoading(true);
        
        const newErrors = [];

        try{
            const response = await getAllDoctors();
            if(response.success && response.body?.list){
                setDoctors(response.body.list);
            }else{
                newErrors.push("Failed to fetch doctors");
            }
        }catch (err){
            newErrors.push(err.message);
        }finally{
            setLoading(false);
        }

        setError(newErrors);
    }


    useEffect(() => {

        fetchDoctors();

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
                        description="Doctors loaded succesfully"
                        type="success"
                        showIcon
                        closable
                        />
                    )
               }
        </div>
            <h1>Doctor</h1>
            <div className="button-container"> 
                <button className="button">Create New Doctor</button>
                <button className="cancel-button"  onClick={(event) => handleNavigation(event, '/Home')}>Cancel</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Specialization</th>
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
                        !loading && doctors.length > 0 &&
                        doctors.map((dc) => <Doctor key={dc.id} doctor={dc} />)
                    }

                    
                </tbody>
            </table>

            
        </>
    )
}