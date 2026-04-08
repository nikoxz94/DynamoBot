import { ChatMessage, ChatClient } from '@twurple/chat';
import { ApiClient } from '@twurple/api';

export interface BotConfig {
    socials: {
        instagram: string;
        telegram: string;
        discord: string;
    };
    customCommands: Record<string, string>;
}

export interface CommandContext {
    user: string;
    text: string;
    msg: ChatMessage;
    apiClient: ApiClient;
        // Qui in futuro aggiungerai: obs, db, ecc. senza cambiare niente

}

export interface BotCommand {
    run: (chatClient: ChatClient, channel: string, ctx: CommandContext) => Promise<void> | void;
}