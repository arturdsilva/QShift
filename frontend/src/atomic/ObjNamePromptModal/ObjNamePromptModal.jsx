import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '../AtmButton';
import { AtmText } from '../AtmText';
import { MolFormField } from '../MolFormField';

/**
 * Simple modal that asks for a name before saving a day/schedule template.
 */
export function ObjNamePromptModal({ title, placeholder, onSave, onCancel }) {
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#131c2e] border border-[#1e2d47] rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2d47]">
          <AtmText as="p" size="base" weight="semibold" color="white">
            {title}
          </AtmText>
          <Button onClick={onCancel} variant="ghost" size="sm">
            <X size={16} />
          </Button>
        </div>

        <div className="p-5">
          <MolFormField
            label="Template Name"
            variant="shiftConfig"
            placeholder={placeholder || 'e.g. Peak Operations'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#1e2d47]">
          <Button variant="secondary" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => onSave(name)}
            disabled={!name.trim()}
          >
            <Save size={14} />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
