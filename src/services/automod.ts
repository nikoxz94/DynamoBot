import * as fs from 'fs';
import * as path from 'path';
import { ChatClient } from '@twurple/chat';
import { ApiClient } from '@twurple/api';

let wordsCache = {
    banned: [] as string[],
    spoilers: [] as string[]
};

// Variabile per evitare di spammare l'avviso "Non sono mod"
let hasWarnedNoMod = false;

const WordsPath = path.join(process.cwd(), 'src/data/words.json');

const loadWords = () => {
    try {
        const fileContent = fs.readFileSync(WordsPath, 'utf-8');
        const data = JSON.parse(fileContent);
        wordsCache.banned = data.banned || [];
        wordsCache.spoilers = data.spoilers || [];
        console.log("[AutoMod] Cache parole aggiornata con successo.");
    } catch (e) {
        console.error("[AutoMod] Errore nel caricamento delle banwords:", e);
        wordsCache.banned = [];
        wordsCache.spoilers = [];
    }
};

fs.watchFile(WordsPath, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
        console.log("[AutoMod] Rilevata modifica al file JSON...");
        loadWords();
    }
});

export const setupAutoMod = async (chatClient: ChatClient, apiClient: ApiClient, botId: String) => {
    loadWords();

    const me = await apiClient.users.getUserByName(process.env.TWITCH_BOT_USERNAME!);
    const broadcaster = await apiClient.users.getUserByName(process.env.TWITCH_CHANNEL!);

    if (!me || !broadcaster) return;

    chatClient.onMessage(async (channel, user, text, msg) => {
        if (msg.userInfo.isBroadcaster || msg.userInfo.userId === botId) return;

        const lowerText = text.toLowerCase();
        const isBanned = wordsCache.banned.some(word => lowerText.includes(word.toLowerCase()));
        const isSpoiler = wordsCache.spoilers.some(word => lowerText.includes(word.toLowerCase()));

        if (isBanned || isSpoiler) {
            try {
                await apiClient.asUser(me.id, async ctx => {
                    await ctx.moderation.deleteChatMessages(broadcaster.id, msg.id);
                });

                // Se l'eliminazione ha successo, resettiamo il flag dell'avviso
                hasWarnedNoMod = false;

                const alertMsg = isBanned 
                    ? `@${user}, lo scudo anti-parolacce di ${process.env.TWITCH_BOT_DISPLAY_NAME} ha polverizzato il tuo messaggio! 🚫`
                    : `@${user}, possibile spoiler rilevato da ${process.env.TWITCH_BOT_DISPLAY_NAME}. Messaggio rimosso per sicurezza! 🤫`;
                
                await chatClient.say(channel, alertMsg);

            } catch (error: any) {
                // --- GESTIONE ERRORE 403 (MODERATORE MANCANTE) ---
                if (error.statusCode === 403) {
                    console.warn("[AutoMod] Azione fallita: Il bot non è moderatore.");
                    
                    if (!hasWarnedNoMod) {
                        await chatClient.say(channel, `⚠️ Ehi @${process.env.TWITCH_CHANNEL}, ho provato a moderare ma non ho i poteri! Scrivi /mod ${process.env.TWITCH_BOT_DISPLAY_NAME} per attivarmi.`);
                        hasWarnedNoMod = true; // Impedisce di ripetere l'avviso per ogni messaggio
                    }
                } else {
                    console.error("[AutoMod] Errore imprevisto:", error.message);
                }
            }
        }
    });
};