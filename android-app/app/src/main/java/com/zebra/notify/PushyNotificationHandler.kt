package com.zebra.notify

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import me.pushy.sdk.util.DefaultNotificationHandler
import java.util.Map

/**
 * Reçoit la notification Pushy et l'affiche, même quand l'app est fermée.
 */
class PushyNotificationHandler : DefaultNotificationHandler() {

    override fun onMessageReceived(context: Context, data: Map<String, String>?) {
        createChannel(context)

        val title = data?.get("title") ?: "🛒 Nouvelle commande Zebra Bags"
        val body = data?.get("body")
            ?: "Une nouvelle commande a été passée sur la boutique."

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_bell)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        try {
            NotificationManagerCompat.from(context)
                .notify(System.currentTimeMillis().toInt(), notification)
        } catch (e: SecurityException) {
            Log.e(TAG, "Permission de notification refusée", e)
        }
    }

    private fun createChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Commandes Zebra Bags",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications des nouvelles commandes"
            }
            context.getSystemService(NotificationManager::class.java)
                .createNotificationChannel(channel)
        }
    }

    companion object {
        private const val TAG = "PushyHandler"
        private const val CHANNEL_ID = "zebra_orders"
    }
}
