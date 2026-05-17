import { Loader2, AlertTriangle, XCircle } from 'lucide-react';
import { AtmText } from '../AtmText';
import { Button } from '../AtmButton';
import './MolStatusBanner.css';

const VARIANT_CONFIG = {
    info: {
        bannerClass: 'mol-status-banner--info',
        iconClass: 'mol-status-banner__icon--info',
        icon: Loader2,
    },
    warning: {
        bannerClass: 'mol-status-banner--warning',
        iconClass: 'mol-status-banner__icon--warning',
        icon: AlertTriangle,
    },
    error: {
        bannerClass: 'mol-status-banner--error',
        iconClass: 'mol-status-banner__icon--error',
        icon: XCircle,
    },
};

/**
 * MolStatusBanner
 *
 * Molécula genérica de banner de status.
 *
 * @param {'info'|'warning'|'error'} variant — define cores e ícone
 * @param {string} title
 * @param {string} description
 * @param {Array<{label: string, icon?: React.ComponentType, onClick: () => void, variant?: string}>} [actions]
 */
export function MolStatusBanner({ variant = 'info', title, description, actions }) {
    const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;
    const Icon = config.icon;

    const titleColorMap = { info: 'blue', warning: 'yellow', error: 'red' };
    const titleColor = titleColorMap[variant] || 'white';

    const btnVariantMap = { primary: 'danger', secondary: 'secondary' };

    return (
        <div className={`mol-status-banner ${config.bannerClass}`}>
            <div className="mol-status-banner__icon">
                <Icon className={config.iconClass} />
            </div>

            <div className="mol-status-banner__content">
                <AtmText as="span" size="sm" weight="semibold" color={titleColor}>
                    {title}
                </AtmText>
                <AtmText as="span" size="xs" color="muted">
                    {description}
                </AtmText>

                {actions && actions.length > 0 && (
                    <div className="mol-status-banner__actions">
                        {actions.map((action, idx) => {
                            const ActionIcon = action.icon;
                            const btnVariant = btnVariantMap[action.variant] ?? 'danger';
                            return (
                                <Button
                                    key={idx}
                                    size="sm"
                                    variant={btnVariant}
                                    onClick={action.onClick}
                                >
                                    {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
                                    {action.label}
                                </Button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
