package com.vonmagombo.countdown

import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneOffset

/**
 * End of 2026 in Central Africa Time. CAT is a fixed UTC+02:00 with no DST,
 * so a constant offset is exact and every device counts to the same instant
 * regardless of its own timezone setting.
 */
val TARGET: Instant = OffsetDateTime.of(2027, 1, 1, 0, 0, 0, 0, ZoneOffset.ofHours(2)).toInstant()

data class Remaining(val days: Long, val hours: Int, val minutes: Int, val seconds: Int) {
    val isFinished: Boolean get() = days == 0L && hours == 0 && minutes == 0 && seconds == 0
}

/** Time left until [target], clamped at zero once the target has passed. */
fun remainingUntil(target: Instant, nowMillis: Long): Remaining {
    val totalSeconds = maxOf(0L, target.toEpochMilli() - nowMillis) / 1000
    return Remaining(
        days = totalSeconds / 86_400,
        hours = ((totalSeconds / 3_600) % 24).toInt(),
        minutes = ((totalSeconds / 60) % 60).toInt(),
        seconds = (totalSeconds % 60).toInt(),
    )
}
