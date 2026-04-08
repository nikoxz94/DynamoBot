import { ChatClient } from '@twurple/chat';
// Importiamo i comandi (Assicurati che esportino una funzione chiamata 'run')
import { ApiClient } from '@twurple/api';
import { BotConfig, CommandContext, BotCommand } from '../interfaces/bot.interfaces.js';

import * as ping from '../commands/ping.js';
import * as social from '../commands/social.js';
import * as so from '../commands/so.js';

import rawConfig from '../../config.json' with { type: 'json' };
const config = rawConfig as unknown as BotConfig;

// Mappa dei comandi (Dizionario)
// Qui puoi aggiungere alias facilmente (es. 'ig' punta a 'social')
const commands: Record<string, BotCommand> = {
    ping,
    social,
    so,
    ig: social,    // Alias: !ig farà la stessa cosa di !social
    ds: social,
    tg: social,
    discord: social,
    telegram: social,
    instagram: social
};
    

export const setupCommandHandler = (chatClient: ChatClient, apiClient: ApiClient) => {
    // Definiamo customCommands fuori dal ciclo di messaggi o dentro, 
    // l'importante è il cast per TypeScript

    chatClient.onMessage(async (channel, user, text, msg) => {
        if (!text.startsWith('!') || text.trim().length === 1) return;

        const args = text.slice(1).trim().split(/\s+/);
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        // Prepariamo il contesto
        const ctx: CommandContext = { user, text, msg, apiClient };

        try {
            // 1. Controllo Comandi Fisici (.ts)
            if (commands[commandName]) {
                await commands[commandName].run(chatClient, channel, ctx);
            } 
            // 2. Controllo Comandi Custom (JSON)
            else if (config.customCommands[commandName]) {
                const response = config.customCommands[commandName];
                const finalMessage = response.replace('{user}', `@${user}`);
                await chatClient.say(channel, finalMessage);
            } 
            // 3. Comando non trovato
            else {
                console.log(`[Commands] Comando sconosciuto tentato da ${user}: !${commandName}`);
            }
        } catch (error) {
            // Questo catch ora protegge TUTTA l'esecuzione del comando
            console.error(`[Handler] Errore critico su !${commandName}:`, error);
        }
    });
};