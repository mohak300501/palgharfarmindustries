import { Box, Typography, Paper, Container } from '@mui/material';

const AboutPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom textAlign="center" color="primary">
          About Palghar Farm Industries Portal
        </Typography>
        
        <Paper sx={{ p: 4, mt: 3 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Our Mission
          </Typography>
          <Typography paragraph>
            The Palghar Farm Industries Portal is a comprehensive digital platform designed to connect 
            and empower the farming community in the Palghar region. Our mission is to facilitate 
            knowledge sharing, community building, and sustainable agricultural practices among local farmers.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            What We Do
          </Typography>
          <Typography paragraph>
            We provide a secure and user-friendly platform where farmers can:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" paragraph>
              Join and participate in specialized farming communities
            </Typography>
            <Typography component="li" paragraph>
              Share experiences, tips, and best practices with fellow farmers
            </Typography>
            <Typography component="li" paragraph>
              Access valuable resources and information about modern farming techniques
            </Typography>
            <Typography component="li" paragraph>
              Connect with other farmers in their village, taluka, and district
            </Typography>
            <Typography component="li" paragraph>
              Stay updated with the latest agricultural trends and innovations
            </Typography>
          </Box>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            Our Values
          </Typography>
          <Typography paragraph>
            We are committed to promoting sustainable agriculture, fostering community spirit, 
            and supporting the growth and development of the farming sector in Palghar. 
            Our platform emphasizes collaboration, knowledge sharing, and mutual support 
            among all members of the agricultural community.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            Join Our Community
          </Typography>
          <Typography paragraph>
            Whether you're an experienced farmer or just starting your agricultural journey, 
            our portal welcomes you. Together, we can build a stronger, more connected 
            farming community that benefits everyone.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default AboutPage; 