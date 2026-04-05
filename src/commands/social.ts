import { ChatClient , ChatMessage } from '@twurple/chat';

export const run = (chatClient: ChatClient, channel: string, user: string) => {
        chatClient.say(channel, `@${user} Instagram:  Telegram:  Discord:  `);
}