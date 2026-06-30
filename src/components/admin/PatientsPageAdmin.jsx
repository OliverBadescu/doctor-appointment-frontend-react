import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../services/state/userState';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, IconButton, Typography, Grid, Toolbar, AppBar, Paper
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon, Warning as WarningIcon } from '@mui/icons-material';
import { getAllUsers, deleteUser, register, updateUser } from '../../services/api/userService';

export default function PatientsPageAdmin() {
  const { isAuthReady } = useContext(UserContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setRows(res.body.list || []);
    } finally { setLoading(false); }
  };
  useEffect(() => {
    if (!isAuthReady) return;
    fetch();
  }, [isAuthReady]);

  const openCreate = () => { 
    setEditing(null); 
    setForm({ fullName: '', email: '', password: '' }); 
    setOpen(true); 
  };
  
  const openEdit = (row) => () => { 
    setEditing(row); 
    setForm({ fullName: row.fullName, email: row.email, password: '' }); 
    setOpen(true); 
  };
  
  const close = () => setOpen(false);
  
  const openDeleteDialog = (id, fullName) => () => {
    setPatientToDelete({ id, fullName });
    setDeleteDialogOpen(true);
  };
  
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPatientToDelete(null);
  };
  
  const confirmDelete = async () => {
    if (patientToDelete) {
      await deleteUser(patientToDelete.id);
      closeDeleteDialog();
      fetch();
    }
  };
  
  const handleSubmit = async () => {
    if (editing) {
      await updateUser(editing.id, form);
    } else {
      await register(form);
    }
    fetch(); 
    close();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'fullName', headerName: 'Nume', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
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
        <Typography variant="h6">Pacienți</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Adaugă pacient</Button>
      </Box>
      <DataGrid 
        rows={rows} 
        columns={columns} 
        loading={loading} 
        pageSize={10} 
        rowsPerPageOptions={[10]} 
        autoHeight 
        disableSelectionOnClick 
      />
      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <AppBar position="relative">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={close}>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
              {editing ? 'Editează pacient' : 'Pacient nou'}
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogTitle>{editing ? 'Editează pacient' : 'Pacient nou'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nume"
                value={form.fullName}
                onChange={e => setForm({...form, fullName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Email" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                type="password"
                label="Parolă"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Anulează</Button>
          <Button onClick={handleSubmit} variant="contained">
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
            Sigur dorești să ștergi pacientul {patientToDelete?.fullName}? Această acțiune nu poate fi anulată.
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