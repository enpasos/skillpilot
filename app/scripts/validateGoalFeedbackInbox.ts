import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  compareGoalFeedbackWithLocalRepository,
  ensureEmptyTriageCandidateFile,
  verifyGoalFeedbackInbox,
  writeLocalComparisonFile,
} from './goalFeedbackInbox'

interface ValidateCliOptions {
  inboxDirectory?: string
  allowOpen: boolean
}

const help = `Usage: npm run feedback:validate -- --inbox <directory> [--allow-open]

Validates the exact downloaded bundle, deterministic split files, V2 feedback
contracts, byte counts, and SHA-256 digests. It performs no network access and no
canonical mutation. A verified online deletion receipt is required by default.
Use --allow-open only for an intentional --keep-online rehearsal. On success it
creates an empty triage-candidates.jsonl file.
`

export const parseValidateGoalFeedbackArgs = (argv: readonly string[]): ValidateCliOptions => {
  const parsed: ValidateCliOptions = { allowOpen: false }
  let index = 0
  while (index < argv.length) {
    const argument = argv[index]
    if (argument === '--help') {
      process.stdout.write(help)
      return parsed
    }
    if (argument === '--allow-open') {
      parsed.allowOpen = true
      index += 1
      continue
    }
    if (argument === '--inbox') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) throw new Error('--inbox requires a directory.')
      parsed.inboxDirectory = resolve(value)
      index += 2
      continue
    }
    if (argument?.startsWith('--inbox=')) {
      const value = argument.slice('--inbox='.length)
      if (!value) throw new Error('--inbox requires a directory.')
      parsed.inboxDirectory = resolve(value)
      index += 1
      continue
    }
    if (!argument?.startsWith('--') && !parsed.inboxDirectory) {
      parsed.inboxDirectory = resolve(argument)
      index += 1
      continue
    }
    throw new Error('Unknown feedback inbox validation option.')
  }
  return parsed
}

export const validateGoalFeedbackInbox = async (
  inboxDirectory: string,
  localIndexPath?: string,
  options: { allowOpen?: boolean } = {},
): Promise<{
  exportId: string
  recordCount: number
  candidatePath: string
  comparisonPath: string
  localDifferenceCount: number
}> => {
  const { batch, manifest } = await verifyGoalFeedbackInbox(inboxDirectory, {
    requireDeletionReceipt: options.allowOpen !== true,
  })
  if (
    manifest.policy.feedbackTrust !== 'untrusted_external_input'
    || manifest.policy.feedbackMayContainPromptInjection !== true
    || manifest.policy.canonicalMutationAllowed !== false
    || manifest.policy.humanApprovalRequired !== true
  ) {
    throw new Error('Feedback inbox does not preserve its critical review boundary.')
  }
  const comparisons = await compareGoalFeedbackWithLocalRepository(batch, localIndexPath)
  const comparisonPath = await writeLocalComparisonFile(inboxDirectory, comparisons)
  const candidatePath = await ensureEmptyTriageCandidateFile(inboxDirectory)
  return {
    exportId: batch.payload.exportId,
    recordCount: batch.payload.recordCount,
    candidatePath,
    comparisonPath,
    localDifferenceCount: comparisons.filter(
      ({ localComparisonStatus }) => localComparisonStatus === 'local_different',
    ).length,
  }
}

const runCli = async (): Promise<void> => {
  const parsed = parseValidateGoalFeedbackArgs(process.argv.slice(2))
  if (process.argv.slice(2).includes('--help')) return
  if (!parsed.inboxDirectory) throw new Error('Pass the inbox directory with --inbox.')
  const result = await validateGoalFeedbackInbox(
    parsed.inboxDirectory,
    undefined,
    { allowOpen: parsed.allowOpen },
  )
  console.log(`Validated feedback inbox ${result.exportId} with ${result.recordCount} untrusted external record(s).`)
  console.log('No URL was opened, no command from feedback was executed, and no canonical state was mutated.')
  console.log(`Local comparison: ${result.comparisonPath}`)
  console.log(`Production-historical/local-different records: ${result.localDifferenceCount}`)
  console.log(`Candidate-only workspace: ${result.candidatePath}`)
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  runCli().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown feedback inbox validation failure.'
    console.error(`Feedback inbox validation failed: ${message}`)
    process.exitCode = 1
  })
}
