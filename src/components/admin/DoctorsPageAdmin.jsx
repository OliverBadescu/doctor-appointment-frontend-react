import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../services/state/userState';
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
  const { isAuthReady } = useContext(UserContext);
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


      setClinics(clinicsRes.body.list || []);
      const doctorsWithClinicNames = (doctorsRes.body.list || []).map(doctor => ({
        ...doctor,
        clinicName: doctor.clinic.id ? clinicMap[doctor.clinic.id] : 'Neatribuit'
      }));


      setRows(doctorsWithClinicNames);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthReady) return;
    fetchData();
  }, [isAuthReady]);

  const validateForm = () => {
    const newErrors = {};
    const fields = ['fullName', 'password', 'email', 'specialization', 'phone', 'clinic'];
    
    fields.forEach(field => {
      if (!form[field]) {
        const fieldLabels = { fullName: 'Nume complet', password: 'Parolă', email: 'Email', specialization: 'Specializare', phone: 'Telefon', clinic: 'Clinică' };
        newErrors[field] = `Câmpul "${fieldLabels[field] || field}" este obligatoriu`;
      }
    });

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Te rugăm să introduci o adresă de email validă';
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
        alert("Ștergerea doctorului a eșuat. Te rugăm să încerci din nou.");
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
      alert("Salvarea doctorului a eșuat. Te rugăm să încerci din nou.");
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'fullName', headerName: 'Nume', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'specialization', headerName: 'Specializare', flex: 1 },
    { field: 'phone', headerName: 'Telefon', width: 150 },
    { field: 'clinicName', headerName: 'Clinică', width: 180 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acțiuni',
      width: 120,
      getActions: (p) => [
        <GridActionsCellItem icon={<EditIcon />} label="Editează" onClick={openEdit(p.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Șterge" onClick={openDeleteDialog(p.row.id, p.row.fullName)} showInMenu />
      ]
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Doctori</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Adaugă doctor</Button>
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
              {editing ? 'Editează doctor' : 'Doctor nou'}
            </Typography>
          </Toolbar>
        </AppBar>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nume complet"
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
                label="Parolă"
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
                label="Telefon"
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
                label="Specializare"
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
                <InputLabel id="clinic-select-label">Clinică </InputLabel>
                <Select
                  labelId="clinic-select-label"
                  id="clinic-select"
                  name="clinic"
                  value={form.clinic}
                  label="Clinică"
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
          <Button onClick={close}>Anulează</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            {editing ? 'Salvează' : 'Creează'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} /> Confirmă ștergerea
        </DialogTitle>
        <DialogContent>
          <Typography>
            Sigur dorești să ștergi Dr. {doctorToDelete?.name}? Această acțiune nu poate fi anulată.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Anulează</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Șterge
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}