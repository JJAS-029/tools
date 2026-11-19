package com.jjas.tools.phone.camera

import android.Manifest
import android.content.ContentValues
import android.content.pm.PackageManager
import android.os.Bundle
import android.provider.MediaStore
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.view.LifecycleCameraController
import androidx.camera.view.PreviewView
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Cameraswitch
import androidx.compose.material.icons.rounded.Timer
import androidx.compose.material.icons.rounded.Watch
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.jjas.tools.phone.ui.M3Shapes
import com.jjas.tools.phone.ui.theme.JJASToolsTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Full-screen camera that the watch controls (shutter with timer, flip).
 * Also usable from the phone itself. Saves to Pictures/JJAS Tools.
 */
class CameraActivity : ComponentActivity() {
    private lateinit var controller: LifecycleCameraController

    private val front = mutableStateOf(false)
    private val countdown = mutableIntStateOf(0)
    private val flash = mutableStateOf(false)
    private val busy = mutableStateOf(false)
    private val timer = mutableIntStateOf(0)
    private val lastSaved = mutableStateOf("")

    val isFront get() = front.value

    private val askCamera = registerForActivityResult(ActivityResultContracts.RequestPermission()) { ok ->
        if (ok) {
            startCamera()
        } else {
            CameraRepository.sendResult(false, "Permite la cámara en el teléfono")
            finish()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Works with the phone locked (e.g. on a tripod) and doesn't let the screen turn off.
        setShowWhenLocked(true)
        setTurnScreenOn(true)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        enableEdgeToEdge()

        controller = LifecycleCameraController(this).apply {
            setEnabledUseCases(LifecycleCameraController.IMAGE_CAPTURE)
            imageCaptureMode = ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY
        }
        CameraRepository.attach(this)

        setContent { JJASToolsTheme { CameraScreen() } }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startCamera()
        } else {
            askCamera.launch(Manifest.permission.CAMERA)
        }
    }

    override fun onDestroy() {
        CameraRepository.detach(this)
        super.onDestroy()
    }

    private fun startCamera() {
        controller.bindToLifecycle(this)
        controller.initializationFuture.addListener(
            { CameraRepository.onReady(this) },
            ContextCompat.getMainExecutor(this),
        )
    }

    fun flip() {
        if (busy.value) return
        val wantFront = !front.value
        val selector = if (wantFront) CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA
        if (!controller.hasCamera(selector)) return
        controller.cameraSelector = selector
        front.value = wantFront
        CameraRepository.sendState(wantFront)
    }

    fun shoot(seconds: Int) {
        if (busy.value) return
        busy.value = true
        lifecycleScope.launch {
            for (s in seconds downTo 1) {
                countdown.intValue = s
                CameraRepository.sendCount(s)
                delay(1000)
            }
            countdown.intValue = 0
            takePicture()
        }
    }

    private fun takePicture() {
        val name = "JJAS_" + SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val values = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, name)
            put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg")
            put(MediaStore.MediaColumns.RELATIVE_PATH, "Pictures/JJAS Tools")
        }
        val output = ImageCapture.OutputFileOptions.Builder(
            contentResolver, MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values
        ).build()
        controller.takePicture(output, ContextCompat.getMainExecutor(this),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(result: ImageCapture.OutputFileResults) {
                    busy.value = false
                    lastSaved.value = "$name.jpg"
                    lifecycleScope.launch {
                        flash.value = true
                        delay(120)
                        flash.value = false
                    }
                    CameraRepository.sendResult(true, "$name.jpg")
                }

                override fun onError(exception: ImageCaptureException) {
                    busy.value = false
                    CameraRepository.sendResult(false, "No se pudo tomar la foto")
                }
            })
    }

    // ---------- UI ----------
    @Composable
    private fun CameraScreen() {
        val cs = MaterialTheme.colorScheme
        val flashAlpha by animateFloatAsState(
            if (flash.value) 0.9f else 0f, tween(if (flash.value) 40 else 300), label = "flash"
        )
        Box(Modifier.fillMaxSize().background(Color.Black)) {
            AndroidView(
                factory = { ctx -> PreviewView(ctx).apply { controller = this@CameraActivity.controller } },
                modifier = Modifier.fillMaxSize(),
            )
            // Top chip
            Row(
                Modifier.statusBarsPadding().padding(16.dp).clip(CircleShape)
                    .background(cs.secondaryContainer).padding(horizontal = 14.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(Icons.Rounded.Watch, null, tint = cs.onSecondaryContainer, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text(
                    if (lastSaved.value.isEmpty()) "Controlada desde el reloj" else "Guardada: ${lastSaved.value}",
                    style = MaterialTheme.typography.labelLarge, color = cs.onSecondaryContainer,
                )
            }
            // Countdown in an M3 "cookie"
            if (countdown.intValue > 0) {
                Box(
                    Modifier.align(Alignment.Center).size(180.dp).clip(M3Shapes.Cookie12)
                        .background(cs.secondary.copy(alpha = 0.85f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("${countdown.intValue}", color = cs.onSecondary, fontSize = 96.sp, fontWeight = FontWeight.Black)
                }
            }
            // Controls
            Row(
                Modifier.align(Alignment.BottomCenter).navigationBarsPadding().fillMaxWidth()
                    .padding(horizontal = 32.dp, vertical = 28.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                RoundButton(onClick = { timer.intValue = nextTimer(timer.intValue) }) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Rounded.Timer, "Temporizador", tint = Color.White)
                        Text(
                            if (timer.intValue == 0) "No" else "${timer.intValue} s",
                            color = Color.White, style = MaterialTheme.typography.labelMedium,
                        )
                    }
                }
                Box(
                    Modifier.size(88.dp).clip(M3Shapes.Cookie12).background(cs.secondary)
                        .alpha(if (busy.value) 0.5f else 1f)
                        .clickable(enabled = !busy.value) { shoot(timer.intValue) },
                    contentAlignment = Alignment.Center,
                ) {
                    Box(Modifier.size(56.dp).clip(CircleShape).border(5.dp, cs.onSecondary, CircleShape))
                }
                RoundButton(onClick = { flip() }) {
                    Icon(Icons.Rounded.Cameraswitch, "Voltear cámara", tint = Color.White)
                }
            }
            // White flash when the photo is taken
            Box(Modifier.fillMaxSize().alpha(flashAlpha).background(Color.White))
        }
    }

    @Composable
    private fun RoundButton(onClick: () -> Unit, content: @Composable () -> Unit) {
        Box(
            Modifier.size(64.dp).clip(CircleShape).background(Color.Black.copy(alpha = 0.45f))
                .clickable(onClick = onClick),
            contentAlignment = Alignment.Center,
        ) { content() }
    }

    private fun nextTimer(t: Int) = when (t) {
        0 -> 3
        3 -> 10
        else -> 0
    }
}
