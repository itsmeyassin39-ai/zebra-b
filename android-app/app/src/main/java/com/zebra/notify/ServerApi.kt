package com.zebra.notify

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object ServerApi {
    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    private val JSON = "application/json; charset=utf-8".toMediaType()

    /** Vérifie que le serveur est joignable à l'adresse configurée. */
    fun ping(): Boolean {
        return try {
            val req = Request.Builder()
                .url("${AppConfig.SERVER_BASE_URL}/api/push/vapid-key")
                .get()
                .build()
            client.newCall(req).execute().use { it.isSuccessful }
        } catch (e: Exception) {
            false
        }
    }

    /** Envoie le token Pushy de cet appareil au serveur pour recevoir les commandes. */
    fun registerDeviceToken(adminToken: String, pushyToken: String): Boolean {
        return try {
            val body = JSONObject()
                .put("token", pushyToken)
                .put("platform", "android")
                .toString()
                .toRequestBody(JSON)

            val req = Request.Builder()
                .url("${AppConfig.SERVER_BASE_URL}/api/pushy/register")
                .post(body)
                .header("Authorization", "Bearer $adminToken")
                .build()

            client.newCall(req).execute().use { it.isSuccessful }
        } catch (e: Exception) {
            false
        }
    }
}
