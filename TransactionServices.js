import axios from 'axios';
import { UserRepository } from '../repositories/UserRepository.js';
import { transactionRepository } from '../repositories/TransactionRepository.js';
import { notificationServices } from './NotificationServices.js'; 

const AUTHORIZATION_SERVICE = '[https://util.devi.tools/api/v2/authorize](https://util.devi.tools/api/v2/authorize)';

class TransactionServices {
    constructor(userService, transactionRepository, notificationServices, dbPool) {
        this.userService = userService; 
        this.transRepo = transactionRepository;
        this.notificationService = notificationServices;
        this.dbPool = dbPool;
    }

    async authorizeTransaction() {
        try {
            const response = await axios.get(AUTHORIZATION_SERVICE);
            return response.data.status === 'success';
        } catch (error) {
            console.error('Erro ao consultar serviço de autorização:', error.message);
            return false;
        }
    }

    async transfer(payerId, payeeId, amount) {
        if (payerId === payeeId) {
            throw new Error("O pagador e o recebedor não podem ser o mesmo usuário.");
        }
        
        if (amount <= 0) {
            throw new Error("O valor da transferência deve ser positivo.");
        }

        const connection = await this.dbPool.getConnection();
        
        try {
            await connection.beginTransaction();

            const payer = await this.userService.getUserById(payerId, connection);
            const payee = await this.userService.getUserById(payeeId, connection);

            if (!payer || !payee) {
                throw new Error("Pagador ou Recebedor não encontrado.");
            }

            if (payer.user_type === 'merchant') {
                throw new Error("Lojistas não podem realizar transferências.");
            }

            if (payer.balance < amount) {
                throw new Error("Saldo insuficiente para realizar a transferência.");
            }

            const isAuthorized = await this.authorizeTransaction();
            if (!isAuthorized) {
                throw new Error("Transação não autorizada pelo serviço externo.");
            }

            const newPayerBalance = payer.balance - amount;
            const newPayeeBalance = payee.balance + amount;

            await this.userService.updateBalance(payerId, newPayerBalance, connection);
            
            await this.userService.updateBalance(payeeId, newPayeeBalance, connection);

            const transactionData = {
                payerId: payerId,
                payeeId: payeeId,
                amount: amount,
            };
            const transactionId = await this.transRepo.create(transactionData, connection);

            await connection.commit();

            this.notificationService.sendNotification(payee.email, amount).catch(err => {
                console.error("Aviso: Falha ao enviar notificação assíncrona:", err.message);
            });

            return {
                status: 'success',
                message: 'Transferência concluída com sucesso.',
                transactionId: transactionId,
                payerId: payerId,
                payeeId: payeeId,
                amount: amount,
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getTransactions(userId) {
        return this.transRepo.getTransactionsByUserId(userId);
    }
}

export { TransactionServices };