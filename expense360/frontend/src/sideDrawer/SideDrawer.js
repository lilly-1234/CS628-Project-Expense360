import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Drawer from '@mui/material/Drawer';
import {
    Box, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Divider
} from '@mui/material';
import { Dashboard, Receipt, Chat , Logout } from '@mui/icons-material';
import expense_logo from "../logo/expense_logo.png";
import "./SideDrawer.css";

// Component for Side drawer
export default function SideDrawer({ userId, setIsAuthenticated }) {
    const location = useLocation();
    const navigate = useNavigate();

    const [selectedItem, setSelected] = useState(location.pathname);
    useEffect(() => {
        setSelected(location.pathname);
    }, [location.pathname]);

    const signOut = () => {
        setIsAuthenticated(false);
        navigate("/login");
    }
    return (
        <Drawer className="drawer" variant="permanent" anchor="left">
            <Box className="logo-container" onClick={() => navigate("/dashboard", { state: { userId: userId } })}>
                <img
                    src={expense_logo}
                    alt="Expense Logo"
                    className = "logo-image">
                </img>
            </Box>
            <List>
                <ListItem disablePadding>
                    <ListItemButton selected={selectedItem === "/dashboard"} onClick={() => navigate("/dashboard", { state: { userId: userId } })}>
                        <ListItemIcon>
                            <Dashboard />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton selected={selectedItem === "/transactions"} onClick={() => navigate("/transactions", { state: { userId: userId } })}>
                        <ListItemIcon>
                            <Receipt />
                        </ListItemIcon>
                        <ListItemText primary="Transactions" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            {/* Chatbot at the bottom */}
            <Box className="chat-container">
                    <ListItem disablePadding>
                        <ListItemButton selected={selectedItem === "/chatbot"} onClick={() => navigate("/chatbot", { state: { userId: userId } })}>
                            <ListItemIcon><Chat /></ListItemIcon>
                            <ListItemText primary="Chat With Us" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton selected={selectedItem === "/login"} onClick={signOut}>
                            <ListItemIcon><Logout/></ListItemIcon>
                            <ListItemText primary="Sign Out" />
                        </ListItemButton>
                    </ListItem>
                </Box>
        </Drawer>
    );
}
