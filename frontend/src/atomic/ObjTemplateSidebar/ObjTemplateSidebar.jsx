import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { AtmText } from '../AtmText';
import { Button } from '../AtmButton';
import { TemplateItem } from '../MolScheduleTemplateItem';

/* ── collapsible section ───────────────────────────────── */
function SidebarSection({ title, items, type, color, onDelete, onAdd, emptyText }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-2 group"
      >
        <AtmText as="span" size="xs" weight="bold" color="faint" className="uppercase tracking-widest">
          {title}
        </AtmText>
        <div className="flex items-center gap-1">
          {onAdd && (
            <span
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer"
            >
              <Plus size={12} className="text-white" />
            </span>
          )}
          {open
            ? <ChevronDown size={14} className="text-slate-500" />
            : <ChevronRight size={14} className="text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
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
            <div className="py-3 text-center">
              <AtmText size="xs" color="faint">{emptyText || 'No templates yet'}</AtmText>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── main sidebar ──────────────────────────────────────── */
export function ObjTemplateSidebar({
  shiftTemplates = [],
  dayTemplates = [],
  scheduleTemplates = [],
  onCreateShift,
  onDeleteShift,
  onCreateDay,
  onDeleteDay,
  onCreateSchedule,
  onDeleteSchedule,
  onCreateNewTemplate,
}) {
  return (
    <aside className="w-[240px] shrink-0 flex flex-col h-full border border-[#1e2d47] rounded-lg bg-[#0a1120]/80">
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <SidebarSection
          title="Shifts"
          items={shiftTemplates}
          type="shift"
          onAdd={onCreateShift}
          onDelete={onDeleteShift}
          emptyText="Create your first shift"
        />

        <SidebarSection
          title="Days"
          items={dayTemplates}
          type="day"
          onAdd={onCreateDay}
          onDelete={onDeleteDay}
          emptyText="Save a day config"
        />

        <SidebarSection
          title="Schedules"
          items={scheduleTemplates}
          type="schedule"
          onAdd={onCreateSchedule}
          onDelete={onDeleteSchedule}
          emptyText="Save a full schedule"
        />
      </div>
    </aside>
  );
}
