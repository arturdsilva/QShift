import { AtmText } from "../AtmText/index.js";
import './MolLoadingPage.css';

/**
 * MolLoadingPage – loading page
 */
export function MolLoadingPage() {
    return (
        <div className="mol-loading-page">
            <div className="mol-loading-page__content">
                <div className="mol-loading-page__spinner" />
                <AtmText size="sm" color="muted">Loading...</AtmText>
            </div>
        </div>
    );
}