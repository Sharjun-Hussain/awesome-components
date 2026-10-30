import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

export class PreviewErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Preview crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-lg rounded-2xl border border-red-300/60 bg-red-50 p-6 text-left dark:border-red-900/60 dark:bg-red-950/40">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            This component crashed while rendering
          </p>
          <pre className="mt-3 overflow-auto rounded-lg bg-white/70 p-3 font-mono text-xs text-red-700 dark:bg-black/30 dark:text-red-300">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-4 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
