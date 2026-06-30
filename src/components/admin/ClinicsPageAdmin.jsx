import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../services/state/userState';
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
  Warning as WarningIcon,
} from '@mui/icons-material';

import {
  getAllClinic,
  createClinic,
  updateClinic,
  deleteClinic,
} from '../../services/api/clinicService';

export default function ClinicsPageAdmin() {
  const { isAuthReady } = useContext(UserContext);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState(null);
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
    if (!isAuthReady) return;
    fetchClinics();
  }, [isAuthReady]);

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

  const openDeleteDialog = (id, name) => () => {
    setClinicToDelete({ id, name });
    setDeleteDialogOpen(true);
  };
  
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setClinicToDelete(null);
  };
  
  const confirmDelete = async () => {
    if (clinicToDelete) {
      await deleteClinic(clinicToDelete.id);
      closeDeleteDialog();
      fetchClinics();
    }
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
    { field: 'name', headerName: 'Nume', flex: 1 },
    { field: 'address', headerName: 'Adresă', flex: 2 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acțiuni',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Editează" onClick={handleOpenEdit(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Șterge" onClick={openDeleteDialog(params.row.id, params.row.name)} showInMenu />,
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Clinici</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Adaugă clinică
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
              {editingClinic ? 'Editează clinică' : 'Adaugă clinică'}
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogTitle>{editingClinic ? 'Editează clinică' : 'Clinică nouă'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nume"
                value={formValues.name}
                onChange={(e) => setFormValues((v) => ({ ...v, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresă"
                value={formValues.address}
                onChange={(e) => setFormValues((v) => ({ ...v, address: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Anulează</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingClinic ? 'Salvează modificările' : 'Creează'}
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} /> Confirmă ștergerea
        </DialogTitle>
        <DialogContent>
          <Typography>
            Sigur dorești să ștergi clinica "{clinicToDelete?.name}"? Această acțiune nu poate fi anulată.
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