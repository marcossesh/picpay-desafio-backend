# 💸 PicPay Simplificado - Desafio Back-end

Este projeto é a solução para o Desafio Back-end do PicPay, focado na implementação de uma API RESTful para um sistema simplificado de pagamentos e transferências. O objetivo principal é simular o fluxo de transferência entre usuários, atendendo a requisitos de negócio como validação de saldo, autorização externa e transacionalidade.

## 🚀 Tecnologias Utilizadas

* **Node.js**
* **Express** (para a criação da API RESTful)
* **MySQL/MariaDB** (como banco de dados relacional)
* **`mysql2/promise`** (para conexão e queries assíncronas ao banco de dados)

## 🏗️ Arquitetura e Estrutura do Projeto

O projeto segue uma arquitetura baseada em camadas para garantir coesão e baixo acoplamento:

* **`controllers/`**: Define as rotas (endpoints) da API e lida com a requisição/resposta HTTP (e.g., `UserController.js`, `TransactionController.js`).
* **`services/`**: Contém a lógica de negócio principal, coordena as operações e aplica as regras do desafio (e.g., validação de saldo, chamadas a serviços externos).
* **`repositories/`**: Abstrai o acesso ao banco de dados, contendo a lógica de persistência (CRUD) para as entidades (e.g., `UserRepository.js`, `TransactionRepository.js`).
* **`app.js`**: Arquivo de inicialização, responsável por configurar o servidor Express, o pool de conexões do banco de dados e injetar as dependências.

## ⚙️ Pré-requisitos

Para rodar este projeto, você precisará ter instalado:

1.  **Node.js** (versão LTS recomendada).
2.  Um servidor **MySQL** ou **MariaDB** rodando.

## 📥 Configuração e Instalação

### 1. Configuração do Banco de Dados

1.  Crie um banco de dados chamado `PicPay`.
2.  Execute o script SQL para criar as tabelas `users` e `transactions`.

    **Modelo Sugerido para o MySQL (Atualizado):**

    ```sql
    -- Tabela de Usuários
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        document VARCHAR(14) NOT NULL UNIQUE, -- CPF (11) ou CNPJ (14)
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        user_type ENUM('common', 'merchant') NOT NULL, -- common (comum) ou merchant (lojista)
        balance DECIMAL(10, 2) DEFAULT 0.00
    );

    -- Tabela de Transações (Atualizada)
    CREATE TABLE transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payer_id INT NOT NULL,
        payee_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'completed', 'failed') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payer_id) REFERENCES users(id),
        FOREIGN KEY (payee_id) REFERENCES users(id)
    );
    ```

3.  Atualize as credenciais de conexão no arquivo **`app.js`**:

    ```javascript
    const dbPool = mysql.createPool({
        host: 'localhost',
        user: 'root', // <-- Altere conforme necessário
        password: '', // <-- Altere conforme necessário
        database: 'PicPay',
        // ...
    });
    ```

### 2. Instalação das Dependências

1.  Navegue até o diretório raiz do projeto.
2.  Instale as dependências Node.js (certifique-se de ter o `package.json` correto):

    ```bash
    npm install express body-parser mysql2 dotenv # Exemplo de pacotes
    ```

### 3. Execução

1.  Inicie o servidor Node.js:

    ```bash
    node app.js
    ```
2.  A API estará rodando em `http://localhost:3000`.

## 📌 Endpoints da API

### Usuários (`/users`)

| Verbo | Rota | Descrição |
| :--- | :--- | :--- |
| **GET** | `/users/:id` | Busca todos os dados de um usuário pelo ID. |
| **GET** | `/users/:id/balance` | Retorna o saldo atual do usuário. |
| **POST** | `/users` | Cria um novo usuário. |
| **DELETE** | `/users/:id` | Deleta um usuário. |

### Transações (`/transactions`)

| Verbo | Rota | Descrição |
| :--- | :--- | :--- |
| **POST** | `/transfer` | **Fluxo de Transferência (Principal Requisito)** |
| **GET** | `/transactions/:userId` | Retorna o histórico de transações de um usuário (enviadas e recebidas). |

## 🔑 Detalhes da Implementação da Transferência (`POST /transfer`)

O endpoint principal (`POST /transfer`) implementa o fluxo de transferência seguindo todos os requisitos de negócio:

1.  **Validação do Usuário Pagador (**`payer`**):**
    * Verifica se o usuário pagador existe.
    * **Regra Lojista:** Lojistas (`user_type: 'merchant'`) não podem realizar transferências (somente receber).
2.  **Validação de Saldo:**
    * Verifica se o saldo do pagador é suficiente para o valor da transferência.
3.  **Autorização Externa:**
    * Consulta o serviço mock de autorização (GET: `https://util.devi.tools/api/v2/authorize`). A transferência só prossegue se a resposta for positiva.
4.  **Transação Atômica:**
    * Toda a operação (débito do pagador, crédito do recebedor e registro da transação) é realizada dentro de uma **transação de banco de dados**. Isso garante que, em caso de falha em qualquer etapa, todas as modificações sejam revertidas (`rollback`).
5.  **Notificação Assíncrona (Mock):**
    * Após a transferência ser concluída com sucesso no banco de dados, é feita a chamada para o serviço mock de notificação (POST: `https://util.devi.tools/api/v1/notify`). Este passo é desacoplado do fluxo principal para evitar que uma instabilidade no serviço de notificação cause a falha de uma transferência já concluída.

## 💡 Próximos Passos e Melhorias Propostas (Diferenciais)

* **Testes de Unidade e Integração:** Implementar cobertura de testes para os `Services` e `Controllers` (Diferencial).
* **Validações de Entrada:** Adicionar validações de esquema (Joi, por exemplo) para garantir a integridade dos dados de entrada (CPF/CNPJ, e-mail único, etc.).
* **Tratamento de Erros Mais Sofisticado:** Criar um *middleware* de erro para padronizar as respostas de erro e evitar vazamento de detalhes internos.
* **Notificação Assíncrona Real:** Utilizar um sistema de mensageria (como RabbitMQ ou Kafka) para lidar com a notificação de forma verdadeiramente assíncrona.
* **Dockerização:** Criar um `Dockerfile` e `docker-compose.yml` para facilitar a configuração do ambiente (aplicação + banco de dados) (Diferencial).

---
