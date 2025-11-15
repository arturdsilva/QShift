import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import {BarChart3, ChevronLeft, ChevronRight} from 'lucide-react';

function EmployeeSelector({
    employeesList,
    currentEmployee,
    onToggleEmployee,
    month,
    year
}) {
  return (
      <div className='bg-slate-800 p-6 rounded-lg shadow-xl max-w-md border border-slate-700'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xl font-bold text-slate-200'>Employees</h3>
        </div>
        <div className='space-y-2 max-h-96 overflow-y-auto mb-6'>
          {employeesList.map(emp => {
            const isSelected = emp.id === currentEmployee.id;
            return (
              <button
                onClick={() => onToggleEmployee(emp, month, year)}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${isSelected 
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>{emp.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
  );
}

function EmployeeReportsPage({
    onPageChange,
    isLoading,
    setLoading
}) {
    // Dados mockados para demonstração
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const employeesList = [
        {id: 1, name: "employee x"}
    ];


    const [currentEmployee, setCurrentEmployee] = useState(employeesList[0]);
    const handleToggleEmployee = (employee, month, year) => {
        console.log("Selecionando relatório do funcionário:", employee, month, year);
        setCurrentEmployee(employee);
        // No futuro vou implmentar um fetch para pegar os dados estatísticos do funcionário selecionado e vou vou tornar essa função assíncrona
    }

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handlePrevMonth = () => {
        if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
        } else {
        setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
        } else {
        setCurrentMonth(currentMonth + 1);
        }
    };

    const handlePrevYear = () => {
        setCurrentYear(currentYear - 1);
    };

    const handleNextYear = () => {
        setCurrentYear(currentYear + 1);
    };

    return (
        <BaseLayout 
            showSidebar={false}
            currentPage={10}
            onPageChange={onPageChange}
        >
            <Header title={"Employees Reports"} icon={BarChart3} >
                <div className="flex items-center gap-4 ml-8">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Previous month"
                    >
                        <ChevronLeft size={24} className="text-slate-300" />
                    </button>
                    
                    <span className="text-xl text-slate-200 font-medium min-w-[200px] text-center">
                        {months[currentMonth - 1]}
                    </span>
                    
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Next month"
                    >
                        <ChevronRight size={24} className="text-slate-300" />
                    </button>
                </div>
                <div className="flex items-center gap-4 ml-8">
                    <button
                        onClick={handlePrevYear}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Previous Year"
                    >
                        <ChevronLeft size={24} className="text-slate-300" />
                    </button>
                    
                    <span className="text-xl text-slate-200 font-medium min-w-[200px] text-center">
                        {currentYear}
                    </span>
                    
                    <button
                        onClick={handleNextYear}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Next Year"
                    >
                        <ChevronRight size={24} className="text-slate-300" />
                    </button>
                </div>
            </Header>
            <div className='flex gap-8 p-2'>
                <EmployeeSelector
                    employeesList={employeesList}
                    currentEmployee={currentEmployee}
                    onToggleEmployee={handleToggleEmployee}
                    month={currentMonth}
                    year={currentYear}
                />
                <div className=''>
                    <div className='flex gap-2 flex-wrap'>
                        {/* Aqui dentro colocar as quatro estatísticas de dados interassantes em formas de cards: 
                        Número de folgas no mês, 
                        dias trabalhados no mês, 
                        Horas trabalhadas no mês,
                        números de turnos de manhã, 
                        números de turnos da tarde
                         */}

                        {/* Exemplo de card */}
                        <div
                            className="bg-slate-800 rounded-lg p-3 w-48 border border-slate-700 overflow-hidden"
                        >
                            <p className="text-sm text-slate-500">title</p>
                            <p className="text-4xl font-bold text-slate-400 mb-2">Value</p>
                        </div>
                    </div>

                    <div className='mt-8'>
                        <div className='mb-4'>
                            Uma toolbar para seleção do do dado a ser exibido no gráfico
                        </div>
                        <div className=''>
                            Gráfico de barras mostrando: 
                            Dias trablahados no mês ||
                            Horas trabalhadas no mês ||
                            Folgas no mês ||
                            Turnos da manha no mês ||
                            Turnos da tarde no mês
                        </div>
                    </div>
                </div>
            </div>
        </BaseLayout>
    )
}

export default EmployeeReportsPage;