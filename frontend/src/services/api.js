import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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
    createShcedule: async (schedule) => {
        return await api.post('/create-schedule', schedule);
    }
};

export const StaffApi = {
    getAll: async () => {
    return await api.get('/employees');
    },

    toggleActive: async (employeeId, isActive) => {
        return await api.patch(`/employees/${employeeId}/toggle-active`, {active: isActive});
    }
};

export const AvailabilityApi = {
    getEmployee: async (employeeId) => {
        return await api.get(`/employees/${employeeId}`);
    },

    getByEmployeeId: async (employeeId) => {
        return await api.get(`/availability/${employeeId}`);
    },

    updateEmployeeAvailability: async (employeeId, availability) => {
        return await api.put(`/availability/${employeeId}`, availability );
    },

    addNewEmployee: async (employeeData) => {
        return await api.post('/employees', employeeData);
    }
}

export const GeneratedScheduleApi = {
    getEmployees: async () => {
        return await api.get('/employees');
    },
    getGeneratedSchedule: async () => {
        return await api.get('/schedule');
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