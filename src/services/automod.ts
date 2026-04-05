import * as fs from 'fs';
import * as path from 'path';
import { ChatClient } from '@twurple/chat';
import { ApiClient } from '@twurple/api';

// process.cwd() punta alla cartella principale del tuo progetto (root)
// Così non ti serve più ricostruire __dirname!
const banWordsPath = path.join(process.cwd(), 'src/data/banwords.json');

export const setupAutoMod = async (chatClient: ChatClient, apiClient: ApiClient) => {
    
    // Recupero ID dal .env (dinamico)
    const me = await apiClient.users.getUserByName(process.env.TWITCH_BOT_USERNAME!);
    const broadcaster = await apiClient.users.getUserByName(process.env.TWITCH_CHANNEL!);

    if (!me || !broadcaster) return;

    chatClient.onMessage(async (channel, user, text, msg) => {
        // Leggiamo il file OGNI VOLTA che arriva un messaggio
        // Questo permette modifiche al volo senza riavviare il bot!
        try {
            const fileContent = fs.readFileSync(banWordsPath, 'utf-8');
            const data = JSON.parse(fileContent);
            const bannedWords: string[] = data.bannedWords;

            const lowerText = text.toLowerCase();
            if (bannedWords.some(word => lowerText.includes(word.toLowerCase()))) {
                await apiClient.asUser(me.id, async ctx => {
                    await ctx.moderation.deleteChatMessages(broadcaster.id, msg.id);
                });
                await chatClient.say(channel, `@${user}, DynamoBot ha attivato lo scudo anti-parolacce. Messaggio polverizzato! 🚫`);
            }
        } catch (error) {
            console.error("[AutoMod] Errore lettura banwords:", error);
        }
    });
};