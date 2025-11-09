import {Users, BarChart3, CalendarDays } from 'lucide-react';
import { useState, useEffect } from 'react';
import BaseLayout from '../layouts/BaseLayout.jsx';
import Header from '../components/Header.jsx';
import {ReportsApi} from '../services/api.js';

function ReportsPage({ 
    onPageChange,
    weeksList,
    setWeeksList,
    isLoading,
    setIsLoading,
    setWeekRecords,
    currentIdxWeek
}) {
    useEffect(() => {
        setIsLoading(true);
        async function getWeeks() {
            try {
            const weekResponse = await ReportsApi.getWeeks();
            setWeeksList(weekResponse.data);

            console.log('Semanas recebidas com sucesso:', weekResponse.data);
            } catch (error) {
            console.error('Erro ao carregar dados da API:', error);
            } finally {
            setIsLoading(false)
            }
        }
        getWeeks();
    }, []);

    const reportCards = [
        { title: 'Employees', value: '', icon: Users},
        { title: 'Generated Scales', value: 'XX', icon: CalendarDays}
    ];

    const handleCard = (card) => {
        if (card.title === 'Generated Scales') {
            setWeekRecords(weeksList[currentIdxWeek]);
            //setIsLoading(true);
            onPageChange(8);
        }
    }

    if (isLoading) {
        return (
            <BaseLayout showSidebar={false} currentPage={3} onPageChange={onPageChange}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading...</p>
                    </div>
                </div>
            </BaseLayout>
        );
    }
    return (
        <BaseLayout currentPage={3} onPageChange={onPageChange}>
            <Header title="Reports and Analysis" icon={BarChart3} />

            <div className="flex gap-4 flex-wrap">
                {reportCards.map((card, idx) => {
                    const Icon = card.icon
                    return (
                        <div
                            onClick={() => handleCard(card)}
                            key={idx}
                            className="bg-slate-800 rounded-lg p-6 w-64 border border-slate-700 hover:border-indigo-500 transition-all duration-200 overflow-hidden cursor-pointer"
                        >
                            <Icon size={40} className="text-blue-400 mb-4" />
                            <p className="text-4xl font-bold text-slate-400 mb-2">{card.value}</p>
                            <p className="text-sm text-slate-500">{card.title}</p>
                        </div>
                    );
                })}
            </div>
        </BaseLayout>
    );
}

export default ReportsPage;