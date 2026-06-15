import { useContext, useState } from 'react';
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
  Button,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  LocalHospital as LocalHospitalIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { UserContext } from '../../services/state/userState';

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
  const { handleLogout } = useContext(UserContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // On desktop the mini-drawer expands/collapses; on mobile it slides in as an overlay.
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const open = isMobile ? mobileOpen : desktopOpen;

  const toggleDrawer = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setDesktopOpen((prev) => !prev);
    }
  };

  const closeMobileDrawer = () => setMobileOpen(false);

  const navItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/admin/home' },
    { label: 'Clinics', icon: <LocationOnIcon />, path: '/admin/clinics' },
    { label: 'Doctors', icon: <LocalHospitalIcon />, path: '/admin/doctors' },
    { label: 'Patients', icon: <PeopleIcon />, path: '/admin/patients' },
  ];

  const navList = (
    <List>
      {navItems.map((item) => (
        <ListItem key={item.label} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            component={NavLink}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={isMobile ? closeMobileDrawer : undefined}
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
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Logout
          </Button>
          <IconButton
            color="inherit"
            onClick={handleLogout}
            aria-label="Logout"
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <MuiDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeMobileDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Divider />
          {navList}
        </MuiDrawer>
      ) : (
        <MiniDrawer variant="permanent" open={desktopOpen} sx={{ mt: 8 }}>
          <Toolbar />
          <Divider />
          {navList}
        </MiniDrawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, mt: 8, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
