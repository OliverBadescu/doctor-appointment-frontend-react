import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, IconButton, Typography, Grid, Toolbar, AppBar
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { getAllUsers } from '../../services/api/userService';

export  default function PatientsPageAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setRows(res.body || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', phone: '' }); setOpen(true); };
  const openEdit = (row) => () => { setEditing(row); setForm({ name: row.name, phone: row.phone }); setOpen(true); };
  const close = () => setOpen(false);
  const handleDelete = (id) => async () => { if (!window.confirm('Delete this patient?')) return; await deletePatient(id); fetch(); };
  const handleSubmit = async () => {
    if (editing) await updatePatient(editing.id, form);
    else await createPatient(form);
    fetch(); close();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'actions', type: 'actions', headerName: 'Actions', width: 120,
      getActions: (p) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={openEdit(p.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={handleDelete(p.id)} showInMenu />
      ]
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb:2 }}>
        <Typography variant="h6">Patients</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Patient</Button>
      </Box>
      <DataGrid rows={rows} columns={columns} loading={loading} pageSize={10} rowsPerPageOptions={[10]} autoHeight disableSelectionOnClick />

      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <AppBar position="relative"><Toolbar><IconButton edge="start" color="inherit" onClick={close}><CloseIcon/></IconButton><Typography sx={{ml:2,flex:1}} variant="h6">{editing? 'Edit Patient':'New Patient'}</Typography></Toolbar></AppBar>
        <DialogTitle>{editing? 'Edit Patient':'New Patient'}</DialogTitle>
        <DialogContent><Grid container spacing={2} mt={1}><Grid item xs={12}><TextField fullWidth label="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Grid><Grid item xs={12}><TextField fullWidth label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></Grid></Grid></DialogContent>
        <DialogActions><Button onClick={close}>Cancel</Button><Button onClick={handleSubmit} variant="contained">{editing?'Save':'Create'}</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
