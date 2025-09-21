import React, { useState, useEffect } from 'react';
import DataTable from '../common/dataTable';

const UsersDetails = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers/read');
        if (!response.ok) throw new Error('Failed to fetch customers');
        const { customers } = await response.json();
        // Map _id to id for DataTable compatibility (optional; could update DataTable to use _id)
        const formattedCustomers = customers.map(cust => ({ ...cust, id: cust._id }));
        setCustomers(formattedCustomers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch('/api/customers/delete/[id]', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to delete');
      // Refetch data after delete
      setCustomers(prev => prev.filter(cust => cust.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users Data Table</h1>
      <DataTable data={customers} onDelete={handleDelete} />
    </div>
  );
};

export default UsersDetails;