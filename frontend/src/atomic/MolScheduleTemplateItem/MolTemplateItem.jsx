import { AtmText } from "../AtmText";
import { Button } from "../AtmButton";
import { Trash2 } from "lucide-react";
import { COLOR_OPTIONS, BADGE_COLOR } from "../../constants/shiftColors.js";

export function TemplateItem({ item, meta, onDelete, color }) {
    const resolvedColor = color || 'white';
    const badge = BADGE_COLOR[resolvedColor] || BADGE_COLOR.blue;
    const colorOption = COLOR_OPTIONS.find((c) => c.value === resolvedColor);
    const hoverHex = colorOption?.hex || '#1e2d47';

    return (
        <div
            draggable
            onDragStart={(e) =>
                e.dataTransfer.setData("text/plain", JSON.stringify(item))
            }
            className="mb-2 flex cursor-grab items-center justify-between rounded-[10px] border border-[#1e2d47] bg-[#0e1929] px-[12px] py-[10px] transition-colors duration-150"
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = hoverHex)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e2d47")}
        >
            <div className='flex flex-col gap-1.5'>
                <AtmText as="span" size='xs' weight='bold' className={`self-start px-2 py-0.5 rounded uppercase tracking-widest ${badge.text} ${badge.bg}`}>
                    {item.name.slice(0, 17)}
                </AtmText>
                <AtmText size='sm' color='muted'>{meta.slice(0, 40)}</AtmText>
            </div>
            <Button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                }}
                variant='ghostRed'
                size='sm'
            >
                <Trash2 size={15} />
            </Button>
        </div>
    );
}