import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Tooltip, 
  Grid,
  Button,
  Chip
} from '@mui/material';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import CircleIcon from '@mui/icons-material/Circle';

interface Table {
  id: number;
  number: number;
  seats: number;
  status: 'müsait' | 'dolu' | 'rezerve';
  serverId?: string;
  serverName?: string;
}

interface TableLayoutProps {
  tables: Table[];
  onTableClick: (tableId: number) => void;
  onAssignServer?: (tableId: number) => void;
}

const TableLayout: React.FC<TableLayoutProps> = ({ tables, onTableClick, onAssignServer }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'müsait':
        return '#4caf50';
      case 'dolu':
        return '#f44336';
      case 'rezerve':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const getTableSize = (seats: number) => {
    if (seats <= 2) return { width: 80, height: 80 };
    if (seats <= 4) return { width: 100, height: 100 };
    return { width: 120, height: 120 };
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Legend */}
      <Box sx={{ mb: 4, display: 'flex', gap: 3, justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircleIcon sx={{ color: '#4caf50' }} />
          <Typography>Müsait</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircleIcon sx={{ color: '#f44336' }} />
          <Typography>Dolu</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircleIcon sx={{ color: '#ff9800' }} />
          <Typography>Rezerve</Typography>
        </Box>
      </Box>

      {/* Table Grid */}
      <Grid container spacing={3} justifyContent="center">
        {tables.map((table) => {
          const { width, height } = getTableSize(table.seats);
          
          return (
            <Grid item key={table.id} xs={6} sm={4} md={3} lg={2}>
              <Paper
                elevation={3}
                sx={{
                  width: '100%',
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  border: `2px solid ${getStatusColor(table.status)}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
                onClick={() => onTableClick(table.id)}
              >
                <TableRestaurantIcon 
                  sx={{ 
                    fontSize: table.seats <= 2 ? 30 : table.seats <= 4 ? 40 : 50,
                    color: '#2C1810'
                  }} 
                />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {table.number}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <GroupIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">{table.seats}</Typography>
                </Box>

                {/* Server Assignment */}
                {table.serverName ? (
                  <Tooltip title={`Atanan Garson: ${table.serverName}`}>
                    <Chip
                      icon={<PersonIcon />}
                      label={table.serverName}
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        bottom: -10,
                        backgroundColor: '#2C1810',
                        color: '#F5E6D3'
                      }}
                    />
                  </Tooltip>
                ) : (
                  <Button
                    size="small"
                    sx={{ 
                      position: 'absolute',
                      bottom: -10,
                      fontSize: '0.7rem',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#1976d2'
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignServer && onAssignServer(table.id);
                    }}
                  >
                    Garson Ata
                  </Button>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default TableLayout; 