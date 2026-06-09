import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Building2, X } from 'lucide-react';
import { employeeApiCalls } from '../../api/employeeApi';
import { departmentApiCalls } from '../../api/departmentApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { isHR } = useAuth();
  const inputRef = useRef(null);

  // Keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setEmployees([]);
      setDepartments([]);
    }
  }, [isOpen]);

  // Fetch results
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setEmployees([]);
      setDepartments([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const empPromise = employeeApiCalls.getAll({ search: debouncedQuery, limit: 5 });
        const deptPromise = isHR ? departmentApiCalls.getAll({ search: debouncedQuery }) : Promise.resolve({ data: [] });

        const [empRes, deptRes] = await Promise.all([empPromise, deptPromise]);
        
        setEmployees(empRes.employees || []);
        setDepartments(deptRes.data || []);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, isHR]);

  const handleSelectEmployee = (id) => {
    setIsOpen(false);
    navigate(isHR ? `/employees/${id}` : `/employees`); // Employees might not have detail access
  };

  const handleSelectDept = () => {
    setIsOpen(false);
    navigate('/departments');
  };

  if (!isOpen) return null;

  const hasResults = employees.length > 0 || departments.length > 0;
  const showEmptyState = debouncedQuery.trim() && !isLoading && !hasResults;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div 
        className="bg-surface w-full max-w-xl rounded-xl shadow-2xl border flex flex-col overflow-hidden" 
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <Search size={20} style={{ color: 'var(--color-text-secondary)' }} className="mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-base"
            style={{ color: 'var(--color-text-primary)' }}
            placeholder="Search employees or departments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={16} style={{ color: 'var(--color-text-tertiary)' }} />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-2">
          {isLoading && (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Searching...
            </div>
          )}

          {!isLoading && showEmptyState && (
            <div className="p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No results found for <span className="font-semibold">"{debouncedQuery}"</span>
              </p>
            </div>
          )}

          {!isLoading && hasResults && (
            <div className="space-y-4">
              
              {/* Employees Group */}
              {employees.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Employees
                  </div>
                  <ul className="space-y-1">
                    {employees.map(emp => (
                      <li key={emp.id}>
                        <button 
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                          onClick={() => handleSelectEmployee(emp.id)}
                        >
                          {emp.photo_url ? (
                            <img src={emp.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white bg-primary">
                              {getInitials(emp.first_name, emp.last_name)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{emp.first_name} {emp.last_name}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{emp.position_title || emp.department_name || 'No department'}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Departments Group */}
              {departments.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Departments
                  </div>
                  <ul className="space-y-1">
                    {departments.map(dept => (
                      <li key={dept.id}>
                        <button 
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                          onClick={() => handleSelectDept(dept.id)}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 border">
                            <Building2 size={14} style={{ color: 'var(--color-text-secondary)' }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{dept.name}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{dept.employee_count} employees</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

          {/* Initial state (no query) */}
          {!debouncedQuery.trim() && !isLoading && (
            <div className="p-6 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Type to start searching employees and departments...
            </div>
          )}
        </div>
        
        <div className="px-4 py-2 border-t text-xs flex justify-between items-center" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}>
          <span><span className="font-semibold">↑↓</span> to navigate</span>
          <span><span className="font-semibold">esc</span> to close</span>
        </div>
      </div>
    </div>
  );
}
