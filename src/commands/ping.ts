import { ChatClient , ChatMessage } from '@twurple/chat';

// Definiamo cosa serve al comando per funzionare
export const run = (chatClient: ChatClient, channel: string, user: string) => {
    chatClient.say(channel, `@${user} Pong!`);
};