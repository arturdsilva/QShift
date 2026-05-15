import { Button } from "../AtmButton/index.js";
import { X } from "lucide-react";
import { AtmDivider } from "../AtmDivider/Divider.jsx";
import { AtmText } from "../AtmText/Text.jsx";
import './ObjModal.css';

export function ObjModal({ title, children, onClose }) {
    return (
        <div className="obj-modal-overlay">
            <div className="obj-modal">
                <div className="obj-modal__header">
                    <div className="obj-modal__title-group">
                        <AtmText as="h3" size="lg" weight="semibold" color="white">
                            {title}
                        </AtmText>
                    </div>
                    <Button onClick={onClose} variant='ghost'>
                        <X size={24} />
                    </Button>
                </div>
                <AtmDivider />
                <div className="obj-modal__body">{children}</div>
            </div>
        </div>
    );
}