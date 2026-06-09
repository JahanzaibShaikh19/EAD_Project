// frontend/src/pages/employees/EmployeeList.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Eye, Pencil, Trash2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import SearchInput from '../../components/shared/SearchInput';
import FilterDropdown from '../../components/shared/FilterDropdown';
import StatusBadge from '../../components/shared/StatusBadge';
import Avatar from '../../components/shared/Avatar';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmployeeForm from './EmployeeForm';
import { useEmployees, useDeleteEmployee, employeeApiCalls } from '../../api/employeeApi';
import { useDepartments } from '../../api/departmentApi';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/helpers';
import { CONTRACT_TYPES, EMPLOYEE_STATUSES } from '../../utils/constants';

export default function EmployeeList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', status: '', contract_type: '' });
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteEmployee, setDeleteEmployeeData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data: empData, isLoading } = useEmployees({
    search: debouncedSearch || undefined,
    department_id: filters.department || undefined,
    status: filters.status || undefined,
    contract_type: filters.contract_type || undefined,
    page,
    limit: 10,
    sort: sortKey,
    dir: sortDir,
  });

  const { data: deptData } = useDepartments();
  const { mutate: deleteEmp, isPending: deleting } = useDeleteEmployee();

  const employees = empData?.employees || empData?.data || [];
  const total = empData?.total || 0;
  const departments = deptData?.data || [];

  const filterConfig = [
    {
      key: 'department',
      label: 'Department',
      options: departments.map((d) => ({ value: d.id, label: d.name })),
    },
    {
      key: 'status',
      label: 'Status',
      options: EMPLOYEE_STATUSES,
    },
    {
      key: 'contract_type',
      label: 'Contract Type',
      options: CONTRACT_TYPES,
    },
  ];

  const columns = [
    {
      key: 'first_name',
      label: 'Employee',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar
            photoUrl={row.photo_url}
            firstName={row.first_name}
            lastName={row.last_name}
            size={36}
          />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {row.first_name} {row.last_name}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {row.employee_code}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (val) => (
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{val}</span>
      ),
    },
    {
      key: 'department_name',
      label: 'Department',
      sortable: false,
      render: (val) => val || '—',
    },
    {
      key: 'position_title',
      label: 'Position',
      sortable: false,
      render: (val) => val || '—',
    },
    {
      key: 'contract_type',
      label: 'Type',
      sortable: true,
      render: (val) => <StatusBadge type="contract" value={val} />,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge type="status" value={val} />,
    },
    {
      key: 'hire_date',
      label: 'Hired',
      sortable: true,
      render: (val) => (
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {formatDate(val)}
        </span>
      ),
    },
  ];

  const rowActions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (row) => navigate(`/employees/${row.id}`),
    },
    {
      label: 'Edit',
      icon: Pencil,
      onClick: (row) => { setEditEmployee(row); setShowForm(true); },
    },
    {
      label: 'Delete',
      icon: Trash2,
      className: 'text-red-600 focus:text-red-600',
      onClick: (row) => { setDeleteId(row.id); setDeleteEmployeeData(row); },
    },
  ];

  function handleSort(key, dir) {
    setSortKey(key);
    setSortDir(dir);
    setPage(1);
  }

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function handleDeleteConfirm() {
    deleteEmp(deleteId, {
      onSettled: () => {
        setDeleteId(null);
        setDeleteEmployeeData(null);
      },
    });
  }

  async function handleExport() {
    try {
      setIsExporting(true);
      const data = await employeeApiCalls.getAll({
        search: debouncedSearch || undefined,
        department_id: filters.department || undefined,
        status: filters.status || undefined,
        contract_type: filters.contract_type || undefined,
        limit: 10000,
        sort: sortKey,
        dir: sortDir,
      });

      const records = data.employees || data.data || [];
      if (records.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = ['Employee Code', 'First Name', 'Last Name', 'Email', 'Department', 'Position', 'Contract Type', 'Status', 'Hire Date', 'Salary'];
      const csvRows = [headers.join(',')];

      for (const row of records) {
        const values = [
          row.employee_code || '',
          row.first_name || '',
          row.last_name || '',
          row.email || '',
          row.department_name || '',
          row.position_title || '',
          row.contract_type || '',
          row.status || '',
          row.hire_date ? new Date(row.hire_date).toISOString().split('T')[0] : '',
          row.salary || ''
        ];
        
        const escaped = values.map(v => {
          const str = String(v);
          if (str.includes(',') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        });
        csvRows.push(escaped.join(','));
      }

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  }

  const dateRange = `01 Jan ${new Date().getFullYear()} — 31 Dec ${new Date().getFullYear()}`;

  return (
    <PageWrapper>
      <PageHeader
        title="Employees"
        subtitle={`${total.toLocaleString()} total employees`}
        dateRange={dateRange}
        actions={
          <>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
              }}
              id="export-employees-btn"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download size={14} /> {isExporting ? 'Exporting...' : 'Export'}
            </button>
            <button
              id="add-employee-btn"
              onClick={() => { setEditEmployee(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: 'var(--color-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
            >
              <Plus size={14} /> Add new +
            </button>
          </>
        }
      />

      {/* Search + Filter bar */}
      <div className="data-card flex flex-wrap items-center gap-3 mb-4 p-4"
        style={{
          background: 'var(--color-surface)',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
        }}>
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search employees..."
          id="employee-search"
        />
        <FilterDropdown
          filters={filterConfig}
          values={filters}
          onChange={handleFilterChange}
          onClear={() => setFilters({ department: '', status: '', contract_type: '' })}
        />
        {(search || Object.values(filters).some(Boolean)) && (
          <button
            className="text-xs px-2 py-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            onClick={() => { setSearch(''); setFilters({ department: '', status: '', contract_type: '' }); setPage(1); }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={employees}
        rowActions={rowActions}
        total={total}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        loading={isLoading}
        emptyType="employees"
        emptyTitle="No employees found"
        emptyDescription="Add your first employee or try adjusting your search filters."
        emptyAction={
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            Add Employee
          </button>
        }
      />

      {/* Employee Form Modal */}
      {showForm && (
        <EmployeeForm
          open={showForm}
          onClose={() => { setShowForm(false); setEditEmployee(null); }}
          employee={editEmployee}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Employee"
        description={`This action cannot be undone. ${deleteEmployee ? `${deleteEmployee.first_name} ${deleteEmployee.last_name}` : 'This employee'} will be marked as terminated.`}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </PageWrapper>
  );
}
