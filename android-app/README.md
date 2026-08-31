# Zebra Bags — App de Notifications (Android / Pushy)

App Android native (Kotlin) dont le seul rôle est de **recevoir une notification
à chaque commande** sur votre boutique Zebra Bags, **même quand l'app ou Chrome
est fermé** (téléphone allumé).

Elle utilise **Pushy** (https://pushy.me) — service de push fiable et gratuit,
sans Firebase. Fonctionne en arrière-plan grâce au service Android de Pushy.

---

## 1. Compte Pushy

1. Créez un compte gratuit sur **https://pushy.me** (pas de carte bancaire).
2. **Applications** → **Add Application** → nommez-la ex. "Zebra Bags".
3. Notez les **deux clés** depuis la page de l'app :
   - **API Key** (publique, plus courte) → pour l'app Android (étape 3).
   - **Secret API Key** (longue) → pour votre serveur Railway (étape 4).

> ⚠️ Ne partagez jamais la Secret API Key publiquement.

---

## 2. Fichiers à modifier avant de compiler

Ouvrez **`app/src/main/java/com/zebra/notify/AppConfig.kt`** et renseignez :

```kotlin
object AppConfig {
    // Ex. "https://votre-app.up.railway.app"
    const val SERVER_BASE_URL = "https://VOTRE-URL-RAILWAY.railway.app"

    // Clé API publique Pushy (API Key, pas la Secret).
    const val PUSHY_API_KEY = "VOTRE-CLE-API-PUSHY"

    // Laissez vide : vous collerez le token dans l'app.
    const val ADMIN_TOKEN = ""
}
```

---

## 3. Côté serveur (Railway)

Dans les **Variables** de votre service Railway, ajoutez :

```
PUSHY_SECRET_KEY=<votre Secret API Key Pushy>
```

Le serveur stocke les appareils enregistrés (table `pushy_tokens`) via
`POST /api/pushy/register`, et envoie chaque nouvelle commande à Pushy
(dans `sendOrderPushNotification`).

---

## 4. Compiler l'app (il faut un ordinateur)

1. Installez **Android Studio** (gratuit) : https://developer.android.com/studio
2. **Open** → sélectionnez le dossier `android-app/`.
3. Laissez Gradle synchroniser (télécharge le SDK au premier lancement).
4. Connectez votre téléphone Android en USB (activez **Options développeur → Débogage USB**).
5. Cliquez **Run ▶** pour installer l'app sur le téléphone.

---

## 5. Première utilisation sur le téléphone

1. Ouvrez l'app **"Zebra Bags - Commandes"**.
2. Autorisez les **notifications** (popup système).
3. Collez votre **token administrateur** (voir §6) → **Enregistrer le token**.
4. Tap **"(Ré)enregistrer mon appareil"** → statut « Appareil enregistré ✓ ».

Désormais, chaque commande passée sur la boutique déclenche une notification
sur ce téléphone, **même si l'app ou Chrome est fermé** (tant que le téléphone
est allumé).

---

## 6. Trouver votre token administrateur

Dans le navigateur sur votre site, connectez-vous au tableau de bord puis
ouvrez les **outils développeur (F12)** → onglet **Application** →
**Local Storage** → votre site → la valeur `zebra_token_v1`.

Copiez cette valeur et collez-la dans l'app Android.

---

## Fonctionnement technique

- `MainActivity.kt` → `Pushy.setAppId()` + `Pushy.listen()` démarre le service Pushy.
- `PushyNotificationHandler.kt` → reçoit le message et affiche la notification.
- `ServerApi.kt` → envoie le token Pushy de l'appareil à votre serveur.
- Côté serveur : chaque commande → `sendPushyToAll()` → API Pushy → téléphone.

> **Limite honnête :** si le téléphone est complètement **éteint**, aucune
> notification ne peut s'afficher (elle apparaît à la rallumage). Le push
> fonctionne dès que le téléphone est allumé + connecté, app ou Chrome fermé.
