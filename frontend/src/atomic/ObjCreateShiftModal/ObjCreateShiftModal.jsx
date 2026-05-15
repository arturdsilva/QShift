import { useState } from 'react';
import { X, Clock, Save } from 'lucide-react';
import { Button, SelectableButton } from '../AtmButton';
import { AtmText } from '../AtmText';
import { MolFormField } from '../MolFormField';
import { TemplateItem } from '../MolScheduleTemplateItem';
import { COLOR_OPTIONS } from '../../constants/shiftColors.js';
import './ObjCreateShiftModal.css';

const DEFAULT_FORM = { name: '', start: '', end: '', staff: '', color: 'blue' };

export function ObjCreateShiftModal({ onSave, onCancel }) {
  const [form, setForm] = useState(DEFAULT_FORM);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    onSave?.({ ...form, staff: Number(form.staff), id: Date.now() });
    setForm(DEFAULT_FORM);
  }

  const previewItem = {
    id: 'preview',
    name: form.name || 'Atom Template',
  };

  const previewMeta = `${form.start || '--:--'}–${form.end || '--:--'} · ${form.staff || 0} staff`;

  return (
    <div className="obj-create-shift-modal__overlay">
      <div className="obj-create-shift-modal">

        {/* left column: header + form + footer */}
        <div className="obj-create-shift-modal__left">

          <div className="obj-create-shift-modal__header">
            <div className="obj-create-shift-modal__header-icon">
              <Clock size={18} className="text-blue-400" />
            </div>
            <div className="obj-create-shift-modal__header-title">
              <AtmText as="p" size="base" weight="semibold" color="white">
                Create New Template
              </AtmText>
            </div>
            <Button onClick={onCancel} variant="ghost" size="sm">
              <X size={18} />
            </Button>
          </div>

          <div className="obj-create-shift-modal__form">
            <MolFormField
              label="Template Name"
              variant="shiftConfig"
              placeholder="e.g. Morning Rush – Weekdays"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />

            <div className="obj-create-shift-modal__time-grid">
              <MolFormField
                label="Start Time"
                type="time"
                variant="shiftConfig"
                value={form.start}
                onChange={(e) => set('start', e.target.value)}
              />
              <MolFormField
                label="End Time"
                type="time"
                variant="shiftConfig"
                value={form.end}
                onChange={(e) => set('end', e.target.value)}
              />
            </div>

            {/* TODO: add hint de que o sistema vai alertar se a quantidade de funcionários for menor que a quantidade de vagas e implementar essa funcionalidade */}
            <MolFormField
              label="Minimum Staff Members"
              type="number"
              variant="shiftConfig"
              min={1}
              value={form.staff}
              onChange={(e) => set('staff', e.target.value)}
            />

            <div>
              <AtmText as="p" size="sm" weight="medium" color="dimmer" className="mb-2">
                Primary Color Tag
              </AtmText>
              <div className="obj-create-shift-modal__color-section">
                {COLOR_OPTIONS.map((opt) => (
                  <SelectableButton
                    key={opt.value}
                    variant="colorDot"
                    selected={form.color === opt.value}
                    onClick={() => set('color', opt.value)}
                    className={`
                      ${opt.bg}
                      ${form.color === opt.value ? `ring-2 ring-offset-2 ring-offset-[#131c2e] ${opt.ring}` : ''}
                    `}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="obj-create-shift-modal__footer">
            <Button variant="secondary" size="md" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSave} disabled={!form.name.trim()}>
              <Save size={14} />
              Save Template
            </Button>
          </div>
        </div>

        <div className="obj-create-shift-modal__preview">
          <AtmText as="p" size="xs" weight="medium" color="faint" className="uppercase tracking-widest">
            Preview
          </AtmText>

          <TemplateItem
            item={previewItem}
            type="shift"
            color={form.color}
            meta={previewMeta}
            onDelete={() => { }}
          />

          <div className="obj-create-shift-modal__preview-hint">
            <AtmText as="p" size="xs" color="faint" className="text-center leading-relaxed">
              This template can be dragged onto the calendar to quickly populate shifts.
            </AtmText>
          </div>
        </div>

      </div>
    </div>
  );
}

