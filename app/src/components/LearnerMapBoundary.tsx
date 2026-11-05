import { Component, type ReactNode } from 'react'

/** A failed optional navigation must never replace the productive Cockpit. */
export class LearnerMapBoundary extends Component<{
  children: ReactNode
  onReturnToTree: () => void
  language: 'de' | 'en'
}, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() { return { failed: true } }

  render() {
    if (!this.state.failed) return this.props.children
    return <div className="learner-map-status" role="alert" data-testid="learner-map-error">
      <p>{this.props.language === 'en' ? 'The learning map could not be loaded.' : 'Die Lernkarte konnte nicht geladen werden.'}</p>
      <button type="button" onClick={this.props.onReturnToTree}>{this.props.language === 'en' ? 'Return to tree' : 'Zum Baum wechseln'}</button>
    </div>
  }
}
