import { useState, useEffect } from 'react';
import {Users, Plus, ArrowRight} from 'lucide-react';
import BaseLayout from '../layouts/BaseLayout.jsx';
import Header from '../components/Header.jsx';
import {StaffApi} from '../services/api.js';

function StaffPage({ 
    onPageChange,
    selectEditEmployee,
    setSelectEditEmployee,
    isLoading,
    setIsLoading,
    employees,
    setEmployees
  }) {
    useEffect(() => {
    async function employeeData() {
        setIsLoading(true);
        try {
        const staffResponse = await StaffApi.getAll();
        setEmployees(staffResponse.data);

        console.log('Fetched Employees:', staffResponse.data);
        } catch (error) {
        console.error('Erro ao carregar dados da API:', error);
        } finally {
            setIsLoading(false);
        }
    }
    employeeData();
    }, []);


  const handleAddEmployee = () => {
      console.log('Add employee');
      setSelectEditEmployee(null);
      onPageChange(5);
  };

  const handleEditEmployee = (employeeId) => {
    setIsLoading(true);
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      console.log('entrou', emp);
      setSelectEditEmployee(emp);
      onPageChange(5);
    } else {
      console.warn('Funcionário não encontrado:', employeeId);
    }
  };
  const handleToggleActive = async (employeeId, currentStatus) => {
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      const employeeData = {...emp, active: !currentStatus};
      StaffApi.updateEmployeeData(employeeId, employeeData);
      setEmployees(employees.map(emp => 
          emp.id === employeeId ? {...emp, active: !emp.active} : emp
      ));
      console.log('Toggle status:', employeeId, employeeData.active);
    }
  };

  const handleAdvance = () => {
      onPageChange(2);
  };

  if (isLoading) {
      return (
          <BaseLayout showSidebar={false} currentPage={7} onPageChange={onPageChange}>
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
    <BaseLayout currentPage={1} onPageChange={onPageChange}>
      <Header title="Employee Management" icon={Users} />
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Cards dos funcionários existentes */}
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="bg-slate-800 rounded-lg border border-slate-700 hover:border-indigo-500 transition-all duration-200"
            >
              {/* Área clicável para edição */}
              <div
                onClick={() => handleEditEmployee(employee.id)}
                className="p-6 cursor-pointer hover:bg-slate-750 transition-colors rounded-t-lg"
              >
                <div className="text-lg font-medium text-white mb-1">
                  {employee.name}
                </div>
                <div className="text-sm text-slate-400">
                  Click to edit
                </div>
              </div>
              
              {/* Seção do checkbox */}
              <div className="px-6 pb-4 pt-2 border-t border-slate-700">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={employee.active}
                      onChange={() => handleToggleActive(employee.id, employee.active)}
                      className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-900 checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    />
                  </div>
                  <span className={`text-sm font-medium transition-colors ${
                    employee.active ? 'text-green-400' : 'text-slate-500'
                  }`}>
                    {employee.active ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>
          ))}
          
          {/* Card para adicionar novo funcionário */}
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
          <div className="text-slate-400 text-center py-12">
            No employees registered yet
          </div>
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
    </BaseLayout>
  );
}

export default StaffPage;
