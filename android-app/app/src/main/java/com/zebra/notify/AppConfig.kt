package com.zebra.notify

/**
 * Configuration de l'app.
 *
 * SERVER_BASE_URL : l'adresse de votre site Zebra Bags (déployé sur Railway), sans slash final.
 * EXEMPLE : "https://votre-app.up.railway.app"
 *
 * PUSHY_API_KEY : la clé API publique de votre application Pushy
 * (Dashbord Pushy -> Applications -> votre app -> clé API).
 *
 * ADMIN_TOKEN : le token qui identifie l'administrateur. Vous pouvez le laisser vide et utiliser
 * le bouton "Enregistrer le token" dans l'app pour le saisir manuellement.
 */
object AppConfig {
    const val SERVER_BASE_URL = "https://VOTRE-URL-RAILWAY.railway.app"

    // Clé API publique Pushy (depuis votre compte Pushy).
    const val PUSHY_API_KEY = "VOTRE-CLE-API-PUSHY"

    // Laissez vide pour saisir le token depuis l'interface de l'app.
    const val ADMIN_TOKEN = ""
}
