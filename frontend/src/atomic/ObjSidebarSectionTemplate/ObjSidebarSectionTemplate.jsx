import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { AtmText } from '../AtmText';
import { AccordionButton, Button } from '../AtmButton';
import { TemplateItem } from '../MolScheduleTemplateItem';
import './ObjSidebarSectionTemplate.css';

export function ObjSidebarSectionTemplate({ title, items, type, color, onDelete, onAdd, emptyText }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="obj-sidebar-section">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}
        className="obj-sidebar-section__header"
      >
        <AtmText as="span" size="xs" weight="bold" color="faint" className="uppercase tracking-widest">
          {title}
        </AtmText>
        <div className="obj-sidebar-section__header-actions">
          {onAdd && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="obj-sidebar-section__add-btn"
            >
              <Plus size={12} className="text-white" />
            </Button>
          )}
          {open
            ? <ChevronDown size={14} className="text-slate-500" />
            : <ChevronRight size={14} className="text-slate-500" />}
        </div>
      </div>

      {open && (
        <div className="obj-sidebar-section__list">
          {items.length > 0 ? (
            items.map((item) => {
              const meta =
                type === 'shift'
                  ? `${item.start || '--:--'}–${item.end || '--:--'} · ${item.staff || 0} staff`
                  : type === 'day'
                    ? `${item.shifts?.length || 0} Shifts included`
                    : item.meta || 'Full 7-day preset';

              return (
                <TemplateItem
                  key={item.id}
                  item={{
                    ...item,
                    _type: type,
                  }}
                  type={type}
                  color={item.color || 'blue'}
                  meta={meta}
                  onDelete={() => onDelete(item.id)}
                />
              );
            })
          ) : (
            <div className="obj-sidebar-section__empty">
              <AtmText size="xs" color="faint">{emptyText || 'No templates yet'}</AtmText>
            </div>
          )}
        </div>
      )}
    </div>
  );
}