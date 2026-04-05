import { ChatClient } from '@twurple/chat';
import { AuthProvider } from '@twurple/auth';
import * as ping from './commands/ping.js'; 
import * as social from './commands/social.js';

const commands: Record<string, any> = {
    ping,
    social
};
// Esportiamo una funzione che "accende" il bot
export async function launchBot(authProvider: AuthProvider) {
    
    // 1. Inizializzazione
    const chatClient = new ChatClient({ 
        authProvider, 
        channels: [process.env.TWITCH_CHANNEL || ''] 
    });

    // 2. Logica di connessione
    chatClient.onConnect(() => {
        console.log('Il Bot è connesso alla chat!');
    });

    chatClient.onAuthenticationFailure((msg) => {
    console.error('Errore di autenticazione:', msg);
});

    //3. Mettiamo in ascolto il Bot sul canale
    chatClient.onMessage((channel, user, text, msg) => {
    console.log(`[${channel}] ${user}: ${text}`);
    if (text.startsWith('!')) {
        const args = text.slice(1).split(' '); // Toglie '!' e divide per spazi
        const commandName = args.shift()?.toLowerCase(); // Prende la prima parola (il comando) e la rende minuscola
        
        // Cerchiamo il comando nella nostra lista
        const command = commandName ? commands[commandName] : null;
    if (command) {
        // Se esiste, eseguiamo la sua funzione 'run'
        command.run(chatClient, channel, user, msg);
    } else {
        console.log(`Comando !${commandName} non trovato.`);
    }
    }
});
    // 4. Esecuzione
    chatClient.connect();
}