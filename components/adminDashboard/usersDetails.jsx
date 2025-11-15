// usersDetails.jsx
import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import DataTable from '../common/dataTable';
import EditDialog from './EditDialog';
import CustomDialog from '../common/customDialog';
import { apiRequest } from '@/utils/apiRequest';
import { getAuthToken } from '@/utils/getAuthToken';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '../common/loader';

const PAGE_SIZE = 10;

const UsersDetails = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [editCustomer, setEditCustomer] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [dialogMessage, setDialogMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Min loader duration ref
  const minLoaderTimeoutRef = useRef(null);

  // ---------- FETCH ----------
  const {
    data: customers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { customers } = await apiRequest({
        url: '/api/customers/read',
        token: getAuthToken(),
      });
      return customers.map(cust => ({ ...cust, id: cust.clientId }));
    },
    enabled: !!session,
  });

  // ---------- SEARCH ----------
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(cust =>
      ['companyName', 'subEntity', 'subCorporate', 'mobileNo', 'gstNo', 'email1', 'email2', 'email3'].some(
        field => cust[field] && String(cust[field]).toLowerCase().includes(term)
      )
    );
  }, [customers, searchTerm]);

  // ---------- PAGINATION ----------
  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE);
  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [filteredCustomers, page]);

  // ---------- MUTATIONS ----------
  const deleteMutation = useMutation({
    mutationFn: (id) => {
      console.log('Delete mutation starting...', id); // Debug log
      return apiRequest({
        url: '/api/customers/delete',
        method: 'DELETE',
        body: { id },
        token: getAuthToken(),
      });
    },
    onMutate: () => {
      // Start min duration timer
      minLoaderTimeoutRef.current = setTimeout(() => {}, 1000); // 1s min
    },
    onSuccess: () => {
      console.log('Delete success'); // Debug log
      queryClient.invalidateQueries(['customers']);
      setOpenDialog(false);
      clearTimeout(minLoaderTimeoutRef.current);
    },
    onError: (err) => {
      console.error('Delete error:', err); // Debug log
      setDialogType('error');
      setDialogMessage('Delete failed: ' + err.message);
      setOpenDialog(true);
      clearTimeout(minLoaderTimeoutRef.current);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      console.log('Update mutation starting...', data); // Debug log
      return apiRequest({
        url: '/api/customers/update',
        method: 'PUT',
        body: data,
        token: getAuthToken(),
      });
    },
    onMutate: () => {
      // Start min duration timer
      minLoaderTimeoutRef.current = setTimeout(() => {}, 1000); // 1s min
    },
    onSuccess: ({ customer }) => {
      console.log('Update success'); // Debug log
      queryClient.setQueryData(['customers'], (old = []) =>
        old.map(cust => (cust.id === customer.clientId ? { ...customer, id: customer.clientId } : cust))
      );
      setEditCustomer(null);
      clearTimeout(minLoaderTimeoutRef.current);
    },
    onError: (err) => {
      console.error('Update error:', err); // Debug log
      setDialogType('error');
      setDialogMessage('Update failed: ' + err.message);
      setOpenDialog(true);
      clearTimeout(minLoaderTimeoutRef.current);
    },
  });

  // ---------- LOADER STATE (v5 Compatible) ----------
  // Use isPending (v5) with fallback to isLoading (v4)
  const isMutating =
    (deleteMutation.isPending ?? deleteMutation.isLoading) ||
    (updateMutation.isPending ?? updateMutation.isLoading);

  // Force min duration: Show loader until timeout clears *or* mutation ends
  const [forceLoader, setForceLoader] = useState(false);
  React.useEffect(() => {
    if (isMutating) {
      setForceLoader(true);
    } else {
      const timer = setTimeout(() => setForceLoader(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isMutating]);

  const showLoader = isMutating || forceLoader;

  // ---------- HANDLERS ----------
  const handleDelete = (id) => {
    console.log('Handle delete clicked:', id); // Debug log
    setDialogType('confirmDelete');
    setDialogMessage('Are you sure you want to delete this user?');
    setDeleteId(id);
    setOpenDialog(true);
  };

  const confirmDelete = () => {
    console.log('Confirm delete clicked'); // Debug log
    deleteMutation.mutate(deleteId);
  };

  const handleEdit = (customer) => {
    console.log('Handle edit clicked:', customer.id); // Debug log
    setEditCustomer(customer);
  };

  const handleSave = (updatedCustomer) => {
    console.log('Handle save clicked:', updatedCustomer.id); // Debug log
    updateMutation.mutate(updatedCustomer);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType(null);
    setDialogMessage('');
    setDeleteId(null);
  };

  // ---------- EARLY RETURNS ----------
  if (!session) return <Loader message="Please wait for sometime..."/>;
  if (isLoading) return <Loader message="Loading customer details..." />;
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error.message}</div>;

  return (
    <>
      {/* ---------- MAIN CONTENT ---------- */}
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Users Data Table</h1>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by company, email, phone, GST..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setPage(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          )}
        </div>

        {/* Results + Pagination */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <p>
            Showing {paginatedCustomers.length} of {filteredCustomers.length} (Total: {customers.length})
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 disabled:opacity-50 hover:bg-gray-100 rounded"
              >
                <ChevronLeft size={18} />
              </button>
              <span>
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 disabled:opacity-50 hover:bg-gray-100 rounded"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <DataTable data={paginatedCustomers} onDelete={handleDelete} onEdit={handleEdit} />

        {/* Dialogs */}
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

      {/* ---------- FULL-SCREEN LOADER ---------- */}
      {showLoader && (
        <Loader message="Processing..."/>
      )}
    </>
  );
};

export default UsersDetails;