import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../AtmButton/index.js';
import { METRIC_COLORS, STATS_CONFIG } from '../../constants/employeeStatsConfig.js';
import { months } from '../../constants/constantsOfTable.js';
import { AtmText } from '../AtmText/Text.jsx';
import { MolMetricSelector } from '../MolMetricSelector';
import './ObjChartHeader.css';

export function ObjChartHeader({
    selectedMetric,
    setSelectedMetric,
    currentMonth,
    currentYear,
    onPrevMonth,
    onNextMonth,
    onPrevYear,
    onNextYear,
}) {
    return (
        <div className="obj-chart-header">
            <div className="obj-chart-header__controls">
                <AtmText as="h3" size="lg" weight="semibold" color="white">
                    Select Metric to Display
                </AtmText>
                <div className="obj-chart-header__nav-group">
                    <div className="obj-chart-header__nav">
                        <Button onClick={onPrevMonth} variant="periodNav" title="Previous month">
                            <ChevronLeft size={24} className="text-white" />
                        </Button>
                        <AtmText as="span" size="xl" weight="medium" color="white" className="obj-chart-header__month-label">
                            {months[currentMonth - 1]}
                        </AtmText>
                        <Button onClick={onNextMonth} variant="periodNav" title="Next month">
                            <ChevronRight size={24} className="text-white" />
                        </Button>
                    </div>
                    <div className="obj-chart-header__nav">
                        <Button onClick={onPrevYear} variant="periodNav" title="Previous Year">
                            <ChevronLeft size={24} className="text-white" />
                        </Button>
                        <AtmText as="span" size="xl" weight="medium" color="white" className="obj-chart-header__year-label">
                            {currentYear}
                        </AtmText>
                        <Button onClick={onNextYear} variant="periodNav" title="Next Year">
                            <ChevronRight size={24} className="text-white" />
                        </Button>
                    </div>
                </div>
            </div>

            <MolMetricSelector
                metrics={STATS_CONFIG}
                selectedMetric={selectedMetric}
                onSelect={setSelectedMetric}
                colors={METRIC_COLORS}
            />
        </div>
    );
}

