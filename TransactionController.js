import { Router } from 'express';
import { TransactionServices } from '../services/TransactionServices.js';
import { notificationServices } from '../services/NotificationServices.js';

const transactionRouter = Router();

export default (transactionService) => {
    
    transactionRouter.post('/transfer', async (req, res) => {
        try {
            const { value, payer, payee } = req.body;
            
            const transactionResult = await transactionService.transfer(payer, payee, value); 
            res.status(200).json(transactionResult);
        } catch (error) {
            console.error('Erro ao processar transferência:', error.message);
            res.status(500).json({ error: error.message });
        }
    });
    
    transactionRouter.get('/transactions/:userId', async (req, res) => {
        try {
            const userId = req.params.userId;
            const transactions = await transactionService.getTransactions(userId);
            res.status(200).json(transactions);
        } catch (error) {
            console.error('Erro ao buscar transações:', error.message);
            res.status(500).json({ error: error.message });
        }
    });


    return transactionRouter;
};