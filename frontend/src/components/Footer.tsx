import React from 'react';
import { Box, Container, Typography, IconButton, Button, Divider } from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Report as ReportIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#2C1810',
        color: '#F5E6D3',
        py: 3,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', mb: 3 }}>
          {/* Contact Information */}
          <Box sx={{ mb: { xs: 3, md: 0 } }}>
            <Typography variant="h6" gutterBottom>
              Bize Ulaşın
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ mr: 1 }} />
              <Typography variant="body2">+1 (555) 123-4567</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ mr: 1 }} />
              <Typography variant="body2">contact@restaurant.com</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon sx={{ mr: 1 }} />
              <Typography variant="body2">123 Restaurant St, City, Country</Typography>
            </Box>
          </Box>

          {/* Social Media Links */}
          <Box sx={{ mb: { xs: 3, md: 0 } }}>
            <Typography variant="h6" gutterBottom>
              Bizi Takip Edin
            </Typography>
            <Box>
              <IconButton color="inherit">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit">
                <TwitterIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Report Button */}
          <Box>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ReportIcon />}
              onClick={() => alert("Sorun bildirme özelliği henüz işlenmemiştir.")}
            >
              Bir Sorun Bildir
            </Button>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(245, 230, 211, 0.1)', my: 2 }} />

        <Typography variant="body2" align="center" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} Grup28 .Tüm hakları saklıdır.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 