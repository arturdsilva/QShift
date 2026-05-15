import { AtmText } from '../AtmText/index.js';
import './MolReportCard.css';

/**
 * MolReportCard – a clickable card on the Reports page
 */
export function MolReportCard({ card, onClick }) {
  const Icon = card.icon;
  return (
    <div
      onClick={() => onClick(card)}
      className="mol-report-card"
    >
      <Icon size={40} className="mol-report-card__icon" />
      <AtmText as="p" size="4xl" weight="bold" color="muted" className="mb-2">{card.value}</AtmText>
      <AtmText as="p" size="sm" color="faint">{card.title}</AtmText>
    </div>
  );
}
