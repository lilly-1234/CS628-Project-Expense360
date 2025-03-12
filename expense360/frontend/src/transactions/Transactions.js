import React, { useState, useEffect } from "react";
import { TextField, MenuItem, Select, Button, Box } from "@mui/material";
import { FileDownload } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { GET_TRANSACTIONS } from "../api";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { CSVDownload } from "react-csv";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import UpdateTransactionModal from "./updateTransactionModal";
import "./Transactions.css";

// Define columns for the DataGrid
const columns = [
  { field: "date", headerName: "Date", flex: 1 },
  { field: "name", headerName: "Name", flex: 1 },
  { field: "category", headerName: "Category", flex: 1 },
  { field: "amount", headerName: "Amount", flex: 1, type: "number" },
];

// Component for transactions
function Transactions({ userId }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch transactions data when userId changes
  useEffect(() => {
    if (userId) {
      const fetchData = async () => {
        try {
          const limit = 50;
          const url = new URL(`${GET_TRANSACTIONS}/${userId}`);
          url.searchParams.set("limit", limit.toString());
          const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const data = await response.json();
          const updatedData = data.map((transaction) => ({
            ...transaction,
            date: new Date(transaction.date).toLocaleDateString("en-CA"),
            id: transaction._id,
          }));
          setRows(updatedData);
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      };
      fetchData();
    }
  }, [userId]);


  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handleExport = () => {
    setIsExporting(true);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  // Filter transactions based on search, category, and date
  const filteredTransactions = rows.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transaction.name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "" || transaction.category === categoryFilter) &&
      (!startDate || transactionDate >= startDate) &&
      (!endDate || transactionDate <= endDate)
  }
  );

  const handleRowClick = (dataGridParams) => {
    setSelectedTransaction(dataGridParams.row);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleUpdate = (updatedTransaction) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === updatedTransaction._id ? { ...row, ...updatedTransaction, date: new Date(updatedTransaction.date).toLocaleDateString("en-CA") } : row
      )
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <div className="search-export-container">
        <TextField
          variant="outlined"
          placeholder="Search"
          fullWidth
          value={search}
          onChange={handleSearchChange}
          sx={{ mr: 10 }}
        />

        <Button variant="contained" startIcon={<FileDownload />} onClick={handleExport}>
          Export
        </Button>
      </div>
      <div className="filters-container">
        <Select value={categoryFilter} onChange={handleCategoryFilterChange} displayEmpty>
          <MenuItem value="">All Categories</MenuItem>
          <MenuItem value="Groceries">Groceries</MenuItem>
          <MenuItem value="Entertainment">Entertainment</MenuItem>
          <MenuItem value="Shopping">Shopping</MenuItem>
          <MenuItem value="Health">Health</MenuItem>
        </Select>
        {/* Used this referece for date pickers https://mui.com/x/react-date-pickers/base-concepts/ */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
            />
          </Box>
        </LocalizationProvider>
      </div>
      <div className="data-grid-container">
        <DataGrid
          rows={filteredTransactions}
          columns={columns}
          onRowClick={handleRowClick}
          pagination
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
        />
      </div>
      {/* CSV Export */}
      {/*Ref: https://www.npmjs.com/package/react-csv */}
      {isExporting && (
        <CSVDownload
          data={filteredTransactions}
          onClick={() => setIsExporting(false)}
        />
      )}
      {/* Update Transaction Modal */}
      <UpdateTransactionModal
        open={modalOpen}
        handleClose={handleModalClose}
        transaction={selectedTransaction}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default Transactions;
