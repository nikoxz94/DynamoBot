import { ChatClient, ChatMessage } from '@twurple/chat';
// Importiamo i comandi (Assicurati che esportino una funzione chiamata 'run')
import * as ping from '../commands/ping.js';
import * as social from '../commands/social.js';
import * as so from '../commands/so.js';
import { ApiClient } from '@twurple/api';

export interface CommandContext {
    user: string;
    text: string;
    msg: ChatMessage;
    apiClient: ApiClient;
    // Qui in futuro aggiungerai: obs, db, ecc. senza cambiare niente
}

// 1. Definiamo l'interfaccia per un comando tipo
// Questo garantisce che ogni comando abbia una funzione 'run' con i parametri giusti
interface BotCommand {
    run: (chatClient: ChatClient, channel: string, ctx : CommandContext) => Promise<void> | void;
}

// 2. Mappa dei comandi (Dizionario)
// Qui puoi aggiungere alias facilmente (es. 'ig' punta a 'social')
const commands: Record<string, BotCommand> = {
    ping,
    social,
    so,
    ig: social,    // Alias: !ig farà la stessa cosa di !social
    ds: social,
    tg: social
};

export const setupCommandHandler = (chatClient: ChatClient, apiClient: ApiClient) => {
    chatClient.onMessage(async (channel, user, text, msg) => {
        // Ignora messaggi che non iniziano con ! o che sono solo "!"
        if (!text.startsWith('!') || text.trim().length === 1) return;

        // 3. Parsing del comando e degli argomenti
        // .trim() toglie spazi iniziali/finali
        // .split(/\s+/) divide per uno o più spazi (evita errori se l'utente mette due spazi)
        const args = text.slice(1).trim().split(/\s+/);
        const commandName = args.shift()?.toLowerCase();

        // 4. Esecuzione
        if (commandName && commands[commandName]) {
            const command = commands[commandName];

            // Ogni volta che arriva un messaggio, assembliamo i dati attuali
            const ctx: CommandContext = {
                user,
                text, // Questo ora contiene tutto il testo del messaggio
                msg,
                apiClient
            };
            try {
                // Passiamo tutto il necessario al comando
                await command.run(chatClient, channel, ctx);
            } catch (error) {
                console.error(`[Commands] Errore durante l'esecuzione di !${commandName}:`, error);
            }
        } else if (commandName) {
            // Log opzionale: utile per debug, ma potresti volerlo togliere per non intasare la console
            console.log(`[Commands] Comando sconosciuto tentato da ${user}: !${commandName}`);
        }
    });
};