import axios from 'axios'

const ax = axios.create({
    baseURL: 'http://127.0.0.1:7001',
    timeout: 5000
});

export async function checkUser(params) {
    try {
        const res = await ax.get('/user', {
            params
        }); 

        return res.data;
    } catch (error) {
        return error;        
    }
}

export async function sync(userId, words) {
    try {
        const res = await ax.post('/sync', {
            userId,
            words
        }); 

        return res.data;
    } catch (error) {
        return error;
    }
}