import 'dotenv/config';
import { getAuthProvider } from './auth.js';
import { launchBot } from './bot.js';


async function main() {
    try {
        console.log("Tentativo di avvio bot...");

        const { authProvider, botId } = await getAuthProvider(); 
        
        // Passiamo entrambi a launchBot
        const chatClient = await launchBot(authProvider, botId);        // Salviamo il client che viene restituito da launchBot

        // --- GESTIONE SPEGNIMENTO PULITO ---
        process.on('SIGINT', () => {
            console.log("\n[Sistema] Ricevuto segnale di chiusura (CTRL+C). Spegnimento in corso...");
            chatClient.quit(); 
            process.exit(0);
        }); // <-- Ricordati di chiudere la tonda!

    } catch (error) {
        console.error("Si è verificato un errore all'avvio:", error);
    }
}

main();