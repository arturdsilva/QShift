import { daysOfWeek } from '../../constants/constantsOfTable.js';
import { AtmText } from '../AtmText/index.js';
import './MolAvailabilityTable.css';

/**
 * MolAvailabilityTable – drag-to-paint availability grid
 */
export function MolAvailabilityTable({ hours, availability, onMouseDown, onMouseEnter }) {
  return (
    <div className="mol-availability-table">
      <div className="mol-availability-table__wrapper">
        <div
          className="mol-availability-grid"
          style={{ gridTemplateColumns: `100px repeat(${hours.length}, minmax(40px, 1fr))` }}
        >
          {/* Header: corner */}
          <div className="mol-availability-corner" />
          {/* Header: hours */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="mol-availability-header-cell"
            >
              <AtmText size="xs" weight="medium" color="muted">{hour.split(':')[0]}h</AtmText>
            </div>
          ))}

          {/* Rows: days */}
          {daysOfWeek.map((day) => (
            <div key={`label-${day}`} className="contents">
              <div className="mol-availability-day-label">
                <AtmText size="sm" weight="medium" color="dimmer">{day}</AtmText>
              </div>
              {hours.map((hour) => (
                <div
                  key={`${day}-${hour}`}
                  onMouseDown={() => onMouseDown(day, hour)}
                  onMouseEnter={() => onMouseEnter(day, hour)}
                  className={`mol-availability-cell ${availability[day][hour] ? 'mol-availability-cell--active' : 'mol-availability-cell--inactive'
                    }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
