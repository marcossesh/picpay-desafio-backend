import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise'; 

import initializeUserRouter from './controllers/UserController.js';
import initializeTransactionRouter from './controllers/TransactionController.js';

import { UserRepository } from './repositories/UserRepository.js';
import { transactionRepository } from './repositories/TransactionRepository.js';

import { UserServices } from './services/UserServices.js';
import { TransactionServices } from './services/TransactionServices.js';
import { notificationServices } from './services/NotificationServices.js';


const dbPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'PicPay',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


const app = express();
const port = 3000;

app.use(bodyParser.json());

const userRepo = new UserRepository(dbPool);
const transRepo = new transactionRepository(dbPool);

const notifService = new notificationServices(); 

const userService = new UserServices(userRepo);
const transactionService = new TransactionServices(userService, transRepo, notifService, dbPool);


console.log(' Testando conexão com banco...');

dbPool.query('SELECT 1 as test')
    .then(() => {
        console.log('Conexão com banco de dados estabelecida com sucesso.');
    })
    .catch(error => {
        console.error('ERRO CRÍTICO NA CONEXÃO COM BANCO DE DADOS:', error.message);
        console.log(' -> Verifique as credenciais no app.js e se o MySQL está rodando.');
    });


app.use(initializeUserRouter(userService));
app.use(initializeTransactionRouter(transactionService));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API pronta para testes no Postman em http://localhost:${port}`);
});