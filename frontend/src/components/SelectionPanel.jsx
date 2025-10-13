function SelectionPanel({ selectedWeek, selectedDays }) {
  const weekText = selectedWeek 
    ? `Semana: ${selectedWeek}` 
    : 'Semana: Nenhuma';

  const daysText = selectedDays.length > 0
    ? `Dias: ${selectedDays.map(d => d.getDate()).join(', ')}`
    : 'Dias: Nenhum';

  return (
    <div className="w-64 p-4 space-y-4">
      <h3 className="text-lg font-bold text-white">Seleção Atual</h3>
      
      <div className="border-2 border-blue-400 rounded-xl p-4 text-center">
        <p className="text-slate-300">{weekText}</p>
      </div>
      
      <div className="border-2 border-blue-400 rounded-xl p-4 text-center">
        <p className="text-slate-300">{daysText}</p>
      </div>
    </div>
  );
}

export default SelectionPanel;