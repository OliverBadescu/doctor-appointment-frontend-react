import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../services/state/userState';
import { Grid, Card, CardContent, Box, Typography } from '@mui/material';
import { LineChart, PieChart } from '@mui/x-charts';
import {getTotalAppointments} from '../../services/api/appointmentService';
import { getTotalClinics } from '../../services/api/clinicService';
import { getTotalDoctors } from '../../services/api/doctorService';
import { totalUsers } from '../../services/api/userService';

export default function AdminHomePage() {
  const { isAuthReady } = useContext(UserContext);
  const [users, setUsers] = useState(0);
  const [doctors, setDoctors] = useState(0);
  const [clinics, setClinics] = useState(0);
  const [appointments, setAppointments] = useState(0);

  useEffect(() => {
    if (!isAuthReady) return;

    async function fetchData() {
      const u = await totalUsers();
      const d = await getTotalDoctors();
      const c = await getTotalClinics();
      const a = await getTotalAppointments();

      setUsers(u.body);
      setDoctors(d.body);
      setClinics(c.body);
      setAppointments(a.body);
    }
    fetchData();
  }, [isAuthReady]);

  const metrics = [
    { label: 'Users', value: users },
    { label: 'Doctors', value: doctors },
    { label: 'Clinics', value: clinics },
    { label: 'Appointments', value: appointments },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {metrics.map((m) => (
          <Grid item xs={12} sm={6} md={3} key={m.label}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{m.value}</Typography>
                <Typography color="textSecondary">{m.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

    
    </Box>
  );
}
