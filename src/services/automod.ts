import * as fs from 'fs';
import * as path from 'path';
import { ChatClient } from '@twurple/chat';
import { ApiClient } from '@twurple/api';

// 1. DEFINIZIONE DELLA CACHE (Fuori dalla funzione così è globale per questo file)
let bannedWordsCache: string[] = [];
const banWordsPath = path.join(process.cwd(), 'src/data/banwords.json');

// 2. FUNZIONE PER CARICARE I DATI
const loadBanWords = () => {
    try {
        const fileContent = fs.readFileSync(banWordsPath, 'utf-8');
        const data = JSON.parse(fileContent);
        bannedWordsCache = data.bannedWords || [];
        console.log("[AutoMod] Cache aggiornata con successo.");
    } catch (e) {
        console.error("[AutoMod] Errore nel caricamento delle banwords:", e);
        bannedWordsCache = []; // Reset per sicurezza in caso di errore
    }
};

// 3. IL WATCHER (Osserva il file e ricarica se cambia)
fs.watchFile(banWordsPath, (curr, prev) => {
    if (curr.mtime !== prev.mtime) { // Controlla se l'ora di modifica è cambiata
        console.log("[AutoMod] Rilevata modifica al file JSON...");
        loadBanWords();
    }
});

export const setupAutoMod = async (chatClient: ChatClient, apiClient: ApiClient) => {
    // Carichiamo la lista la prima volta all'avvio
    loadBanWords();

    const me = await apiClient.users.getUserByName(process.env.TWITCH_BOT_USERNAME!);
    const broadcaster = await apiClient.users.getUserByName(process.env.TWITCH_CHANNEL!);

    if (!me || !broadcaster) return;

    chatClient.onMessage(async (channel, user, text, msg) => {
        if (msg.userInfo.isBroadcaster) return;

        const lowerText = text.toLowerCase();
        
        // 4. USO DELLA CACHE (Velocissimo, niente lettura da disco qui!)
        if (bannedWordsCache.some(word => lowerText.includes(word.toLowerCase()))) {
            try {
                await apiClient.asUser(me.id, async ctx => {
                    await ctx.moderation.deleteChatMessages(broadcaster.id, msg.id);
                });
                await chatClient.say(channel, `@${user}, DynamoBot ha attivato lo scudo anti-parolacce. Messaggio polverizzato! 🚫`);
            } catch (error) {
                console.error("[AutoMod] Errore durante l'eliminazione:", error);
            }
        }
    });
};