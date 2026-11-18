package com.jjas.tools.phone.ui

import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Outline
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.asComposePath
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import androidx.graphics.shapes.CornerRounding
import androidx.graphics.shapes.RoundedPolygon
import androidx.graphics.shapes.star
import androidx.graphics.shapes.toPath

/**
 * M3 Expressive shapes (cookie, clover, sunny), built with
 * androidx.graphics.shapes, the same library Material 3 uses underneath.
 */
class PolygonShape(private val polygon: RoundedPolygon) : Shape {
    override fun createOutline(size: Size, layoutDirection: LayoutDirection, density: Density): Outline {
        val path = polygon.toPath()
        val m = android.graphics.Matrix().apply {
            // The polygon is centered at (0,0) with radius 1: scale it to the size.
            setScale(size.width / 2f, size.height / 2f)
            postTranslate(size.width / 2f, size.height / 2f)
        }
        path.transform(m)
        return Outline.Generic(path.asComposePath())
    }
}

object M3Shapes {
    /** Scalloped "cookie" with [n] bumps. */
    fun cookie(n: Int) = PolygonShape(
        RoundedPolygon.star(
            numVerticesPerRadius = n,
            innerRadius = 0.82f,
            rounding = CornerRounding(0.35f),
            innerRounding = CornerRounding(0.35f),
        )
    )

    val Clover = PolygonShape(
        RoundedPolygon.star(
            numVerticesPerRadius = 4,
            innerRadius = 0.55f,
            rounding = CornerRounding(0.9f),
            innerRounding = CornerRounding(0.2f),
        )
    )

    val Sunny = PolygonShape(
        RoundedPolygon.star(
            numVerticesPerRadius = 8,
            innerRadius = 0.8f,
            rounding = CornerRounding(0.15f),
        )
    )

    val Cookie9 = cookie(9)
    val Cookie12 = cookie(12)
}
