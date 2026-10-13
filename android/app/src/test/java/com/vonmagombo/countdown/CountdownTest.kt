package com.vonmagombo.countdown

import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class CountdownTest {

    @Test
    fun targetIsMidnightCatOnNewYear() {
        assertEquals(Instant.parse("2026-12-31T22:00:00Z"), TARGET)
    }

    @Test
    fun splitsIntoUnits() {
        val now = TARGET.toEpochMilli() - ((2L * 86_400 + 3 * 3_600 + 4 * 60 + 5) * 1000 + 999)
        assertEquals(Remaining(2, 3, 4, 5), remainingUntil(TARGET, now))
    }

    @Test
    fun clampsToZeroAfterTarget() {
        val r = remainingUntil(TARGET, TARGET.toEpochMilli() + 60_000)
        assertEquals(Remaining(0, 0, 0, 0), r)
        assertTrue(r.isFinished)
    }

    @Test
    fun lastSecondIsNotFinished() {
        val r = remainingUntil(TARGET, TARGET.toEpochMilli() - 1_000)
        assertEquals(Remaining(0, 0, 0, 1), r)
    }
}
