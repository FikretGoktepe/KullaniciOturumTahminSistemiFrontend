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
} from '@mui/material';
import { TableVirtuoso } from 'react-virtuoso';

const columns = [
  { width: '20%', label: 'Name', dataKey: 'name' },
  { width: '20%', label: 'Result 1', dataKey: 'result1' },
  { width: '15%', label: 'Result 2', dataKey: 'result2' },
  { width: '15%', label: 'Result 3', dataKey: 'result3' },
  { width: '20%', label: 'Result 4', dataKey: 'result4' },
  { width: '10%', label: 'Data Sufficiency', dataKey: 'dataSufficiency', numeric: true },
];

export default function DataTable() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('https://login-estimate-time-edb70ab12340.herokuapp.com/');
        const json = await res.json();
        if (json.status === 1 && Array.isArray(json.data)) {
          setRows(json.data);
        } else {
          setRows([]);
        }
      } catch (error) {
        console.error('API error:', error);
        setRows([]);
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
      <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: (props) => (
      <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
    ),
    TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
    TableRow,
    TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
  };

  const fixedHeaderContent = () => (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align="center"
          style={{ width: column.width, verticalAlign: 'middle' }}
          sx={{ backgroundColor: 'background.paper' }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );

  const rowContent = (_index, row) => (
    <>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          align={column.numeric ? 'right' : 'center'}
          style={{ width: column.width, verticalAlign: 'middle', wordBreak: 'break-word' }}
        >
          {row[column.dataKey]}
        </TableCell>
      ))}
    </>
  );

  return (
    <Box
      sx={{
        height: '90vh',
        width: '90vw',
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        pt: 2,
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
        <TextField
          label="Ara..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '25%' }}
        />
      </Box>
      <Paper sx={{ height: '80%', width: '100%' }}>
        <TableVirtuoso
          data={filteredRows}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
          style={{ height: '100%', width: '100%' }}
        />
      </Paper>
    </Box>
  );
}
