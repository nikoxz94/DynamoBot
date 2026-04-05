import 'dotenv/config';
import { authProvider } from './auth.js';
import { launchBot } from './bot.js';


async function main() {
    try {
        console.log("Tentativo di avvio bot...");
        
        // Salviamo il client che viene restituito da launchBot
        const chatClient = await launchBot(authProvider);

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