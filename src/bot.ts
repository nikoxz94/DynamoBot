import { ChatClient } from '@twurple/chat';
import { AuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { setupCommandHandler } from './handlers/command_handler.js';
import * as automod from './services/automod.js';

export async function launchBot(authProvider: AuthProvider) {
    
    // 1. Inizializzazione Client
    const apiClient = new ApiClient({ authProvider });
    const chatClient = new ChatClient({ 
        authProvider, 
        channels: [process.env.TWITCH_CHANNEL || ''] 
    });

    // 2. Attivazione Moduli (Ognuno col suo onMessage indipendente)
    await automod.setupAutoMod(chatClient, apiClient); // Modulo Sicurezza
    setupCommandHandler(chatClient);                      // Modulo Comandi

    // 3. Log di connessione
    chatClient.onConnect(() => {
        console.log('✅ DynamoBot_ è online e i moduli sono carichi!');
    });

    chatClient.connect();
}