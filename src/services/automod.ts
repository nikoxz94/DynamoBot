import * as fs from 'fs';
import * as path from 'path';
import { ChatClient } from '@twurple/chat';
import { ApiClient } from '@twurple/api';

// 1. DEFINIZIONE DELLA CACHE (Fuori dalla funzione così è globale per questo file)
let wordsCache = {
    banned: [] as string[],
    spoilers: [] as string[]
};
const WordsPath = path.join(process.cwd(), 'src/data/words.json');

// 2. FUNZIONE PER CARICARE I DATI
const loadWords = () => {
    try {
        const fileContent = fs.readFileSync(WordsPath, 'utf-8');
        const data = JSON.parse(fileContent);
        wordsCache.banned = data.banned || [];
        wordsCache.spoilers = data.spoilers || [];
        console.log("[AutoMod] Cache parole aggiornata con successo.");
    } catch (e) {
        console.error("[AutoMod] Errore nel caricamento delle banwords:", e);
        wordsCache.banned = []; // Reset per sicurezza in caso di errore
        wordsCache.spoilers = [];

    }
};

// 3. IL WATCHER (Osserva il file e ricarica se cambia)
fs.watchFile(WordsPath, (curr, prev) => {
    if (curr.mtime !== prev.mtime) { // Controlla se l'ora di modifica è cambiata
        console.log("[AutoMod] Rilevata modifica al file JSON banWords...");
        loadWords();
    }
});

export const setupAutoMod = async (chatClient: ChatClient, apiClient: ApiClient) => {
    // Carichiamo la lista la prima volta all'avvio
    loadWords();

    const me = await apiClient.users.getUserByName(process.env.TWITCH_BOT_USERNAME!);
    const broadcaster = await apiClient.users.getUserByName(process.env.TWITCH_CHANNEL!);

    if (!me || !broadcaster) return;

    chatClient.onMessage(async (channel, user, text, msg) => {
        if (msg.userInfo.isBroadcaster) return;

        const lowerText = text.toLowerCase();
        
        // 4. USO DELLA CACHE (Velocissimo, niente lettura da disco qui!)
        if (wordsCache.banned.some(word => lowerText.includes(word.toLowerCase()))) {
            try {
                await apiClient.asUser(me.id, async ctx => {
                    await ctx.moderation.deleteChatMessages(broadcaster.id, msg.id);
                });
                await chatClient.say(channel, `@${user}, DynamoBot ha attivato lo scudo anti-parolacce. Messaggio polverizzato! 🚫`);
                return;
            } catch (error) {
                console.error("[AutoMod] Errore durante l'eliminazione del messaggio (Banned):", error);
            }
        }
        // --- CONTROLLO SPOILER ---
        if (wordsCache.spoilers.some(word => lowerText.includes(word.toLowerCase()))) {
            try {
                await apiClient.asUser(me.id, async ctx => {
                    await ctx.moderation.deleteChatMessages(broadcaster.id, msg.id);
                });
                // Messaggio più specifico e gentile per gli spoiler
                await chatClient.say(channel, `@${user}, DynamoBot ha rilevato un possibile spoiler. Messaggio rimosso per sicurezza! 🤫`);
                return;
            } catch (error) {
                console.error("[AutoMod] Errore durante l'eliminazione del messaggio (Spoiler):", error);
            }
        }
    });
};