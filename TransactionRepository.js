class transactionRepository{
    constructor(dbConnection) {
        this.db = dbConnection; 
    }

    async create(transactionData, connection) {
        const dbContext = connection || this.db;
        
        const sql = `INSERT INTO transactions (payer_id, payee_id, amount, status) VALUES (?, ?, ?, ?)`;
        const values = [
            transactionData.payerId,
            transactionData.payeeId,
            transactionData.amount,
            'completed'
        ];

        const [result] = await dbContext.query(sql, values); 
        return result.insertId;
    }

    async updateStatus(transactionId) {
        const sql = `UPDATE transactions SET status = ? WHERE id = ?`;
        const values = ['completed', transactionId];
        const result = await this.db.query(sql, values); 
        return result.affectedRows > 0;
    }

    async getTransactionsByUserId(userId) {
        const sql = `SELECT * FROM transactions WHERE payer_id = ? OR payee_id = ?`;
        const values = [userId, userId];
        const [rows] = await this.db.query(sql, values);
        return rows;
    }
}

export { transactionRepository };