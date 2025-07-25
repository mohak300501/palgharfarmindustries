import { Box, Typography, Paper, Container } from '@mui/material';

const TermsPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom textAlign="center" color="primary">
          Terms & Conditions
        </Typography>
        
        <Paper sx={{ p: 4, mt: 3 }}>
          <Typography variant="body1" paragraph>
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </Typography>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            1. Acceptance of Terms
          </Typography>
          <Typography paragraph>
            By accessing and using the Palghar Farm Industries Portal, you accept and agree to be bound by the terms 
            and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            2. Use License
          </Typography>
          <Typography paragraph>
            Permission is granted to temporarily download one copy of the materials (information or software) 
            on Palghar Farm Industries Portal for personal, non-commercial transitory viewing only. This is the 
            grant of a license, not a transfer of title, and under this license you may not:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" paragraph>
              Modify or copy the materials
            </Typography>
            <Typography component="li" paragraph>
              Use the materials for any commercial purpose or for any public display
            </Typography>
            <Typography component="li" paragraph>
              Attempt to reverse engineer any software contained on the portal
            </Typography>
            <Typography component="li" paragraph>
              Remove any copyright or other proprietary notations from the materials
            </Typography>
          </Box>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            3. User Accounts
          </Typography>
          <Typography paragraph>
            When you create an account with us, you must provide information that is accurate, complete, 
            and current at all times. You are responsible for safeguarding the password and for all activities 
            that occur under your account. You agree not to disclose your password to any third party.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            4. Community Guidelines
          </Typography>
          <Typography paragraph>
            Users must adhere to the following guidelines when participating in communities:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" paragraph>
              Be respectful and constructive in all interactions
            </Typography>
            <Typography component="li" paragraph>
              Do not post spam, offensive, or inappropriate content
            </Typography>
            <Typography component="li" paragraph>
              Respect intellectual property rights
            </Typography>
            <Typography component="li" paragraph>
              Do not impersonate others or provide false information
            </Typography>
          </Box>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            5. Privacy Policy
          </Typography>
          <Typography paragraph>
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use 
            of the portal, to understand our practices regarding the collection and use of your information.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            6. Disclaimer
          </Typography>
          <Typography paragraph>
            The materials on Palghar Farm Industries Portal are provided on an 'as is' basis. We make no 
            warranties, expressed or implied, and hereby disclaim and negate all other warranties including 
            without limitation, implied warranties or conditions of merchantability, fitness for a particular 
            purpose, or non-infringement of intellectual property or other violation of rights.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            7. Limitations
          </Typography>
          <Typography paragraph>
            In no event shall Palghar Farm Industries or its suppliers be liable for any damages (including, 
            without limitation, damages for loss of data or profit, or due to business interruption) arising 
            out of the use or inability to use the portal, even if we or our authorized representative has 
            been notified orally or in writing of the possibility of such damage.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            8. Revisions and Errata
          </Typography>
          <Typography paragraph>
            The materials appearing on Palghar Farm Industries Portal could include technical, typographical, 
            or photographic errors. We do not warrant that any of the materials on the portal are accurate, 
            complete, or current. We may make changes to the materials contained on the portal at any time 
            without notice.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            9. Links
          </Typography>
          <Typography paragraph>
            Palghar Farm Industries has not reviewed all of the sites linked to its portal and is not 
            responsible for the contents of any such linked site. The inclusion of any link does not imply 
            endorsement by Palghar Farm Industries of the site. Use of any such linked website is at the 
            user's own risk.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            10. Modifications
          </Typography>
          <Typography paragraph>
            We may revise these terms of service for the portal at any time without notice. By using this 
            portal, you are agreeing to be bound by the then current version of these Terms and Conditions of Use.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 4 }}>
            11. Governing Law
          </Typography>
          <Typography paragraph>
            These terms and conditions are governed by and construed in accordance with the laws of India 
            and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
          </Typography>


        </Paper>
      </Box>
    </Container>
  );
};

export default TermsPage; 