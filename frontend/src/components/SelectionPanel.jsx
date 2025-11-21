function SelectionPanel({ startDate, selectedDays }) {
  const startDateText =
    selectedDays.length > 0
      ? `start week: ${new Date(startDate.getTime()).toDateString()}`
      : 'start week: None';
  const finalDateText =
    selectedDays.length > 0
      ? `final week: ${new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000).toDateString()}`
      : 'final week: None';

  const daysText =
    selectedDays.length > 0
      ? `Days: ${selectedDays.map((d) => d.getDate()).join(', ')}`
      : 'Days: None';

  return (
    <div className="w-64 p-4 space-y-4">
      <h3 className="text-lg font-bold text-white">Week Selection</h3>
      <div className="border-2 border-blue-400 rounded-xl p-4 text-center">
        <p className="text-slate-300">{startDateText}</p>
        <p className="text-slate-300 mt-2">{finalDateText}</p>
      </div>

      <h3 className="text-lg font-bold text-white">Days Selection</h3>
      <div className="border-2 border-blue-400 rounded-xl p-4 text-center">
        <p className="text-slate-300">{daysText}</p>
      </div>
    </div>
  );
}

export default SelectionPanel;
