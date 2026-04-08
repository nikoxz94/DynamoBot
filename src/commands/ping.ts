import { ChatClient } from '@twurple/chat';
import { CommandContext } from '../interfaces/bot.interfaces.js';

export const run = (chatClient: ChatClient, channel: string, ctx: CommandContext) => {
    chatClient.say(channel, `@${ctx.user} Pong! 🏓`);
};