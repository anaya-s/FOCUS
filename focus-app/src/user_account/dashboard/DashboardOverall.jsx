import Grid from '@mui/material/Grid2';
import Paper from "@mui/material/Paper";
import { Typography } from '@mui/material';
import ReadingTime from './ReadingTime';
import Barchart from './Barchart';

const dashboardStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  padding: '24px',
  width: '1000px', 
};


const DashboardOverall = () => {
  return (
    <div style={dashboardStyle}>
      <Typography variant='h3'>Welcome to your dashboard!</Typography>
      <Grid container spacing={2} style={{ padding: "16px" }}>
        <Grid item xs={24} sm={12} md={12}>
          <ReadingTime />
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <Barchart />
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <Paper style={{ padding: "16px" }}>Chart 3</Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default DashboardOverall