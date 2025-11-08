import axios from 'axios';
import { week } from '../MockData';

const api = axios.create({
  baseURL: ' http://127.0.0.1:8000/api/v1',
  timeout: 10000,
  headers: {'Content-Type': 'application/json'}
});

api.interceptors.request.use(config => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
        config.headers['X-User-ID'] = userId;
    }
    // TODO: Adicionar token de autenticação se necessário

    return config;
}, error => {
    return Promise.reject(error);
});

export const ShiftConfigApi = {
    createShift: async (week_id, shiftData) => {
        try {
            return await api.post(`/weeks/${week_id}/shifts`, shiftData);
        } catch (error) {
            console.error('Erro ao criar um turno:', error);
            throw error;
        }
    },

    submitWeekData: async (week) => {
        try {
            return await api.post('/weeks', week);
        } catch (error) {
            console.error('Erro ao criar uma semana:', error);
            throw error;
        }

    }
};

export const StaffApi = {
    getAll: async () => {
    return await api.get('/employees');
    },

    updateEmployeeData: async (employee_id, employeeData) => {
        try {
            return await api.patch(`/employees/${employee_id}`, employeeData);
        } catch (error) {
            console.error('Erro ao atualizar o funcionário:', error);
            throw error;
        }
    },

    deleteEmployee : async (employee_id) => {
        try {
            return await api.delete(`/employees/${employee_id}`);
        } catch (error) {
            console.error('Erro ao remover o funcionário:', error);
            throw error;
        }
    }
};

export const AvailabilityApi = {
    getAvailabilityEmployee: async (employeeId) => {
        try {
            const response = await api.get(`/employees/${employeeId}/availabilities`);
            return response.data;
        } catch (error) {
            console.error('Erro ao receber a disponibilidade:', error);
            throw error;
        }

    },

    updateEmployeeAvailability: async (employeeId, availabilityId, availability) => {
        try {
            const response = await api.patch(
                `/employees/${employeeId}/availabilities/${availabilityId}`,
                availability
        );
        return response.data;
        } catch (error) {
            console.error('Erro ao atualizar disponibilidade:', error);
            throw error;
        }
    },

    createEmployeeAvailability: async (employeeId, availability) => {
        try {
            const response = await api.post(
                `/employees/${employeeId}/availabilities`,
                availability
        );
        return response.data;
        } catch (error) {
            console.error('Erro ao criar disponibilidade:', error);
            console.error('Payload enviado:', availability);
            console.error('Resposta:', error.response?.data);
            throw error;
        }
    },

    deleteEmployeeAvailability: async (employeeId, availabilityId) => {
        try {
            await api.delete(`/employees/${employeeId}/availabilities/${availabilityId}`);
            return { success: true };
        } catch (error) {
            console.error('Erro ao deletar disponibilidade:', error);
            throw error;
        }
    },

    updateEmployeeAvailability: async (employeeId, availabilityId, availability) => {
        try {
            const response = await api.patch(
                `/employees/${employeeId}/availabilities/${availabilityId}`,
                availability
        );
        return response.data;
        } catch (error) {
            console.error('Erro ao atualizar disponibilidade:', error);
            throw error;
        }
    },

    replaceAllAvailabilities: async (employeeId, availabilities) => {
        try {
            const current = await AvailabilityApi.getAvailabilityEmployee(employeeId);
            if (current && current.length > 0) {
                await Promise.all(
                current.map(av => AvailabilityApi.deleteEmployeeAvailability(employeeId, av.id))
                );
        }
        const created = [];
            availabilities.forEach(schemasDay => {
                schemasDay.forEach( async (schema) => {
                    const newAv = await AvailabilityApi.createEmployeeAvailability(employeeId, schema);
                    created.push(newAv);
                })
            });
            return created;
        } catch (error) {
            console.error('Erro ao substituir disponibilidades:', error);
            throw error;
        }
    },

    addNewEmployee: async (employeeData) => {
        try {
            const response = await api.post('/employees', employeeData);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar funcionário:', error);
            console.error('Resposta:', error.response?.data);
            throw error;
        }
    }
}

export const GeneratedScheduleApi = {
    getEmployees: async () => {
        return await api.get('/employees');
    },

    generateSchedulePreview: async (week_id) => {
        try {
            return await api.get(`/weeks/${week_id}/schedule/preview`);
        } catch (error) {
            console.error('Erro ao gerar prévia da escala:', error);
            throw error;
        }
    },

    getGeneratedSchedule: async (week_id) => {
        try {
            return await api.get(`/weeks/${week_id}/schedule`);
        } catch (error) {
            console.error('Erro ao buscar escala:', error);
            throw error;
        }
    },
    
    approvedSchedule: async (schedule) => {
        return await api.post('/schedule', schedule);
    }
}

export const LoginApi = {
    authenticateUser: async (username, password) => {
        return await api.post('/login', {username, password});
    }
}

export const CalendarApi = {
    getWeeks: async () => {
        return await api.get('/weeks');
    }
}