import { ChatClient } from '@twurple/chat';
import { RefreshingAuthProvider } from '@twurple/auth'; // Usiamo il tipo specifico
import { ApiClient } from '@twurple/api';
import { setupCommandHandler } from './handlers/command_handler.js';
import * as automod from './services/automod.js';

// 1. Aggiungiamo botId come secondo argomento della funzione
export async function launchBot(authProvider: RefreshingAuthProvider, botId: string) {
    
    const channel = process.env.TWITCH_CHANNEL;
    if (!channel) {
        throw new Error("Manca TWITCH_CHANNEL nel file .env"); 
    }   

    // 2. Inizializzazione Client
    const apiClient = new ApiClient({ authProvider });
    const chatClient = new ChatClient({ 
        authProvider, 
        channels: [channel] // Usiamo direttamente la variabile channel
    });

    // --- RIMOSSO getAnyAccessToken perché botId arriva già come parametro ---

    // 3. Attivazione Moduli
    await automod.setupAutoMod(chatClient, apiClient, botId); 
    setupCommandHandler(chatClient, apiClient);        

    // 4. Log di connessione
    chatClient.onConnect(() => {
        console.log('✅ DynamoBot_ è online e i moduli sono carichi!');
    });

    chatClient.onDisconnect((manually, reason) => {
        console.error(`❌ Disconnesso: ${reason}`);
    });

    chatClient.connect();
    return chatClient;
}