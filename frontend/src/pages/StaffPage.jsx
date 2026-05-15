import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, ArrowRight, AlertTriangle, X, Trash2 } from 'lucide-react';
import { ObjAppLayout as BaseLayout } from '../atomic/ObjAppLayout';
import { StaffApi } from '../services/api.js';
import { MolPageHeader } from '../atomic/MolPageHeader';
import { MolEmployeeCard } from '../atomic/MolEmployeeCard';
import { Button } from '../atomic/AtmButton/index.js';
import { MolLoadingPage } from '../atomic/MolLoadingPage';
import { ObjModal } from '../atomic/ObjModal';
import { AtmText } from '../atomic/AtmText/index.js';
import { MolAddEmployeeCard } from '../atomic/MolAddEmployeeCard';
import './StaffPage.css';

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
        sessionStorage.setItem('employees', JSON.stringify(staffResponse.data));
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
      setEmployees((prevEmployees) => {
        const updatedEmployees = prevEmployees.filter((emp) => emp.id !== employeeId);
        sessionStorage.setItem('employees', JSON.stringify(updatedEmployees));
        return updatedEmployees;
      });
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting employee:', error);
      setDeleteConfirmation(null);
    }
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
    }
  };

  const handleToggleActive = async (employeeId, currentStatus) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) {
      const employeeData = { ...emp, active: !currentStatus };
      StaffApi.updateEmployeeData(employeeId, employeeData);
      setEmployees((prevEmployees) => {
        const updatedEmployees = prevEmployees.map((emp) =>
          emp.id === employeeId ? { ...emp, active: !emp.active } : emp,
        );
        sessionStorage.setItem('employees', JSON.stringify(updatedEmployees));
        return updatedEmployees;
      });
    }
  };

  const handleAdvance = () => {
    setIsLoading(true);
    navigate('/calendar');
  };

  if (isLoading) return (
    <BaseLayout currentPage={1} showSidebar={false}>
      <MolLoadingPage />
    </BaseLayout>
  );

  return (
    <BaseLayout currentPage={1}>
      <MolPageHeader title="Employee Management" icon={Users} />

      <div className="staff-page__content">
        <div className="staff-page__grid">
          {employees.map((employee) => (
            <MolEmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={handleEditEmployee}
              onDelete={setDeleteConfirmation}
              onToggleActive={handleToggleActive}
            />
          ))}
          <MolAddEmployeeCard onAdd={handleAddEmployee} />
        </div>

        {employees.length === 0 ? (
          <div className="staff-page__empty">No employees registered yet</div>
        ) : (
          <div className="staff-page__advance-row">
            <Button onClick={handleAdvance} variant='primary' size='lg'>
              Next
              <ArrowRight size={20} />
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmation && (
        <ObjModal title="Confirm Delete" onClose={() => setDeleteConfirmation(null)}>
          <div className="staff-page__delete-modal-body">

            <AtmText color="dimmer">
              Deleting this employee will also remove all associated history.
              Are you sure you want to proceed?
            </AtmText>

            <div className="staff-page__delete-modal-info">
              <AtmText weight="semibold">
                {deleteConfirmation.name}
              </AtmText>

              <AtmText as='p' size="sm" color="dimmer" className="staff-page__delete-modal-warning">
                This action cannot be undone.
              </AtmText>
            </div>

            <div className="staff-page__delete-modal-actions">
              <Button onClick={() => setDeleteConfirmation(null)} variant='secondary' size='lg'>
                Cancel
              </Button>

              <Button onClick={() => handleDeleteEmployee(deleteConfirmation.id)} variant='danger' size='lg'>
                <Trash2 size={16} />
                Delete
              </Button>
            </div>

          </div>
        </ObjModal>
      )}
    </BaseLayout>
  );
}

export default StaffPage;
