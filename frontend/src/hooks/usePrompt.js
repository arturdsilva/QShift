import { useEffect, useRef } from 'react';

// Hook para bloquear navegação quando há dados não salvos
export function usePrompt(when, onConfirm) {
    const whenRef = useRef(when);
    const onConfirmRef = useRef(onConfirm);

    useEffect(() => {
        whenRef.current = when;
        onConfirmRef.current = onConfirm;
    }, [when, onConfirm]);

    useEffect(() => {
        if (!when) return;

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };

        const handleUnload = () => {
            const cleanup = onConfirmRef.current;
            cleanup();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
        };
    }, [when]);
}

