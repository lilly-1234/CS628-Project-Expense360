import React from "react";
import { Box } from "@mui/material";
import SideDrawer from "../sideDrawer/SideDrawer";

// Component for MainLayout
export default function MainLayout({ children, userId, setIsAuthenticated }) {

  console.log("main", userId)
  return (
    <Box sx={{ display: "flex" }}>
      <SideDrawer userId={userId} setIsAuthenticated={setIsAuthenticated} />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
