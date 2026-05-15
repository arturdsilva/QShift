import { AtmInput } from '../AtmInput/index.js';
import { AtmCheckbox } from '../AtmCheckbox/index.js';
import { AtmText } from '../AtmText/index.js';
import { AtmAvatar } from '../AtmAvatar/index.js';
import './MolEmployeeProfile.css';

/**
 * MolEmployeeProfile – avatar + name input + active checkbox card
 */
export function MolEmployeeProfile({ name, setName, workload, setWorkload, isActive, setIsActive, error }) {
  return (
    <div className="mol-employee-profile">
      <div className="mol-employee-profile__info">
        <div className="mol-employee-profile__avatar-row">
          <AtmAvatar name={name} active={isActive} />
          <div className="mol-employee-profile__name-input-wrapper">
            <AtmText as="label" size="sm" weight="medium" color="dimmer" className="block mb-2 w-[150px]">
              Employee name
            </AtmText>
            <AtmInput
              type="text"
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter the name..."
              variant='profile'
            />
            {error && <AtmText as="p" size="xs" color="red" className="mt-1">{error}</AtmText>}
          </div>
        </div>
        <div className="mol-employee-profile__checkbox-row">
          <AtmCheckbox
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
            activeLabel="Active Employee"
            inactiveLabel="Inactive Employee"
          />
        </div>
      </div>
      <div className='mol-employee-profile__divider'></div>
      <div className='mol-employee-profile__workload'>
        <AtmText as="label" size="sm" weight="medium" color="dimmer" className="block mb-2">
          Weekly Workload (hours)
        </AtmText>
        <AtmInput
          type="text"
          value={workload}
          placeholder="No specific workload"
          onChange={(e) => { setWorkload(e.target.value); }}
          variant='number'
          className="w-full"
        />
      </div>
    </div>
  );
}
