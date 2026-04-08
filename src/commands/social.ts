import { ChatClient } from '@twurple/chat';
import { CommandContext } from '../interfaces/bot.interfaces.js';
import config from '../../config.json' with { type: 'json' };

export const run = (chatClient: ChatClient, channel: string, ctx: CommandContext) => {
    const { instagram, telegram, discord } = config.socials;
    chatClient.say(
        channel, 
        `@${ctx.user} ✨ Seguimi sui social! 📸 Instagram: ${instagram} | 📢 Telegram: ${telegram} | 🎮 Discord: ${discord}`
    );
};