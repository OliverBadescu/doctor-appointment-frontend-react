import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Typography,
  Grid,
  Toolbar,
  AppBar,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import {
  getAllClinic,
  createClinic,
  updateClinic,
  deleteClinic,
} from '../../services/api/clinicService';

export default function ClinicsPageAdmin() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);
  const [formValues, setFormValues] = useState({ name: '', address: '' });

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const res = await getAllClinic();
      setClinics(res.body.list || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleOpenCreate = () => {
    setEditingClinic(null);
    setFormValues({ name: '', address: '' });
    setOpenDialog(true);
  };
  const handleOpenEdit = (clinic) => () => {
    setEditingClinic(clinic);
    setFormValues({ name: clinic.name, address: clinic.address });
    setOpenDialog(true);
  };
  const handleClose = () => setOpenDialog(false);

  const handleDelete = (id) => async () => {
    if (!window.confirm('Delete this clinic?')) return;
    await deleteClinic(id);
    fetchClinics();
  };

  const handleSubmit = async () => {
    if (editingClinic) {
      await updateClinic(editingClinic.id, formValues);
    } else {
      await createClinic(formValues);
    }
    fetchClinics();
    handleClose();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 2 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={handleOpenEdit(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={handleDelete(params.id)} showInMenu />,
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Clinics</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add Clinic
        </Button>
      </Box>

      <DataGrid
        rows={clinics}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        loading={loading}
        disableSelectionOnClick
        autoHeight
      />

      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
        <AppBar position="relative">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
              {editingClinic ? 'Edit Clinic' : 'Add Clinic'}
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogTitle>{editingClinic ? 'Edit Clinic' : 'New Clinic'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formValues.name}
                onChange={(e) => setFormValues((v) => ({ ...v, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formValues.address}
                onChange={(e) => setFormValues((v) => ({ ...v, address: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingClinic ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
