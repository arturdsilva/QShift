import { AtmText } from '../AtmText/index.js';
import './MolAvailabilityThead.css';

/**
 * MolAvailabilityThead – availability legend: "Select Availability" + color legend
 */
export function MolAvailabilityThead() {
    return (
        <div className="mol-availability-thead">
            <div>
                <AtmText as="h3" size="lg" weight="semibold" className="mb-1">Select Availability</AtmText>
                <AtmText as="p" size="sm" color="muted">Click and drag to mark available times.</AtmText>
            </div>
            <div className="mol-availability-legend">
                <div className="mol-availability-legend__item">
                    <div className="mol-availability-legend__dot--available" />
                    <AtmText color="dimmer">Available</AtmText>
                </div>
                <div className="mol-availability-legend__item">
                    <div className="mol-availability-legend__dot--unavailable" />
                    <AtmText color="dimmer">Unavailable</AtmText>
                </div>
            </div>
        </div>
    );
}