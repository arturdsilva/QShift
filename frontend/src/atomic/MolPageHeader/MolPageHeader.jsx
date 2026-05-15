import { AtmDivider } from '../AtmDivider/index.js';
import { AtmText } from '../AtmText/index.js';
import './MolPageHeader.css';

/**
 * MolPageHeader – page header with icon + title + children slot + divider
 */
export function MolPageHeader({ title, icon: Icon, children }) {
  return (
    <div className="mol-page-header">
      <div className="mol-page-header__title-row">
        <div className="mol-page-header__title-group">
          {Icon && <Icon size={32} className="mol-page-header__icon" />}
          <AtmText as="h1" size="2xl" weight="bold">{title}</AtmText>
        </div>
        {children}
      </div>
      <AtmDivider />
    </div>
  );
}
