import { ChatClient } from '@twurple/chat';
import { AuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { setupCommandHandler } from './handlers/command_handler.js';
import * as automod from './services/automod.js';

export async function launchBot(authProvider: AuthProvider) {
    
    const channel = process.env.TWITCH_CHANNEL;
    if (!channel) {
        throw new Error("Manca TWITCH_CHANNEL nel file .env"); 
    }   

    // 1. Inizializzazione Client
    const apiClient = new ApiClient({ authProvider });
    const chatClient = new ChatClient({ 
        authProvider, 
        channels: [process.env.TWITCH_CHANNEL || ''] 
    });

    // 2. Attivazione Moduli (Ognuno col suo onMessage indipendente)
    await automod.setupAutoMod(chatClient, apiClient); // Modulo Sicurezza
    setupCommandHandler(chatClient, apiClient);                      // Modulo Comandi

    // 3. Log di connessione
    chatClient.onConnect(() => {
        console.log('✅ DynamoBot_ è online e i moduli sono carichi!');
    });

    chatClient.onDisconnect((manually, reason) => {
    console.error(`❌ Disconnesso: ${reason}`);
});

    chatClient.connect();
    return chatClient;
}