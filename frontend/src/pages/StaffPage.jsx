import { useState } from 'react';
import {Users, Plus} from 'lucide-react';
import BaseLayout from '../layouts/BaseLayout.jsx';
import Header from '../components/Header.jsx';

function StaffPage({ 
    onPageChange,
    selectEditEmployee,
    setSelectEditEmployee
  }) {
    //TODO: receber os dados do backend dos funcionários

    // dados modelo
    const [employees, setEmployees] = useState([
        { id: 1, name: 'Guilherme Moriya', active: true },
        { id: 2, name: 'Artur Dantas', active: true },
        { id: 3, name: 'Gabriel Padilha', active: false },
        { id: 4, name: 'Arthur Rocha', active: false },
        { id: 5, name: 'Ângelo de Carvalho', active: true }
    ]);

    const handleAddEmployee = () => {
        console.log('Add employee');
        setSelectEditEmployee(null);
        onPageChange(4);
    };

    const handleEditEmployee = (employeeId) => {
        console.log('Edit employee:', employeeId);
        //TODO: navegar para página de edição de funcionário
        setSelectEditEmployee(employeeId);
        onPageChange(4);
    }

    const handleToggleActive = async (employeeId, currentStatus) => {
        //TODO: enviar para o backend !currentStatus

        setEmployees(employees.map(emp => 
            emp.id === employeeId ? {...emp, active: !emp.active} : emp
        ));
        console.log('Toggle status:', employeeId, !currentStatus);
    };

  return (
    <BaseLayout currentPage={4} onPageChange={onPageChange}>
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

        {/* Mensagem quando não há funcionários */}
        {employees.length === 0 && (
          <div className="text-slate-400 text-center py-12">
            No employees registered yet
          </div>
        )}
      </div>
    </BaseLayout>
  );
}

export default StaffPage;
