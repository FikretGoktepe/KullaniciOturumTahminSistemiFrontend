import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { TableVirtuoso } from 'react-virtuoso';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const columns = [
  { label: 'ID', dataKey: 'id' },
  { label: 'Name', dataKey: 'name' },
  { label: 'Tahmini Aralık', dataKey: 'result1' },
  { label: 'Tahmini Saat Dilimi', dataKey: 'result2' },
  { label: 'Tahmini Gün', dataKey: 'result3' },
  { label: 'Gelecek Tahmini Giriş', dataKey: 'result4' },
  { label: 'Yeterli Veri Var?', dataKey: 'dataSufficiency' },
];

export default function DataTable() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('https://login-estimate-time-edb70ab12340.herokuapp.com/');
        const json = await res.json();

        console.log('API response:', json);

        const status = json.status;

        if (status === 1 && Array.isArray(json.data)) {
          setRows(json.data);
          setErrorMessages([]);
          setOpenErrorDialog(false);
        } else {
          setRows([]);

          let errors = [];

          if (json['error-no']) {
            errors = [String(json['error-no'])];
          } else {
            errors = ['Bilinmeyen bir hata oluştu.'];
          }

          setErrorMessages(errors);
          setOpenErrorDialog(true);
        }
      } catch (error) {
        setRows([]);
        setErrorMessages(['API isteği sırasında hata oluştu: ' + error.message]);
        setOpenErrorDialog(true);
      }
    }
    fetchData();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [rows, search]);

  const VirtuosoTableComponents = {
    Scroller: React.forwardRef((props, ref) => (
      <TableContainer
        component={Paper}
        ref={ref}
        {...props}
        sx={{ overflowX: 'auto', height: '100%' }}
      />
    )),
    Table: (props) => (
      <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'auto' }} />
    ),
    TableHead: React.forwardRef((props, ref) => <TableHead ref={ref} {...props} />),
    TableRow,
    TableBody: React.forwardRef((props, ref) => <TableBody ref={ref} {...props} />),
  };

  const fixedHeaderContent = () => (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align="center"
          sx={{
            backgroundColor: 'background.paper',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            padding: '8px',
          }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );

  const rowContent = (_index, row) => (
    <>
      {columns.map((column) => {
        if (column.dataKey === 'dataSufficiency') {
          return (
            <TableCell
              key={column.dataKey}
              align="center"
              sx={{
                whiteSpace: 'normal',
                wordBreak: 'keep-all',
                overflowWrap: 'break-word',
                padding: '8px',
                minWidth: '100px',
              }}
            >
              {row.dataSufficiency === 1 ? (
                <CheckIcon sx={{ color: 'green' }} />
              ) : (
                <CloseIcon sx={{ color: 'red' }} />
              )}
            </TableCell>
          );
        }
        return (
          <TableCell
            key={column.dataKey}
            align="center"
            sx={{
              whiteSpace: 'normal',
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
              padding: '8px',
              minWidth: '100px',
            }}
          >
            {row[column.dataKey]}
          </TableCell>
        );
      })}
    </>
  );

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '1600px',
        height: '100vh',
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
        <TextField
          label="Ara..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '100%', maxWidth: '300px' }}
        />
      </Box>
      <Paper sx={{ flex: 1, width: '100%' }}>
        <TableVirtuoso
          data={filteredRows}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
          style={{ height: '100%', width: '100%' }}
        />
      </Paper>

      <Dialog open={openErrorDialog} onClose={() => setOpenErrorDialog(false)}>
        <DialogTitle>Hata</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Hata mesajları ({errorMessages.length})
          </Typography>
          {errorMessages.map((msg, idx) => (
            <Typography key={idx} gutterBottom>
              {msg}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenErrorDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
