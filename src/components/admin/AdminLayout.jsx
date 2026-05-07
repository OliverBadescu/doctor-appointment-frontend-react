import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import {
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  LocalHospital as LocalHospitalIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`, 
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`, 
  },
});

const MiniDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open
      ? {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        }
      : {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        }),
  })
);

export default function AdminLayout() {
  const theme = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => {
    setOpen((prev) => !prev);
  };

  const navItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/admin/home' },
    { label: 'Clinics', icon: <LocationOnIcon />, path: '/admin/clinics' },
    { label: 'Doctors', icon: <LocalHospitalIcon />, path: '/admin/doctors' },
    { label: 'Patients', icon: <PeopleIcon />, path: '/admin/patients' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <MiniDrawer variant="permanent" open={open} sx={{ mt: 8 }}>
        <Toolbar />
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </MiniDrawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
