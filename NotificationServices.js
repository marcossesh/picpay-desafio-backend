class notificationServices{
    async queueNotification(userId, amount) {
        console.log(`Notificação para o usuário ${userId} sobre a transação de ${amount} agendada.`);
        return { success: true, message: 'Notificação agendada com sucesso.' };
    }

    
    async sendNotification(userId, message) {
        const apiUrl = 'https://util.devi.tools/api/v1/notify';
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, message }),
            });
            const data = await response.json();
            if (data.status === 'success') {
                console.log(`Notificação enviada com sucesso para o usuário ${userId}: ${message}`);
                return true;
            } else {
                console.error(`Falha ao enviar notificação para o usuário ${userId}: ${data.message}`);
                return false;
            }
        } catch (error) {
            console.error('Erro ao chamar a API de notificação:', error);
            return false;
        }
    }
}

export { notificationServices }