import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  TextField, 
  Button, 
  Alert
} from '@mui/material';
import { Email, Phone, LocationOn, Send } from '@mui/icons-material';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom textAlign="center" color="primary">
          Contact Us
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 2 }}>
          {/* Contact Information */}
          <Box sx={{ flex: { md: 1 } }}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h5" gutterBottom color="primary">
                Get in Touch
              </Typography>
              <Typography paragraph>
                We'd love to hear from you. Whether you have questions about our platform, 
                need technical support, or want to provide feedback, we're here to help.
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="primary">Email</Typography>
                    <Typography>info@palgharfarmindustries.com</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="primary">Phone</Typography>
                    <Typography>+91 123 456 7890</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="primary">Address</Typography>
                    <Typography>
                      Palghar Farm Industries<br />
                      Palghar, Maharashtra<br />
                      India - 401601
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Contact Form */}
          <Box sx={{ flex: { md: 2 } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom color="primary">
                Send us a Message
              </Typography>
              
              {submitted && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Thank you for your message! We'll get back to you soon.
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    value={formData.name}
                    onChange={handleChange('name')}
                    required
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    required
                    variant="outlined"
                  />
                </Box>
                
                <TextField
                  fullWidth
                  label="Subject"
                  value={formData.subject}
                  onChange={handleChange('subject')}
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={6}
                  value={formData.message}
                  onChange={handleChange('message')}
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                >
                  Send Message
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ContactPage; 