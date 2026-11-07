set -euo pipefail
if [[ "${CURRICULUM_CORE_RESULT:-}" != success || "${CURRICULUM_BOOK_RESULT:-}" != success ]]; then
  echo "::error::Curriculum CI requires successful core and book jobs; core=${CURRICULUM_CORE_RESULT:-missing}, book=${CURRICULUM_BOOK_RESULT:-missing}."
  exit 1
fi
