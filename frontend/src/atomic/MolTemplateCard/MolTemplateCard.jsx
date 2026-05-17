import { Clock, Users, Layers, CalendarDays, Pencil, Trash2, Play } from 'lucide-react';
import { Button } from '../AtmButton/index.js';
import { AtmText } from '../AtmText/index.js';
import { BADGE_COLOR, COLOR_OPTIONS } from '../../constants/shiftColors.js';
import './MolTemplateCard.css';

const TYPE_CONFIG = {
  shift: { label: 'Shift', icon: Clock, badgeClass: 'mol-template-card__type-badge--shift' },
  day: { label: 'Day', icon: CalendarDays, badgeClass: 'mol-template-card__type-badge--day' },
  schedule: { label: 'Week', icon: Layers, badgeClass: 'mol-template-card__type-badge--schedule' },
};

function getColorHex(colorName) {
  const opt = COLOR_OPTIONS.find((c) => c.value === colorName);
  return opt?.hex || '#60a5fa';
}

/**
 * MolTemplateCard – visual card for a template (shift, day, or schedule).
 *
 * Props:
 *   item      – the template object from IndexedDB
 *   type      – 'shift' | 'day' | 'schedule'
 *   onEdit    – callback(item)
 *   onDelete  – callback(item)
 *   onUse     – callback(item) – optional, navigates to apply template
 */
export function MolTemplateCard({ item, type, onEdit, onDelete, onUse }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.shift;
  const TypeIcon = cfg.icon;
  const resolvedColor = item.color || 'blue';
  const badge = BADGE_COLOR[resolvedColor] || BADGE_COLOR.blue;

  /* ── build meta lines depending on type ── */
  const metaLines = [];

  if (type === 'shift') {
    const start = item.start || '--:--';
    const end = item.end || '--:--';
    metaLines.push({ icon: Clock, text: `${start} – ${end}` });
    metaLines.push({ icon: Users, text: `${item.staff || 0} staff required` });
  }

  if (type === 'day') {
    const shiftCount = item.shifts?.length || 0;
    metaLines.push({ icon: Layers, text: `${shiftCount} shift${shiftCount !== 1 ? 's' : ''} included` });
  }

  if (type === 'schedule') {
    const dayCount = item.days?.filter((d) => d.shifts?.length > 0).length || 0;
    metaLines.push({ icon: CalendarDays, text: `${dayCount} day${dayCount !== 1 ? 's' : ''} configured` });
  }

  /* ── shifts preview for day/schedule types ── */
  const shiftsPreview =
    type === 'day'
      ? item.shifts || []
      : type === 'schedule'
        ? (item.days || []).flatMap((d) => d.shifts || [])
        : [];

  return (
    <div className="mol-template-card">
      {/* type pill */}
      <div className={`mol-template-card__type-badge ${cfg.badgeClass}`}>
        <TypeIcon size={10} />
        {cfg.label}
      </div>

      {/* name badge */}
      <span className={`mol-template-card__name ${badge.text} ${badge.bg}`}>
        {item.name}
      </span>

      {/* meta info */}
      <div className="mol-template-card__meta">
        {metaLines.map((line, i) => {
          const Icon = line.icon;
          return (
            <div key={i} className="mol-template-card__meta-row">
              <Icon size={14} />
              <AtmText size="sm" color="muted">{line.text}</AtmText>
            </div>
          );
        })}
      </div>

      {/* shifts preview tags (day / schedule only) */}
      {shiftsPreview.length > 0 && (
        <div className="mol-template-card__shifts-preview">
          {shiftsPreview.slice(0, 6).map((s, i) => (
            <span key={i} className="mol-template-card__shift-tag">
              <span
                className="mol-template-card__shift-dot"
                style={{ backgroundColor: getColorHex(s.color) }}
              />
              {s.name}
            </span>
          ))}
          {shiftsPreview.length > 6 && (
            <span className="mol-template-card__shift-tag">
              +{shiftsPreview.length - 6} more
            </span>
          )}
        </div>
      )}

      {/* action buttons */}
      <div className="mol-template-card__actions">
        {onUse && (
          <Button variant="primary" size="sm" onClick={() => onUse(item)} className="mol-template-card__use-btn">
            <Play size={12} />
            Use
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onEdit?.(item)}>
          <Pencil size={13} />
          Edit
        </Button>
        <Button variant="ghostRed" size="sm" onClick={() => onDelete?.(item)}>
          <Trash2 size={13} />
          Delete
        </Button>
      </div>
    </div>
  );
}
