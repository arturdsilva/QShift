import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, ArrowRight, Trash2, AlertTriangle, X } from 'lucide-react';
import BaseLayout from '../layouts/BaseLayout.jsx';
import Header from '../components/Header.jsx';
import { StaffApi } from '../services/api.js';

function StaffPage({
  selectEditEmployee,
  setSelectEditEmployee,
  isLoading,
  setIsLoading,
  employees,
  setEmployees,
}) {
  const navigate = useNavigate();
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    async function employeeData() {
      setIsLoading(true);
      try {
        const staffResponse = await StaffApi.getAll();
        setEmployees(staffResponse.data);
      } catch (error) {
        console.error('Error loading employee data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    employeeData();
  }, []);

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await StaffApi.deleteEmployee(employeeId);
      setEmployees((prevEmployees) => prevEmployees.filter((emp) => emp.id !== employeeId));
      setDeleteConfirmation(null);
      console.log('Employee removed successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
      setDeleteConfirmation(null);
    }
  };

  const openDeleteConfirmation = (employee) => {
    setDeleteConfirmation(employee);
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation(null);
  };

  const handleAddEmployee = () => {
    setSelectEditEmployee(null);
    navigate('/availability');
  };

  const handleEditEmployee = (employeeId) => {
    setIsLoading(true);
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) {
      setSelectEditEmployee(emp);
      navigate('/availability');
    } else {
      console.warn('Employee not found:', employeeId);
    }
  };

  const handleToggleActive = async (employeeId, currentStatus) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) {
      const employeeData = { ...emp, active: !currentStatus };
      StaffApi.updateEmployeeData(employeeId, employeeData);
      setEmployees(
        employees.map((emp) => (emp.id === employeeId ? { ...emp, active: !emp.active } : emp)),
      );
    }
  };

  const handleAdvance = () => {
    setIsLoading(true);
    navigate('/calendar');
  };

  if (isLoading) {
    return (
      <BaseLayout showSidebar={false} currentPage={1}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      </BaseLayout>
    );
  }
  return (
    <BaseLayout currentPage={1}>
      <Header title="Employee Management" icon={Users} />

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex bg-slate-800 rounded-lg border border-slate-700 hover:border-indigo-500 transition-all duration-200 overflow-hidden"
            >
              <div className="flex-1">
                <div
                  onClick={() => handleEditEmployee(employee.id)}
                  className="p-6 cursor-pointer hover:bg-slate-750 transition-colors"
                >
                  <div className="text-lg font-medium text-white mb-1 max-w-full break-all leading-none">
                    {employee.name}
                  </div>
                  <div className="text-sm text-slate-400">Click to edit</div>
                </div>

                <div className="px-6 pb-4 pt-2 border-t border-slate-700">
                  <label className="flex items-center gap-3 cursor-pointer group items-stretch">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={employee.active}
                        onChange={() => handleToggleActive(employee.id, employee.active)}
                        className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-900 checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                      />
                    </div>
                    <span
                      className={`text-sm font-medium transition-colors ${
                        employee.active ? 'text-green-400' : 'text-slate-500'
                      }`}
                    >
                      {employee.active ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-stretch border-l border-slate-700">
                <button
                  onClick={() => openDeleteConfirmation(employee)}
                  className="px-4 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-all duration-200 group flex items-center justify-center"
                  title="Delete employee"
                >
                  <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddEmployee}
            className="bg-slate-800 rounded-lg border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-750 transition-all duration-200 p-6 flex flex-col items-center justify-center gap-3 min-h-[160px] group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-700 group-hover:bg-indigo-600 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <div className="text-slate-400 group-hover:text-indigo-400 font-medium transition-colors">
              Add Employee
            </div>
          </button>
        </div>

        {employees.length === 0 ? (
          <div className="text-slate-400 text-center py-12">No employees registered yet</div>
        ) : (
          <div className="flex justify-end">
            <button
              onClick={handleAdvance}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Next
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-md w-full shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Confirm Delete</h3>
              </div>
              <button
                onClick={closeDeleteConfirmation}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-slate-300 mb-2">
                Deleting this employee will also remove all associated history. Are you sure you
                want to proceed?
              </p>
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <p className="text-white font-medium">{deleteConfirmation.name}</p>
                <p className="text-sm text-slate-400 mt-1">This action cannot be undone.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
              <button
                onClick={closeDeleteConfirmation}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEmployee(deleteConfirmation.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  );
}

export default StaffPage;
