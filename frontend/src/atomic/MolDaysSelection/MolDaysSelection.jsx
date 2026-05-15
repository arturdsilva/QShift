import { AtmText } from '../AtmText/index.js';
import './MolDaysSelection.css';

/**
 * MolDaysSelection – displays selected days as chips
 */
export function MolDaysSelection({ selectedDays }) {
  const hasSelection = selectedDays && selectedDays.length > 0;

  return (
    <div className="mol-days-selection">
      <AtmText as="h3" size="xs" weight="semibold" color="muted" className="uppercase tracking-wider flex items-center gap-2">
        Selected Days
      </AtmText>
      <div className="mol-days-selection__container">
        {hasSelection ? (
          <div className="mol-days-selection__chips">
            {selectedDays.map((d) => (
              <div
                key={d.toISOString()}
                className="mol-days-selection__chip"
                title={d.toDateString()}
              >
                {d.getDate()}
              </div>
            ))}
          </div>
        ) : (
          <AtmText size="sm" color="faint" className="mol-days-selection__empty">
            No days selected
          </AtmText>
        )}
      </div>
    </div>
  );
}
