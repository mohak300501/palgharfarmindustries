import { Paper, Typography, Stack, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import { FilterList } from '@mui/icons-material';

interface MemberFilterProps {
  filter: { field: string; value: string };
  onFilterChange: (field: string, value: string) => void;
  onFilter: () => void;
  onClear: () => void;
}

const MemberFilter = ({ filter, onFilterChange, onFilter, onClear }: MemberFilterProps) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" mb={1} textAlign="center">Filter Members</Typography>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap">
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter by</InputLabel>
          <Select
            value={filter.field}
            onChange={(e) => onFilterChange('field', e.target.value)}
            label="Filter by"
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="village">Village</MenuItem>
            <MenuItem value="taluka">Taluka</MenuItem>
            <MenuItem value="district">District</MenuItem>
            <MenuItem value="state">State</MenuItem>
            <MenuItem value="community">Community</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Value"
          value={filter.value}
          onChange={(e) => onFilterChange('value', e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <Button variant="contained" onClick={onFilter} startIcon={<FilterList />}>
          Filter
        </Button>
        <Button onClick={onClear}>
          Clear
        </Button>
      </Stack>
    </Paper>
  );
};

export default MemberFilter; 