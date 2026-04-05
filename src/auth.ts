import { RefreshingAuthProvider } from '@twurple/auth';
import { promises as fs } from 'fs';
import 'dotenv/config';

//Credenziali recuperate dal file .env
const clientId = process.env.TWITCH_CLIENT_ID!;
const clientSecret = process.env.TWITCH_CLIENT_SECRET!;
const tokenPath = './tokens.json';
 
//Controllo delle chiavi
if (!clientId || !clientSecret){
    throw new Error('ERROE: TWITCH_CLIENT_ID o TWITCH_CLIENT_SECRET mancanti nel file .env');
}

// Usiamo un try/catch così se il file non esiste ci dà un errore chiaro
let tokenData;
try {
    tokenData = JSON.parse(await fs.readFile(tokenPath, 'utf-8'));
} catch (e) {
    throw new Error('ERRORE: Impossibile leggere tokens.json. Assicurati che il file esista!');
}

// Creiamo l'AuthProvider
export const authProvider = new RefreshingAuthProvider({
    clientId,
    clientSecret
});

// Twurple chiama questa funzione per aggiornare il file JSON automaticamente
authProvider.onRefresh(async (userId, newTokenData) => {
    await fs.writeFile(tokenPath, JSON.stringify(newTokenData, null, 4), 'utf-8');
    console.log('[Auth] Token rinnovati e salvati in tokens.json');
});


// Ora diciamo a Twurple: "Usa questi token per QUESTO utente specifico"
await authProvider.addUserForToken(tokenData, ['chat']);

console.log("Autenticazione configurata correttamente");