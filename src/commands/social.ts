import { ChatClient } from '@twurple/chat';
import { CommandContext } from '../handlers/command_handler.js';

export const run = (chatClient: ChatClient, channel: string, ctx: CommandContext) => {
    chatClient.say(channel, `@${ctx.user} Instagram: [link] | Telegram: [link] | Discord: [link]`);
};