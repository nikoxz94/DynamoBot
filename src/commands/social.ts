import { ChatClient, ChatMessage } from '@twurple/chat';

export const run = (chatClient: ChatClient, channel: string, user: string, _text: string, _msg: ChatMessage) => {
    chatClient.say(channel, `@${user} Instagram: [link] | Telegram: [link] | Discord: [link]`);
};