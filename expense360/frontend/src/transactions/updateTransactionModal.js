import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import { UPDATE_TRANSACTION } from "../api";

// Component for UpdateTransactionModal and desturcting the props
const UpdateTransactionModal = ({ open, handleClose, transaction, onUpdate }) => {
  // Setting state variables for form data
  const [formData, setFormData] = useState({
    date:'',
    name: '',
    category: '',
    amount: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  // Updating form data when  transaction prop changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date ,
        name: transaction.name ,
        category: transaction.category ,
        amount: transaction.amount ,
      });
    }
  }, [transaction]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${UPDATE_TRANSACTION}/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const updatedTransaction = await response.json();
        onUpdate(updatedTransaction.transaction);
        handleClose();
      } else {
        console.error('Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  return (
    // Used reference from mui for stying https://mui.com/material-ui/react-modal/
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>Update Transaction</Typography>
        <TextField
          fullWidth
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Amount"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mr: 2 }}>Update</Button>
        <Button variant="outlined" onClick={handleClose}>Cancel</Button>
      </Box>
    </Modal>
  );
};

export default UpdateTransactionModal;