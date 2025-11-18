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
            const cleanup = onConfirmRef.current;
            if (cleanup) {
                try {
                    cleanup();
                } catch (error) {
                    console.error('Erro ao executar cleanup no beforeunload:', error);
                }
            }
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [when]);
}

