import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Paper, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LineChart } from '@mui/x-charts';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { GET_TRANSACTIONS, GET_ACCOUNTS } from "../api";
import UpdateTransactionModal from "../transactions/updateTransactionModal";
import "./Dashboard.css";

const columns = [
  { field: 'date', headerName: 'Date', width: 200 },
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'category', headerName: 'Category', width: 200 },
  { field: 'amount', headerName: 'Amount', type: 'number', width: 200 },
];

// Component for dashboard
export default function Dashboard({ userId, userName }) {
  // State the variables for userinterface and data
  const navigate = useNavigate();
  const [openChecking, setOpenChecking] = useState(true);
  const [openCardBalance, setOpenCardBalance] = useState(true);
  const [rows, setRows] = useState([]);
  const [chartData, setChartData] = useState({ x: [], y: [] });
  const [debitCards, setDebitCards] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [netCash, setNetCash] = useState(0);
  const [name, setName] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cumm, setCumm] = useState(0);

  // Fetching the data when user Id changes
  useEffect(() => {
    if (userId) {
      const fetchData = async () => {
        try {
          const limit = 50
          const url = new URL(`${GET_TRANSACTIONS}/${userId}`);
          url.searchParams.set('limit', limit.toString());
          const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },

          });
          const data = await response.json();
          const updatedData = data.map((transaction) => ({
            ...transaction,
            date: new Date(transaction.date).toLocaleDateString('en-CA'),
            id: transaction._id
          }));
          setRows(updatedData.slice(0, 5));
          const chart = prepareChartData(updatedData);
          setChartData(chart);
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      };
      fetchData();
    }
  }, [userId]);
  useEffect(() => {
    setName(userName ? userName : "")
  }, [userName])

  useEffect(() => {
    if (userId) {
      const fetchAccountData = async () => {
        try {
          const url = new URL(`${GET_ACCOUNTS}/${userId}`);
          const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },

          });
          const data = await response.json();
          const debitCardsData = data.filter(account => account.type === "Debit Card");
          const creditCardsData = data.filter(account => account.type === "Credit Card");
          setDebitCards(debitCardsData);
          setCreditCards(creditCardsData);
          var netBal = 0;
          // net cash adds debit card balances and subtracts credit card balances
          data.map(card => {
            if (card.type === "Debit Card") {
              netBal += card.balance
            } else if (card.type === "Credit Card") {
              netBal -= card.outstanding_balance
            }
          })
          setNetCash(netBal)
        } catch (error) {
          console.error("Error fetching account information:", error);
        }
      };
      fetchAccountData();
    }
  }, [userId]);

  // function for preparing chart data
  const prepareChartData = (transactions) => {
    const dateAmounts = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const formattedDate = date.toLocaleDateString();
      const amount = transaction.amount;

      // Add amounts for the same date
      if (date.getMonth() === 1) {
        if (dateAmounts[formattedDate]) {
          dateAmounts[formattedDate] += amount;
        } else {
          dateAmounts[formattedDate] = amount;
        }
      }
    });

    // Sort the dates and map them to cumulative amounts
    // Used this for ref https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    const sortedDates = Object.keys(dateAmounts).sort((a, b) => new Date(a) - new Date(b));

    let cumulativeAmount = 0;
    const cumulativeAmounts = sortedDates.map((date) => {
      cumulativeAmount += dateAmounts[date]; // Add current day amount to cumulative sum
      const roundedAmount = Math.round(cumulativeAmount)

      return roundedAmount;
    });
    setCumm(Math.round(cumulativeAmount))
    const sortedTimes = sortedDates.map((date) => new Date(date));

    return { x: sortedTimes, y: cumulativeAmounts };
  };

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

    <Box sx={{ flexGrow: 1 }}>
      <Grid container>
        <Grid size="grow">
          <Grid
            container
            direction="column"
            className = "chart-container"
          >
            <Box className = "user-name">
              <Typography variant="h5" gutterBottom >
                Hi {name}
              </Typography>
              <div sx={{ position: "absolute", top: 50, left: 20 }}>
                <Typography variant="subtitle1" gutterBottom >
                  Current Spend this Month
                </Typography>
                <Typography variant="h6" gutterBottom >
                  $ {cumm}
                </Typography>
              </div>
            </Box>

            <LineChart
              xAxis={[{
                data: chartData.x,
                scaleType: 'time',
                valueFormatter: (date) => "",
              }]}
              series={[{ data: chartData.y, color: "#3399FF", showMark: false, area: true, baseline: 'min' }]}
              width={800}
              height={300}
              bottomAxis={{ disableTicks: true, disableLine: true }}
              rightAxis={{ disableTicks: true, disableLine: true }}
              leftAxis={null}
            />
            <Paper className = "data-grid-container-dashboard">
              <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                sx={{ border: 0 }}
                hideFooter
                disableColumnMenu
                disableColumnSort
                onRowClick={handleRowClick}
              />          <Button
                onClick={() => navigate("/transactions", { state: { userId: userId } })} variant="outlined">See More Transactions</Button>
            </Paper>

            <UpdateTransactionModal
              open={modalOpen}
              handleClose={handleModalClose}
              transaction={selectedTransaction}
              onUpdate={handleUpdate}
            />
          </Grid>
        </Grid>
        <Grid size={3}>
          <List>
            <ListItemButton onClick={() => setOpenChecking(!openChecking)}>
              <ListItemIcon>
                <FactCheckIcon />
              </ListItemIcon>
              <ListItemText primary="Checking" />
              {openChecking ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openChecking}>
              <List component="div" disablePadding>
                {debitCards.map((card) => (
                  <ListItemButton key={card._id} sx={{ pl: 4 }}>
                    <ListItemIcon>
                      <AccountBalanceIcon />
                    </ListItemIcon>
                    <ListItemText primary={`${card.bank_name}`} secondary={`$${card.balance}`} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>

            <ListItemButton onClick={() => setOpenCardBalance(!openCardBalance)}>
              <ListItemIcon>
                <CreditCardIcon />
              </ListItemIcon>
              <ListItemText primary="Card Balance" />
              {openCardBalance ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openCardBalance}>
              <List component="div" disablePadding>
                {creditCards.map((card) => (
                  <ListItemButton key={card._id} sx={{ pl: 4 }}>
                    <ListItemIcon>
                      <CreditCardIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${card.bank_name}`}
                      secondary={`$${card.outstanding_balance}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
            <ListItemButton>
              <ListItemIcon>
                < AccountBalanceWalletIcon />
              </ListItemIcon>
              <ListItemText primary={`Net Cash`} secondary={`$${netCash}`} />
            </ListItemButton>

          </List>
        </Grid>
      </Grid>
    </Box>
  );
}