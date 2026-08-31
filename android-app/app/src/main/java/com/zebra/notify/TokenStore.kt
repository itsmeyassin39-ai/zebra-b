package com.zebra.notify

import android.content.Context
import android.content.SharedPreferences

object TokenStore {
    private const val PREFS = "zebra_prefs"
    private const val KEY_ADMIN_TOKEN = "admin_token"

    private fun prefs(context: Context): SharedPreferences =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun saveAdminToken(context: Context, token: String) {
        prefs(context).edit().putString(KEY_ADMIN_TOKEN, token).apply()
    }

    fun getAdminToken(context: Context): String? =
        prefs(context).getString(KEY_ADMIN_TOKEN, null)?.takeIf { it.isNotBlank() }
}
