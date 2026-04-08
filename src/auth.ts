import { RefreshingAuthProvider, AccessToken } from '@twurple/auth';
import { promises as fs } from 'fs';
import 'dotenv/config';

const clientId = process.env.TWITCH_CLIENT_ID!;
const clientSecret = process.env.TWITCH_CLIENT_SECRET!;
const tokenPath = './tokens.json';

if (!clientId || !clientSecret) {
    throw new Error('ERRORE: TWITCH_CLIENT_ID o TWITCH_CLIENT_SECRET mancanti nel file .env');
}

export async function getAuthProvider() {
    let tokenData: AccessToken;
    
    try {
        const rawData = await fs.readFile(tokenPath, 'utf-8');
        tokenData = JSON.parse(rawData) as AccessToken;
    } catch (e) {
        throw new Error('ERRORE: Impossibile leggere tokens.json');
    }

    const authProvider = new RefreshingAuthProvider({ clientId, clientSecret });

    authProvider.onRefresh(async (userId, newTokenData) => {
        await fs.writeFile(tokenPath, JSON.stringify(newTokenData, null, 4), 'utf-8');
        console.log(`[Auth] Token rinnovati per l'utente ${userId}`);
    });

    let userId: string;

    try {
        // 2. Le assegniamo il valore dentro il try (senza ri-dichiararla con const)
        userId = await authProvider.addUserForToken(tokenData, ['chat']);
        console.log(`✅ Autenticazione pronta per l'ID: ${userId}`);
    } catch (error) {
        console.error("❌ Errore durante addUserForToken:", error);
        throw error;
    }

    return { authProvider, botId: userId };
}