package com.jjas.tools.phone.camera

import android.Manifest
import android.annotation.SuppressLint
import android.content.ContentValues
import android.content.pm.PackageManager
import android.net.Uri
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
import androidx.camera.video.MediaStoreOutputOptions
import androidx.camera.video.Recording
import androidx.camera.video.VideoRecordEvent
import androidx.camera.view.LifecycleCameraController
import androidx.camera.view.PreviewView
import androidx.camera.view.video.AudioConfig
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
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.runtime.mutableLongStateOf
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
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private val RecRed = Color(0xFFE5484D)

/**
 * Full-screen camera that the watch controls: photo (shutter with timer) and
 * video (record / stop), flip. Also usable from the phone itself.
 * Photos go to Pictures/JJAS Tools and videos to Movies/JJAS Tools.
 */
class CameraActivity : ComponentActivity() {
    private lateinit var controller: LifecycleCameraController

    private val front = mutableStateOf(false)
    private val video = mutableStateOf(false)
    private val recording = mutableStateOf(false)
    private val recSecs = mutableLongStateOf(0)
    private val countdown = mutableIntStateOf(0)
    private val flash = mutableStateOf(false)
    private val busy = mutableStateOf(false)
    private val timer = mutableIntStateOf(0)
    private val lastSaved = mutableStateOf("")

    private var job: Job? = null
    private var activeRec: Recording? = null
    private var closeAfterRec = false

    val isFront get() = front.value
    val isVideo get() = video.value
    val isRecording get() = recording.value

    private val askCamera = registerForActivityResult(ActivityResultContracts.RequestPermission()) { ok ->
        if (ok) {
            startCamera()
        } else {
            CameraRepository.sendResult(false, "Permite la cámara en el teléfono")
            finish()
        }
    }

    /** Without the microphone the video is recorded silent. */
    private val askMic = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

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
        activeRec?.stop()
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

    private fun hasMic() =
        ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED

    fun flip() {
        if (busy.value || recording.value) return
        val wantFront = !front.value
        val selector = if (wantFront) CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA
        if (!controller.hasCamera(selector)) return
        controller.cameraSelector = selector
        front.value = wantFront
        CameraRepository.sendState(this)
    }

    /** Photo ↔ video. Ignored while a photo or a video is in progress. */
    fun setMode(wantVideo: Boolean) {
        if (!busy.value && !recording.value && video.value != wantVideo) {
            applyMode(wantVideo)
        }
        CameraRepository.sendState(this)
    }

    private fun applyMode(wantVideo: Boolean) {
        controller.setEnabledUseCases(
            if (wantVideo) LifecycleCameraController.VIDEO_CAPTURE else LifecycleCameraController.IMAGE_CAPTURE
        )
        video.value = wantVideo
        if (wantVideo && !hasMic()) askMic.launch(Manifest.permission.RECORD_AUDIO)
    }

    fun shoot(seconds: Int) {
        if (busy.value || recording.value) return
        busy.value = true
        job = lifecycleScope.launch {
            if (video.value) {
                applyMode(false)
                CameraRepository.sendState(this@CameraActivity)
                delay(500)
            }
            countDown(seconds)
            takePicture()
        }
    }

    /** Starts a video after the timer (switches to video mode if needed). */
    fun startRec(seconds: Int) {
        if (busy.value || recording.value) return
        busy.value = true
        job = lifecycleScope.launch {
            if (!video.value) {
                applyMode(true)
                CameraRepository.sendState(this@CameraActivity)
                delay(500)
            }
            countDown(seconds)
            beginRecording()
        }
    }

    /** Stops the video (or cancels the timer before it starts). */
    fun stopRec() {
        if (activeRec != null) {
            activeRec?.stop()
        } else if (busy.value) {
            job?.cancel()
            countdown.intValue = 0
            busy.value = false
            CameraRepository.sendRec(false)
            CameraRepository.sendState(this)
        }
    }

    /** The watch left the camera screen: save the video first, then close. */
    fun closeFromWatch() {
        if (activeRec != null) {
            closeAfterRec = true
            activeRec?.stop()
        } else {
            finish()
        }
    }

    private suspend fun countDown(seconds: Int) {
        for (s in seconds downTo 1) {
            countdown.intValue = s
            CameraRepository.sendCount(s)
            delay(1000)
        }
        countdown.intValue = 0
    }

    private fun newName() = "JJAS_" + SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())

    private fun takePicture() {
        val name = newName()
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
                    blink()
                    CameraRepository.sendResult(true, "$name.jpg")
                }

                override fun onError(exception: ImageCaptureException) {
                    busy.value = false
                    CameraRepository.sendResult(false, "No se pudo tomar la foto")
                }
            })
    }

    @SuppressLint("MissingPermission") // AudioConfig only enables audio when RECORD_AUDIO is granted.
    private fun beginRecording() {
        val name = newName()
        val values = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, name)
            put(MediaStore.MediaColumns.MIME_TYPE, "video/mp4")
            put(MediaStore.MediaColumns.RELATIVE_PATH, "Movies/JJAS Tools")
        }
        val output = MediaStoreOutputOptions.Builder(contentResolver, MediaStore.Video.Media.EXTERNAL_CONTENT_URI)
            .setContentValues(values)
            .build()
        try {
            activeRec = controller.startRecording(
                output, AudioConfig.create(hasMic()), ContextCompat.getMainExecutor(this)
            ) { e -> onRecEvent(e, name) }
        } catch (e: Exception) {
            busy.value = false
            CameraRepository.sendResult(false, "No se pudo grabar", video = true)
        }
    }

    private fun onRecEvent(e: VideoRecordEvent, name: String) {
        when (e) {
            is VideoRecordEvent.Start -> {
                busy.value = false
                recording.value = true
                recSecs.longValue = 0
                CameraRepository.sendRec(true)
            }
            is VideoRecordEvent.Status ->
                recSecs.longValue = e.recordingStats.recordedDurationNanos / 1_000_000_000
            is VideoRecordEvent.Finalize -> {
                activeRec = null
                recording.value = false
                busy.value = false
                // Some "errors" (e.g. the camera closed) still leave a valid file.
                val ok = !e.hasError() || e.outputResults.outputUri != Uri.EMPTY
                CameraRepository.sendRec(false)
                if (ok) {
                    lastSaved.value = "$name.mp4"
                    CameraRepository.sendResult(true, "$name.mp4", video = true)
                } else {
                    CameraRepository.sendResult(false, "No se pudo guardar el video", video = true)
                }
                if (closeAfterRec) finish()
            }
        }
    }

    private fun blink() {
        lifecycleScope.launch {
            flash.value = true
            delay(120)
            flash.value = false
        }
    }

    private fun onShutter() {
        when {
            !video.value -> shoot(timer.intValue)
            recording.value || busy.value -> stopRec()
            else -> startRec(timer.intValue)
        }
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
            // Top chip: recording time, or who controls the camera / last file
            if (recording.value) {
                Row(
                    Modifier.statusBarsPadding().padding(16.dp).clip(CircleShape)
                        .background(RecRed).padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(Modifier.size(10.dp).clip(CircleShape).background(Color.White))
                    Spacer(Modifier.width(8.dp))
                    Text(fmtSecs(recSecs.longValue), style = MaterialTheme.typography.labelLarge,
                        color = Color.White, fontWeight = FontWeight.Bold)
                }
            } else {
                Row(
                    Modifier.statusBarsPadding().padding(16.dp).clip(CircleShape)
                        .background(cs.secondaryContainer).padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(Icons.Rounded.Watch, null, tint = cs.onSecondaryContainer, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(
                        if (lastSaved.value.isEmpty()) "Controlada desde el reloj" else "Guardado: ${lastSaved.value}",
                        style = MaterialTheme.typography.labelLarge, color = cs.onSecondaryContainer,
                    )
                }
            }
            // Countdown in an M3 "cookie"
            if (countdown.intValue > 0) {
                Box(
                    Modifier.align(Alignment.Center).size(180.dp).clip(M3Shapes.Cookie12)
                        .background((if (video.value) RecRed else cs.secondary).copy(alpha = 0.85f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("${countdown.intValue}", color = if (video.value) Color.White else cs.onSecondary,
                        fontSize = 96.sp, fontWeight = FontWeight.Black)
                }
            }
            Column(
                Modifier.align(Alignment.BottomCenter).navigationBarsPadding().fillMaxWidth()
                    .padding(bottom = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                // Photo / video selector
                Row(
                    Modifier.clip(CircleShape).background(Color.Black.copy(alpha = 0.45f)).padding(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    ModeChip("Foto", !video.value) { setMode(false) }
                    ModeChip("Video", video.value) { setMode(true) }
                }
                Spacer(Modifier.height(20.dp))
                // Controls
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = 32.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    RoundButton(enabled = !recording.value, onClick = { timer.intValue = nextTimer(timer.intValue) }) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Rounded.Timer, "Temporizador", tint = Color.White)
                            Text(
                                if (timer.intValue == 0) "No" else "${timer.intValue} s",
                                color = Color.White, style = MaterialTheme.typography.labelMedium,
                            )
                        }
                    }
                    Shutter()
                    RoundButton(enabled = !recording.value, onClick = { flip() }) {
                        Icon(Icons.Rounded.Cameraswitch, "Voltear cámara", tint = Color.White)
                    }
                }
            }
            // White flash when the photo is taken
            Box(Modifier.fillMaxSize().alpha(flashAlpha).background(Color.White))
        }
    }

    @Composable
    private fun Shutter() {
        val cs = MaterialTheme.colorScheme
        if (!video.value) {
            Box(
                Modifier.size(88.dp).clip(M3Shapes.Cookie12).background(cs.secondary)
                    .alpha(if (busy.value) 0.5f else 1f)
                    .clickable(enabled = !busy.value) { onShutter() },
                contentAlignment = Alignment.Center,
            ) {
                Box(Modifier.size(56.dp).clip(CircleShape).border(5.dp, cs.onSecondary, CircleShape))
            }
        } else {
            // Video: red dot to record, red square to stop
            Box(
                Modifier.size(88.dp).clip(CircleShape).border(5.dp, Color.White, CircleShape)
                    .clickable { onShutter() },
                contentAlignment = Alignment.Center,
            ) {
                if (recording.value) {
                    Box(Modifier.size(34.dp).clip(RoundedCornerShape(8.dp)).background(RecRed))
                } else {
                    Box(Modifier.size(64.dp).clip(CircleShape).background(RecRed)
                        .alpha(if (busy.value) 0.5f else 1f))
                }
            }
        }
    }

    @Composable
    private fun ModeChip(label: String, selected: Boolean, onClick: () -> Unit) {
        val cs = MaterialTheme.colorScheme
        val locked = busy.value || recording.value
        Box(
            Modifier.clip(CircleShape)
                .background(if (selected) cs.secondaryContainer else Color.Transparent)
                .clickable(enabled = !locked && !selected, onClick = onClick)
                .padding(horizontal = 18.dp, vertical = 8.dp),
        ) {
            Text(label, style = MaterialTheme.typography.labelLarge,
                color = if (selected) cs.onSecondaryContainer else Color.White)
        }
    }

    @Composable
    private fun RoundButton(enabled: Boolean = true, onClick: () -> Unit, content: @Composable () -> Unit) {
        Box(
            Modifier.size(64.dp).clip(CircleShape).background(Color.Black.copy(alpha = 0.45f))
                .alpha(if (enabled) 1f else 0.4f)
                .clickable(enabled = enabled, onClick = onClick),
            contentAlignment = Alignment.Center,
        ) { content() }
    }

    private fun nextTimer(t: Int) = when (t) {
        0 -> 3
        3 -> 10
        else -> 0
    }

    private fun fmtSecs(s: Long) = "%d:%02d".format(s / 60, s % 60)
}
