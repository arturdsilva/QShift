import { months } from '../../constants/constantsOfTable.js';
import { AtmText } from '../AtmText/Text.jsx';
import './ObjStatsCards.css';

export function ObjStatsCards({ statsCards, currentMonth, currentYear }) {
  return (
    <div className="obj-stats-cards">
      {statsCards.map((card) => (
        <div
          key={card.key}
          className={`obj-stats-card hover:${card.borderColor}`}
        >
          <AtmText as="p" size="sm" weight="medium" color="dimmer">{card.label}</AtmText>
          <AtmText as="p" size="4xl" weight="bold" color={card.color} className="max-w-full break-all leading-none">
            {card.value}
          </AtmText>
          <AtmText as="p" size="xs" weight="medium" color="muted">
            {months[currentMonth - 1]} {currentYear}
          </AtmText>
        </div>
      ))}
    </div>
  );
}

