import 'dotenv/config';
import { authProvider } from './auth.js';
import { ChatClient } from '@twurple/chat';
import { launchBot } from './bot.js';


async function main() {
    try{
        console.log("Tentativo di avvio bot...")
        await launchBot(authProvider);
    } catch (error){
        console.error("Si è verificato un errore all'avvio:", error);
    }
}

main();