package com.jjas.tools.phone.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp

/** Always dark, with the watch's green palette, so they match. */
private val ExpressiveDark = darkColorScheme(
    primary = Green90,
    onPrimary = Green10,
    primaryContainer = Green30,
    onPrimaryContainer = Green90,
    secondary = Blue90,
    onSecondary = Blue10,
    secondaryContainer = Blue30,
    onSecondaryContainer = Blue90,
    tertiary = Violet90,
    onTertiary = Violet10,
    tertiaryContainer = Violet30,
    onTertiaryContainer = Violet90,
    error = Coral90,
    onError = Coral10,
    background = Surface0,
    onBackground = OnSurface,
    surface = Surface0,
    onSurface = OnSurface,
    onSurfaceVariant = OnSurfaceVar,
    surfaceContainerLowest = Surface0,
    surfaceContainerLow = Surface1,
    surfaceContainer = Surface2,
    surfaceContainerHigh = Surface3,
    surfaceContainerHighest = Surface3,
    outline = Outline,
    outlineVariant = Outline,
)

/** Expressive: generous corners. */
private val ExpressiveShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(16.dp),
    medium = RoundedCornerShape(24.dp),
    large = RoundedCornerShape(32.dp),
    extraLarge = RoundedCornerShape(40.dp),
)

@Composable
fun JJASToolsTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = ExpressiveDark,
        typography = Typography,
        shapes = ExpressiveShapes,
        content = content,
    )
}
