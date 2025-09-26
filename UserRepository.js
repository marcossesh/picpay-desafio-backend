class UserRepository {
    constructor(dbConnection) {
        this.db = dbConnection;
    }

    async getUserById(userId, connection) { 
        const dbContext = connection || this.db; 
        try {
            const sql = `SELECT id, full_name, document, email, balance, user_type FROM users WHERE id = ?`;
            const [rows] = await dbContext.query(sql, [userId]); 
            
            const user = rows[0] || null;
            return user;
        } catch(error) {
            console.error('Error fetching user:', error);
            throw new Error('Database error fetching user.');
        } 
    }

    async create(userData) { 
        try {
            const sql = `INSERT INTO users (full_name, document, email, password_hash, user_type, balance) VALUES (?, ?, ?, ?, ?, ?)`;
            
            const values = [
                userData.full_name, 
                userData.document, 
                userData.email, 
                userData.password_hash, 
                userData.user_type,
                userData.balance || 0
            ];
            
            const [result] = await this.db.query(sql, values);
            
            return {
                success: true,
                message: 'User created successfully.',
                newId: result.insertId
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Database error creating user.');
        }
    }

    async updateBalance(userId, newBalance, connection) {
        const dbContext = connection || this.db;
        try {
            const sql = `UPDATE users SET balance = ? WHERE id = ?`;
            await dbContext.query(sql, [newBalance, userId]);
            return true;
        } catch(error) {
            console.error('Error updating balance:', error);
            throw new Error('Database error updating balance.');
        }
    }

    async delete(userId) {
        try {
            const sql = `DELETE FROM users WHERE id = ?`;
            await this.db.query(sql, [userId]);
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Database error deleting user.');
        }
    }
}

export { UserRepository };