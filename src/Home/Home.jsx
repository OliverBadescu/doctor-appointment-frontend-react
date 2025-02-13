import { useEffect, useState } from "react"
import Spinner from 'react-bootstrap/Spinner';
import { Alert } from 'antd';
import Patient from "./Patient/Patients";
import { getAllPatients } from "../services/patientService";
import { useNavigate } from 'react-router-dom';



export default function Home() {


    let [patients, setPatients] = useState([]);
    let [loading, setLoading] = useState(false);
    const [error, setError] = useState([]);

    const [showA, setShowA] = useState(true);
    const toggleShowA = () => setShowA(!showA);

    const navigate = useNavigate();

    const handleNavigation = (event, path) => {
        event.preventDefault(); 
        navigate(path);
        
    };
    
    const fetchPatients = async () =>{
        setLoading(true);
        
        const newErrors = [];

        try{
            const response = await getAllPatients();
            if(response.success && response.body?.list){
                setPatients(response.body.list);
            }else{
                newErrors.push("Failed to fetch patients");
            }
        }catch (err){
            newErrors.push(err.message);
        }finally{
            setLoading(false);
        }

        setError(newErrors);
    }


    useEffect(() => {

        fetchPatients();

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
                        description="Patients loaded succesfully"
                        type="success"
                        showIcon
                        closable
                        />
                    )
               }
        </div>
            <h1>Patient</h1>
            <p><a className="button" onClick={(event) => handleNavigation(event, '/new-patient')}>Create New Patient</a></p>
            <table>
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone</th>
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
                        !loading && patients.length > 0 &&
                        patients.map((pa) => <Patient key={pa.id} patient={pa} />)
                    }

                    
                </tbody>
            </table>

            
        </>
    )

}