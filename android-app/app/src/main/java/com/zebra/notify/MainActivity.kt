package com.zebra.notify

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import me.pushy.sdk.Pushy

class MainActivity : AppCompatActivity() {

    private lateinit var etToken: EditText
    private lateinit var tvStatus: TextView
    private lateinit var tvDevice: TextView

    private val requestNotifPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            tvStatus.text = if (granted)
                "Permission de notification accordée ✓"
            else
                "Permission de notification refusée — activez-la dans les réglages."
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        etToken = findViewById(R.id.etToken)
        tvStatus = findViewById(R.id.tvStatus)
        tvDevice = findViewById(R.id.tvDevice)
        val btnSaveToken = findViewById<Button>(R.id.btnSaveToken)
        val btnRegister = findViewById<Button>(R.id.btnRegister)

        etToken.setText(TokenStore.getAdminToken(this) ?: AppConfig.ADMIN_TOKEN)

        // ----- Pushy : démarrage du service de notifications -----
        try {
            Pushy.setAppId(applicationContext, AppConfig.PUSHY_API_KEY)
            Pushy.setNotificationHandler(PushyNotificationHandler::class.java)
            Pushy.listen(applicationContext)
        } catch (e: Exception) {
            Toast.makeText(this, "Erreur de configuration Pushy : ${e.message}", Toast.LENGTH_LONG).show()
        }

        btnSaveToken.setOnClickListener {
            val token = etToken.text.toString().trim()
            if (token.isEmpty()) {
                Toast.makeText(this, "Collez d'abord un token", Toast.LENGTH_SHORT).show()
            } else {
                TokenStore.saveAdminToken(this, token)
                Toast.makeText(this, "Token enregistré ✓", Toast.LENGTH_SHORT).show()
            }
        }

        btnRegister.setOnClickListener {
            registerDevice()
        }

        requestNotifPermissionIfNeeded()
        refreshStatus()
    }

    private fun requestNotifPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
            != PackageManager.PERMISSION_GRANTED
        ) {
            requestNotifPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    private fun getPushyDeviceToken(): String? =
        try {
            Pushy.getDeviceCredentials(applicationContext)?.deviceToken
        } catch (e: Exception) {
            null
        }

    private fun refreshStatus() {
        tvStatus.text = "Serveur : ${AppConfig.SERVER_BASE_URL}\n"
        val deviceToken = getPushyDeviceToken()
        if (deviceToken.isNullOrBlank()) {
            tvStatus.append("Enregistrement Pushy en cours…")
            tvDevice.text = ""
        } else {
            tvStatus.append("Pushy prêt ✓")
            tvDevice.text = "Token Pushy (appareil) :\n$deviceToken"
        }
    }

    private fun registerDevice() {
        val adminToken = TokenStore.getAdminToken(this)
        if (adminToken.isNullOrBlank()) {
            Toast.makeText(this, "Collez d'abord le token administrateur", Toast.LENGTH_SHORT).show()
            return
        }
        tvStatus.text = "Enregistrement en cours…"
        CoroutineScope(Dispatchers.Main).launch {
            val ping = withContext(Dispatchers.IO) { ServerApi.ping() }
            if (!ping) {
                tvStatus.text =
                    "Impossible de joindre le serveur (${AppConfig.SERVER_BASE_URL}).\nVérifiez l'URL."
                return@launch
            }
            val deviceToken = getPushyDeviceToken()
            if (deviceToken.isNullOrBlank()) {
                tvStatus.text = "Token Pushy pas encore prêt. Réessayez dans quelques secondes."
                return@launch
            }
            val ok = withContext(Dispatchers.IO) {
                ServerApi.registerDeviceToken(adminToken, deviceToken)
            }
            tvStatus.text = if (ok)
                "Appareil enregistré ✓ — vous recevrez chaque commande ici, même app fermée."
            else
                "Échec — vérifiez le token administrateur ou que vous êtes bien connecté."
        }
    }
}
