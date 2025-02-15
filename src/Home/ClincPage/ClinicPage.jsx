import { getAllClinic } from "../../services/clinicService";
import Clinic from "../Clinic/Clinic";
import { useEffect, useState } from "react"
import Spinner from 'react-bootstrap/Spinner';
import { Alert } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function ClinicPage(){

    let [clinics, setClinics] = useState([]);
    let [loading, setLoading] = useState(false);
    const [error, setError] = useState([]);

    const [showA, setShowA] = useState(true);
    const toggleShowA = () => setShowA(!showA);

    const navigate = useNavigate();

    const handleNavigation = (event, path) => {
        event.preventDefault(); 
        navigate(path);
        
    };
    
    const fetchClinics = async () =>{
        setLoading(true);
        
        const newErrors = [];

        try{
            const response = await getAllClinic();
            if(response.success && response.body?.list){
                setClinics(response.body.list);
            }else{
                newErrors.push("Failed to fetch clinics");
            }
        }catch (err){
            newErrors.push(err.message);
        }finally{
            setLoading(false);
        }

        setError(newErrors);
    }


    useEffect(() => {

        fetchClinics();

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
                        description="Clinics loaded succesfully"
                        type="success"
                        showIcon
                        closable
                        />
                    )
               }
        </div>
            <h1>Clinic</h1>
            <div className="button-container"> 
                <button className="button" >Create New Clinic</button>
                <button className="cancel-button"  onClick={(event) => handleNavigation(event, '/Home')}>Cancel</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
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
                        !loading && clinics.length > 0 &&
                        clinics.map((cl) => <Clinic key={cl.id} clinic={cl} />)
                    }

                    
                </tbody>
            </table>

            
        </>
    )

    
}