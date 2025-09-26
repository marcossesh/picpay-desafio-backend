import { Router } from 'express';
import { UserServices } from '../services/UserServices.js';

const userRouter = Router();

export default (userService) => { 
    
    userRouter.get('/users/:id', async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await userService.getUserById(userId);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            res.status(200).json(user);
        } catch (error) {
            console.error('Erro GET /users/:id:', error);
            res.status(500).json({ error: error.message });
        }
    });

    userRouter.get('/users/:id/balance', async (req, res) => {
        try {
            const userId = req.params.id;
            const balance = await userService.getAccountBalance(userId); 
            res.status(200).json({ userId: parseInt(userId), balance: balance });
        } catch (error) {
            console.error('Erro GET /users/:id/balance:', error);
            res.status(500).json({ error: error.message });
        }
    });

    userRouter.post('/users', async (req, res) => {
        try {
            const { full_name, document, email, password_hash, user_type, balance } = req.body;
            
            const result = await userService.createUser(full_name, document, email, password_hash, user_type, balance);
            
            res.status(201).json(result);
        } catch (error) {
            console.error('💥 ERRO NO POST /users:', error.message);
            
            if (!res.headersSent) {
                res.status(500).json({ 
                    error: error.message,
                });
            }
        }
    });

    userRouter.delete('/users/:id', async (req, res) => {
        try {
            const userId = req.params.id;
            await userService.deleteUser(userId);
            res.status(204).send();
        } catch (error) {
            console.error('Erro DELETE /users/:id:', error);
            res.status(500).json({ error: error.message });
        }
    });
    
    return userRouter; 
};