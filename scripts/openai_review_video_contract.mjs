import { createHash } from 'node:crypto'

export const OPENAI_REVIEW_VIDEO = Object.freeze({
  bytes: 11_104_503,
  publicUrl:
    'https://skillpilot.com/api/public/openai/review/skillpilot-coach-v1/1.0.0/'
    + 'sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4',
  relativePath:
    'openai-review/skillpilot-coach-v1/1.0.0/'
    + 'sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4',
  sha256: '20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb',
})

export function validateOpenAiReviewVideoBytes(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value)
  if (bytes.length !== OPENAI_REVIEW_VIDEO.bytes) {
    throw new Error(
      `unexpected byte size ${bytes.length}; expected ${OPENAI_REVIEW_VIDEO.bytes}`,
    )
  }

  const sha256 = createHash('sha256').update(bytes).digest('hex')
  if (sha256 !== OPENAI_REVIEW_VIDEO.sha256) {
    throw new Error(
      `unexpected SHA-256 ${sha256}; expected ${OPENAI_REVIEW_VIDEO.sha256}`,
    )
  }

  if (bytes.subarray(4, 8).toString('ascii') !== 'ftyp') {
    throw new Error('file does not have an MP4 ftyp signature')
  }

  const moovOffset = bytes.indexOf(Buffer.from('moov', 'ascii'))
  const mediaDataOffset = bytes.indexOf(Buffer.from('mdat', 'ascii'))
  if (moovOffset < 0 || mediaDataOffset < 0 || moovOffset > mediaDataOffset) {
    throw new Error('MP4 metadata is not positioned before media data for streaming')
  }

  return { bytes: bytes.length, sha256 }
}
