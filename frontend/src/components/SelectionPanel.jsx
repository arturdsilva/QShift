function SelectionPanel({ startDate, selectedDays }) {
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEndDate = (start) => {
    if (!start) return null;
    const date = new Date(start);
    date.setDate(date.getDate() + 6);
    return date;
  };

  const hasSelection = selectedDays && selectedDays.length > 0;

  return (
    <div className="w-64 space-y-3 mt-5">
      {/* Week Selection */}
      <div className="space-y-3 mt-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          Week Selection
        </h3>
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Week of</p>
              <p className="text-white font-medium">
                {hasSelection ? formatDate(startDate) : 'No selection'}
              </p>
            </div>
            <div className="border-t border-slate-700 pt-3">
              <p className="text-xs text-slate-500 mb-1">Until</p>
              <p className="text-white font-medium">
                {hasSelection ? formatDate(getEndDate(startDate)) : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Days Selection */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          Selected Days
        </h3>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 min-h-[100px]">
          {hasSelection ? (
            <div className="flex flex-wrap gap-2">
              {selectedDays.map((d) => (
                <div
                  key={d.toISOString()}
                  className="w-8 h-8 flex items-center justify-center bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-sm font-medium"
                  title={d.toDateString()}
                >
                  {d.getDate()}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
              No days selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectionPanel;
