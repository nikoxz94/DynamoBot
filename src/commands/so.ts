import { ChatClient } from '@twurple/chat';
import { CommandContext } from '../interfaces/bot.interfaces.js';


export const run = async (chatClient: ChatClient, channel: string, ctx: CommandContext) => {
    
    // 1. Controllo Permessi (Mod o Broadcaster)
    if (!ctx.msg.userInfo.isMod && !ctx.msg.userInfo.isBroadcaster) return;
    
    // 2. Estrazione del nome utente scritto in chat
    const args = ctx.text.split(/\s+/);
    const username = args[1]?.replace('@', '').toLowerCase(); 

    if (!username) {
        await chatClient.say(channel, `[${process.env.TWITCH_BOT_DISPLAY_NAME}] Indica un utente! Esempio: !so @nome`);
        return;
    }

    try {
        // 3. Recupero l'oggetto utente da Twitch (per ottenere l'ID)
        const user = await ctx.apiClient.users.getUserByName(username);
        
        if (!user) {
            await chatClient.say(channel, `L'utente ${username} non è stato trovato.`);
            return;
        }

        // 4. Recupero info sul gioco/categoria
        const channelInfo = await ctx.apiClient.channels.getChannelInfoById(user.id);
        const game = channelInfo?.gameName || "una categoria misteriosa";

        // 5. Messaggio in chat (usiamo i dati puliti dell'oggetto 'user')
        await chatClient.say(
            channel, 
            `📣 Shoutout per @${user.displayName}! L'ultima volta era su ${game}. Seguite https://twitch.tv/${user.name}! ✨`
        );


    } catch (error) {
        console.error("Errore durante l'esecuzione del comando !so:", error);
        // Fallback: se l'API ha un problema, mandiamo comunque il link base
        await chatClient.say(channel, `📣 Shoutout per @${username}! https://twitch.tv/${username}`);
    }
};