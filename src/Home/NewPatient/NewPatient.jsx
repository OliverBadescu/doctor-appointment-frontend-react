import { useEffect, useState } from "react"
import { createPatient } from "../../services/patientService";
import { Alert } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NewPatient(){

    const [addPatient, setAddPatient] = useState(false);

    const [formData, setFormData] = useState({
        fullName:'',
        email:'',
        password:'',
        phone:''
    });

    const [errors, setErrors] = useState([]);

    const navigate = useNavigate();

    const handleNavigation = (event, path) => {
        event.preventDefault(); 
        navigate(path);
        
    };

    const handleChange = (event) => {
        const{name, value} = event.target;

        setFormData((prevData) =>({
            ...prevData,
            [name]: value
        }))
    }

    const handleAddPatient = async(event) =>{
       
        event.preventDefault();
        setAddPatient(false);

        setErrors([]);

        const newErros=[];

        if(!formData.fullName.trim()){
            newErros.push("Full name is required");
        }
        if(!formData.email.trim()){
            newErros.push("Email is required");
        }
        if(!formData.password.trim()){
            newErros.push("Password is required");
        }
        if(!formData.phone.trim()){
            newErros.push("Phone is required");
        }

        if(newErros.length>0){
            setErrors(newErros);
            return;
        }
        try {
            let data = await createPatient(formData);
            setAddPatient(true);
            setFormData({
                fullName: '',
                email: '',
                password:'',
                phone: ''
            });
        } catch (error) {
            console.error("Error creating patient:", error);
            setErrors(["Failed to create patient. Please try again."]);
        }
    }

    

    return (
        <>{
               errors.length>0&&(
                    <div className = "alert-container add-patient-alert-container">
                        <Alert 
                        message="Error"
                        description={
                            <div>
                                {errors.map((error, index) => (
                                    <div key={index}>{error}</div> 
                                ))}
                            </div>
                        }
                        type="error"
                        showIcon
                        closable
                        onClose={() => setErrors([])}
                        />
                    </div>
               )
           }

           {
                addPatient &&(
                    <div className = "alert-container add-patient-alert-container">
                        <Alert
                        message="Success"
                        description="Patient added succesfully!"
                        type="success"
                        showIcon
                        closable
                        />
                    </div>
                )
           }
            <h1>New Patient</h1>
            <form>
           
                <p>
                    <label htmlFor="fullName">Full Name</label>
                    <input name="fullName" type="text" id="fullName-input" value={formData.fullName} onChange={handleChange} />
                </p>
                <p>
                    <label htmlFor="email">Email</label>
                    <input name="email" type="email" id="email-input" value={formData.email} onChange={handleChange} />
                </p>
                <p>
                    <label htmlFor="password">Password</label>
                    <input name="password" type="password" id="password-input" value={formData.password} onChange={handleChange} />
                </p>
                <p>
                    <label htmlFor="phone">Phone</label>
                    <input name="phone" type="number" id="phone-input" value={formData.phone} onChange={handleChange} />
                </p>
                <div className="button-container">
                    <button className="create-patient-button" onClick={handleAddPatient}>Create New Patient</button>
                    <button className="cancel-button"  onClick={(event) => handleNavigation(event, '/Home')}>Cancel</button>
                </div>
            </form>
        </>
    );

}