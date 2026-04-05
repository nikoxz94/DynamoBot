import { ChatClient } from '@twurple/chat';
import * as ping from '../commands/ping.js';
import * as social from '../commands/social.js';

const commands: Record<string, any> = {
    ping,
    social
};

export const setupCommandHandler = (chatClient: ChatClient) => {
    chatClient.onMessage((channel, user, text, msg) => {
        if (text.startsWith('!')) {
            const args = text.slice(1).split(' ');
            const commandName = args.shift()?.toLowerCase();
            
            const command = commandName ? commands[commandName] : null;
            
            if (command && command.run) {
                command.run(chatClient, channel, user, msg);
            } else if (commandName) {
                console.log(`[Commands] Comando !${commandName} non trovato.`);
            }
        }
    });
};