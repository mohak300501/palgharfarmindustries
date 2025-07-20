import { Box, useTheme, useMediaQuery } from '@mui/material';
import type { ReactNode } from 'react';

interface CommunityLayoutProps {
  sidebar: ReactNode;
  mainContent: ReactNode;
}

const CommunityLayout = ({ sidebar, mainContent }: CommunityLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Box>
        {/* Mobile Layout */}
        <Box sx={{ mb: 3 }}>
          {sidebar}
        </Box>
        {mainContent}
      </Box>
    );
  }

  return (
    /* Desktop Layout with Sidebar */
    <Box sx={{ display: 'flex', gap: 3 }}>
      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        {mainContent}
      </Box>

      {/* Sidebar */}
      <Box sx={{ width: 300, flexShrink: 0 }}>
        <Box sx={{ position: 'sticky', top: 24 }}>
          {sidebar}
        </Box>
      </Box>
    </Box>
  );
};

export default CommunityLayout; 