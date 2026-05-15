import { SelectableButton } from '../AtmButton/index.js';
import './MolMetricSelector.css';

export function MolMetricSelector({ metrics, selectedMetric, onSelect, colors }) {
    return (
        <div className="mol-metric-selector">
            {metrics.map((metric) => (
                <SelectableButton
                    key={metric.key}
                    variant="default"
                    size="md"
                    selected={selectedMetric === metric.key}
                    className={selectedMetric === metric.key ? colors[metric.key].bgButton + '' : ''}
                    onClick={() => onSelect(metric.key)}
                >
                    {metric.label}
                </SelectableButton>
            ))}
        </div>
    );
}