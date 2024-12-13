import { Typography } from "@mui/material";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  textAlign: "center",
  paddingTop: "120px",
  height: "100vh"
};

const AboutUs = () => {

  return (
    <div style={pageStyle}>
    <Typography variant="h3">About Us</Typography> 
  </div>
  );
};

export default AboutUs;
