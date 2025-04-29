import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, IconButton, Typography, Grid, Toolbar, AppBar,
  FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import {
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../../services/api/doctorService';
import { getAllClinic } from '../../services/api/clinicService';

export default function DoctorsPageAdmin() {
  const [rows, setRows] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    password: '',
    email: '',
    specialization: '',
    phone: '',
    clinic: ''
  });

  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [doctorsRes, clinicsRes] = await Promise.all([
        getAllDoctors(),
        getAllClinic()
      ]);

      setRows(doctorsRes.body.list || []);

      setClinics(clinicsRes.body.list || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const fields = ['fullName', 'password', 'email', 'specialization', 'phone', 'clinic'];
    
    fields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openCreate = () => { 
    setEditing(null); 
    setForm({ 
      fullName: '', 
      password: '', 
      email: '', 
      specialization: '', 
      phone: '', 
      clinic: '' 
    }); 
    setErrors({});
    setOpen(true); 
  };

  const openEdit = (row) => () => { 
    setEditing(row); 
    setForm({ 
      fullName: row.fullName || '', 
      password: '', 
      email: row.email || '', 
      specialization: row.specialization || '', 
      phone: row.phone || '', 
      clinic: row.clinic || ''
    }); 
    setErrors({});
    setOpen(true); 
  };

  const close = () => setOpen(false);
  
  const handleDelete = (id) => async () => { 
    if (!window.confirm('Delete this doctor?')) return; 
    try {
      await deleteDoctor(id); 
      fetchData();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      alert("Failed to delete doctor. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {

      const doctorData = { ...form };

      console.log(doctorData);
      
      if (doctorData.clinic) {
        doctorData.clinic = parseInt(doctorData.clinic, 10);
      }
      
      if (editing) {
        await updateDoctor(editing.id, doctorData);
      } else {

        await createDoctor(doctorData);
      }
      fetchData(); 
      close();
    } catch (error) {
      console.error("Error saving doctor:", error);
      alert("Failed to save doctor. Please try again.");
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'fullName', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'specialization', headerName: 'Specialization', flex: 1 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'clinicName', headerName: 'Clinic', width: 180 },
    { 
      field: 'actions', 
      type: 'actions', 
      headerName: 'Actions', 
      width: 120,
      getActions: (p) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={openEdit(p.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={handleDelete(p.id)} showInMenu />
      ]
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Doctors</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Doctor</Button>
      </Box>
      
      <DataGrid 
        rows={rows} 
        columns={columns} 
        loading={loading} 
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick 
        autoHeight
      />

      <Dialog open={open} onClose={close} fullWidth maxWidth="md">
        <AppBar position="relative">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={close}><CloseIcon/></IconButton>
            <Typography sx={{ml: 2, flex: 1}} variant="h6">
              {editing ? 'Edit Doctor' : 'New Doctor'}
            </Typography>
          </Toolbar>
        </AppBar>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password || (editing ? 'Leave blank to keep current password' : '')}
                required={!editing}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                error={!!errors.specialization}
                helperText={errors.specialization}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.clinic} required>
                <InputLabel id="clinic-select-label">Clinic</InputLabel>
                <Select
                  labelId="clinic-select-label"
                  id="clinic-select"
                  name="clinic"
                  value={form.clinic}
                  label="Clinic"
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>Select a clinic</MenuItem>
                  {clinics.map((clinic) => (
                    <MenuItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.clinic && <FormHelperText>{errors.clinic}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={close}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
          >
            {editing ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}