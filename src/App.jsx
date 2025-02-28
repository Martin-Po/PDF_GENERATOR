import {  Box, Container, Paper, Tab, Tabs, Typography,  } from "@mui/material";
import { SinglePDFGenerator } from "./components/SinglePDFGenerator.jsx";
import { CSVPDFBatchGenerator } from "./components/CSVPDFBatchGenerator.jsx";
import { useState } from "react";


function App() {
  const [selectedTab, setSelectedTab] = useState(0);

  // Handle tab change
  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };




  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: "center" }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="CERTIFICADO"   />
          <Tab label="CSV"   />
        </Tabs>
      </Box>
        {selectedTab === 0 ? <SinglePDFGenerator/> : <CSVPDFBatchGenerator/>}
      </Paper>
    </Container>
  );
}

export default App;
