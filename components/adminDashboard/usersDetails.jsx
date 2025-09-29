import React, { useState, useEffect } from 'react';
import DataTable from '../common/dataTable';
import EditDialog from './EditDialog';

import { useSession } from 'next-auth/react';
import CustomDialog from '../common/customDialog';

const UsersDetails = () => {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null); // 'confirmDelete' or 'error'
  const [dialogMessage, setDialogMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers/read', {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch customers');
        const { customers } = await response.json();
        const formattedCustomers = customers.map(cust => ({ ...cust, id: cust._id }));
        setCustomers(formattedCustomers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchCustomers();
  }, [session]);

  const handleDelete = (id) => {
    setDialogType('confirmDelete');
    setDialogMessage('Are you sure you want to delete this user?');
    setDeleteId(id);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch('/api/customers/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ id: deleteId }),
      });
      if (!response.ok) throw new Error('Failed to delete');
      setCustomers(prev => prev.filter(cust => cust.id !== deleteId));
      setOpenDialog(false);
    } catch (err) {
      setDialogType('error');
      setDialogMessage('Delete failed: ' + err.message);
    }
  };

  const handleEdit = (customer) => {
    setEditCustomer(customer);
  };

  const handleSave = async (updatedCustomer) => {
    try {
      const response = await fetch('/api/customers/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(updatedCustomer),
      });
      if (!response.ok) throw new Error('Failed to update');
      const { customer } = await response.json();
      setCustomers(prev =>
        prev.map(cust => (cust.id === customer._id ? { ...customer, id: customer._id } : cust))
      );
      setEditCustomer(null);
    } catch (err) {
      setDialogType('error');
      setDialogMessage('Update failed: ' + err.message);
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType(null);
    setDialogMessage('');
    setDeleteId(null);
  };

  if (!session) return <div className="container mx-auto p-4">Please log in</div>;
  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users Data Table</h1>
      <DataTable data={customers} onDelete={handleDelete} onEdit={handleEdit} />
      {editCustomer && (
        <EditDialog
          open={!!editCustomer}
          onClose={() => setEditCustomer(null)}
          customer={editCustomer}
          onSave={handleSave}
        />
      )}
      <CustomDialog
        open={openDialog}
        onClose={handleCloseDialog}
        type={dialogType}
        message={dialogMessage}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default UsersDetails;