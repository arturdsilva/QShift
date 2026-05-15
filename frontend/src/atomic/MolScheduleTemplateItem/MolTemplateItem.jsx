import { AtmText } from "../AtmText";
import { Button } from "../AtmButton";
import { Trash2 } from "lucide-react";
import { BADGE_COLOR } from "../../constants/shiftColors.js";
import './MolTemplateItem.css';

export function TemplateItem({ item, meta, onDelete, color }) {
    const resolvedColor = color || 'white';
    const badge = BADGE_COLOR[resolvedColor] || BADGE_COLOR.blue;
    return (
        <div
            draggable
            onDragStart={(e) =>
                e.dataTransfer.setData("text/plain", JSON.stringify({ ...item, _type: item._type || 'shift' }))
            }
            className="mol-template-item"
        >
            <div className='mol-template-item__content'>
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