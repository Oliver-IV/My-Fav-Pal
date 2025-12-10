import authService from './auth.service.js';

const API_URL = 'http://localhost:3000/api/lists';

const getHeaders = () => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

class ListService {
    async getLists() {
        const response = await fetch(API_URL, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch lists');
        return response.json();
    }


    async getListById(id) {
        const response = await fetch(`${API_URL}/${id}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch list details');
        return response.json();
    }

    async createList(listData) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(listData)
        });
        if (!response.ok) throw new Error('Failed to create list');
        return response.json();
    }

    async updateList(id, listData) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(listData)
        });
        if (!response.ok) throw new Error('Failed to update list');
        return response.json();
    }

    async deleteList(id) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete list');
        return response.json();
    }
}

const listService = new ListService();
export default listService;