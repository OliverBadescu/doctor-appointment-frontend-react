import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, IconButton, Typography, Grid, Toolbar, AppBar,
  FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon, Warning as WarningIcon } from '@mui/icons-material';
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
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

      
      const clinicMap = {};
      (clinicsRes.body.list || []).forEach(clinic => {
        clinicMap[clinic.id] = clinic.name;
      });

      
      const doctorsWithClinicNames = (doctorsRes.body.list || []).map(doctor => ({
        ...doctor,
        clinicName: doctor.clinic.id ? clinicMap[doctor.clinic.id] : 'Not Assigned'
      }));

      setRows(doctorsWithClinicNames);
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
      clinic: row.clinicId?.toString() || ''
    }); 
    setErrors({});
    setOpen(true); 
  };

  const close = () => setOpen(false);
  
  const openDeleteDialog = (id, name) => () => {
    setDoctorToDelete({ id, name });
    setDeleteDialogOpen(true);
  };
  
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDoctorToDelete(null);
  };
  
  const confirmDelete = async () => {
    if (doctorToDelete) {
      try {
        await deleteDoctor(doctorToDelete.id);
        closeDeleteDialog();
        fetchData();
      } catch (error) {
        console.error("Error deleting doctor:", error);
        alert("Failed to delete doctor. Please try again.");
        closeDeleteDialog();
      }
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
    
      const doctorData = {
        fullName: form.fullName,
        password: form.password,
        email: form.email,
        specialization: form.specialization,
        phone: form.phone,
        clinicId: parseInt(form.clinic, 10)
      };
      
      
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
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={openDeleteDialog(p.row.id, p.row.fullName)} showInMenu />
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
                helperText={errors.password}
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
                <InputLabel id="clinic-select-label">Clinic </InputLabel>
                <Select
                  labelId="clinic-select-label"
                  id="clinic-select"
                  name="clinic"
                  value={form.clinic}
                  label="Clinic"
                  onChange={handleChange}
                  sx={{ width: '100%', minWidth: '200px' }}
                  displayEmpty
                >
                  <MenuItem value="" disabled></MenuItem>
                  {clinics.map((clinic) => (
                    <MenuItem key={clinic.id} value={clinic.id.toString()}>
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

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete Dr. {doctorToDelete?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}