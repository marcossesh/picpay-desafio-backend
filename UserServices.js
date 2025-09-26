class UserServices {
    constructor(userRepository) {
        this.userRepo = userRepository;
    }

    async getUserById(userId, connection = null) {
        console.log('🔍 UserService.getUserById chamado para userId:', userId);
        try {
            const user = await this.userRepo.getUserById(userId, connection);
            console.log('✅ Usuário encontrado:', user);
            return user;
        } catch (error) {
            console.error('💥 Erro no UserService.getUserById:', error);
            throw error;
        }
    }

    async getAccountBalance(userId) {
        console.log(' UserService.getAccountBalance chamado para userId:', userId);
        try {
            const user = await this.userRepo.getUserById(userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }
            console.log('✅ Saldo encontrado:', user.balance);
            return user.balance;
        } catch (error) {
            console.error('Erro no UserService.getAccountBalance:', error);
            throw error;
        }
    }

    async createUser(full_name, document, email, password_hash, user_type, balance = 0) {
        console.log('🆕 UserService.createUser chamado com:', {
            full_name, document, email, password_hash, user_type, balance
        });
        
        try {
            // Validações
            if (!full_name || !document || !email || !password_hash || !user_type) {
                throw new Error('Todos os campos obrigatórios devem ser preenchidos');
            }

            console.log('Criando usuário...');
            const userData = {
                full_name,
                document,
                email,
                password_hash,
                user_type,
                balance: parseFloat(balance) || 0
            };

            const result = await this.userRepo.create(userData);
            console.log('Usuário criado:', result);
            
            return result;

        } catch (error) {
            console.error('💥 Erro no UserService.createUser:', error);
            throw error;
        }
    }

    async updateBalance(userId, amount, connection) { 
        console.log('💰 UserService.updateBalance chamado (delta):', { userId, amount });
        try {
            const user = await this.userRepo.getUserById(userId, connection); 
            if (!user) {
                throw new Error('Usuário não encontrado para atualizar saldo');
            }
            
            const currentBalance = parseFloat(user.balance); 
            const numericAmount = parseFloat(amount); 
            const newBalance = currentBalance + numericAmount; 
            
            console.log(`ℹ️ Saldo Anterior: ${currentBalance}, Ajuste: ${numericAmount}, Novo Saldo: ${newBalance}`);
            
            if (newBalance < 0) {
                throw new Error('Saldo insuficiente. O cálculo da transação resultou em saldo negativo.');
            }

            // 2. ATUALIZA O SALDO no repositório
            const result = await this.userRepo.updateBalance(userId, newBalance, connection);
            
            console.log('✅ Saldo atualizado');
            return result;
            
        } catch (error) {
            console.error('💥 Erro no UserService.updateBalance:', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        console.log('🗑️ UserService.deleteUser chamado para userId:', userId);
        try {
            const result = await this.userRepo.delete(userId);
            console.log('✅ Usuário deletado');
            return result;
        } catch (error) {
            console.error('💥 Erro no UserService.deleteUser:', error);
            throw error;
        }
    }
}

export { UserServices };