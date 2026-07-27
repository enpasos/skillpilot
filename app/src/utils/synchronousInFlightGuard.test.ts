import { createSynchronousInFlightGuard } from './synchronousInFlightGuard'

const assertEqual = (actual: unknown, expected: unknown, message?: string) => {
  if (actual !== expected) {
    throw new Error(message ?? `Expected ${String(expected)}, received ${String(actual)}`)
  }
}

const guard = createSynchronousInFlightGuard()

assertEqual(guard.isInFlight(), false)
assertEqual(guard.tryStart(), true)
assertEqual(guard.isInFlight(), true)
assertEqual(guard.tryStart(), false, 'a rapid second start must be rejected synchronously')

guard.finish()
assertEqual(guard.isInFlight(), false)
assertEqual(guard.tryStart(), true, 'a later start must be accepted after completion')

guard.finish()
guard.finish()
assertEqual(guard.tryStart(), true, 'finishing an idle guard must remain harmless')

const independentGuard = createSynchronousInFlightGuard()
assertEqual(independentGuard.tryStart(), true, 'separate entry points must use independent guards')

console.log('synchronous in-flight guard tests passed')
