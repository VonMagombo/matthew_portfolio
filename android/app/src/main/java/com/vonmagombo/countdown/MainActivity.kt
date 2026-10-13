package com.vonmagombo.countdown

import android.app.Activity
import android.graphics.Typeface
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.TypedValue
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.TextView

class MainActivity : Activity() {

    private val handler = Handler(Looper.getMainLooper())
    private lateinit var values: List<TextView>
    private lateinit var digits: LinearLayout

    private val tick = object : Runnable {
        override fun run() {
            // Recompute from the wall clock every tick so delayed callbacks never drift
            val now = System.currentTimeMillis()
            render(remainingUntil(TARGET, now))
            val left = TARGET.toEpochMilli() - now
            if (left > 0) {
                // Wake on the next whole-second boundary
                handler.postDelayed(this, left % 1000 + 1)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val cyan = getColor(R.color.cyber_400)
        val muted = getColor(R.color.muted)

        val prompt = TextView(this).apply {
            text = "$ countdown --until end of 2026 (CAT)"
            typeface = Typeface.MONOSPACE
            setTextColor(muted)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            gravity = Gravity.CENTER
        }

        digits = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            // Announce the summary instead of four separately ticking numbers
            importantForAccessibility = LinearLayout.IMPORTANT_FOR_ACCESSIBILITY_YES
        }

        values = listOf("Days", "Hrs", "Min", "Sec").map { label ->
            val value = TextView(this).apply {
                text = "--"
                typeface = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD)
                setTextColor(cyan)
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 44f)
                gravity = Gravity.CENTER
                fontFeatureSettings = "tnum"
                importantForAccessibility = TextView.IMPORTANT_FOR_ACCESSIBILITY_NO
            }
            val caption = TextView(this).apply {
                text = label.uppercase()
                typeface = Typeface.MONOSPACE
                letterSpacing = 0.2f
                setTextColor(muted)
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 11f)
                gravity = Gravity.CENTER
                importantForAccessibility = TextView.IMPORTANT_FOR_ACCESSIBILITY_NO
            }
            val cell = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER
                val pad = dp(10)
                setPadding(pad, 0, pad, 0)
                addView(value)
                addView(caption)
            }
            digits.addView(cell)
            value
        }

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            // Keeps content clear of system bars, including enforced edge-to-edge on Android 15+
            fitsSystemWindows = true
            val pad = dp(16)
            setPadding(pad, pad, pad, pad)
            addView(prompt)
            addView(digits, LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT,
            ).apply { topMargin = dp(16) })
        }
        setContentView(root)
    }

    // Only tick while visible: no wasted wakeups in the background
    override fun onStart() {
        super.onStart()
        handler.post(tick)
    }

    override fun onStop() {
        handler.removeCallbacks(tick)
        super.onStop()
    }

    private fun render(r: Remaining) {
        values[0].text = r.days.toString()
        values[1].text = "%02d".format(r.hours)
        values[2].text = "%02d".format(r.minutes)
        values[3].text = "%02d".format(r.seconds)
        digits.contentDescription = if (r.isFinished) {
            "2026 has ended"
        } else {
            "${r.days} days, ${r.hours} hours and ${r.minutes} minutes remaining"
        }
    }

    private fun dp(value: Int): Int = TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP, value.toFloat(), resources.displayMetrics,
    ).toInt()
}
