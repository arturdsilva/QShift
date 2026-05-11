import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { AtmText } from '../AtmText';
import { AccordionButton, Button } from '../AtmButton';
import { TemplateItem } from '../MolScheduleTemplateItem';

export function ObjSidebarSectionTemplate({ title, items, type, color, onDelete, onAdd, emptyText }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}
        className="mb-2 bg-transparent hover:bg-transparent p-0 w-full flex items-center justify-between cursor-pointer"
      >
        <AtmText as="span" size="xs" weight="bold" color="faint" className="uppercase tracking-widest">
          {title}
        </AtmText>
        <div className="flex items-center gap-1">
          {onAdd && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="w-5 h-5 p-0 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center"
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