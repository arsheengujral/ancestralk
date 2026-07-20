'use client';

import { Component, type ReactNode } from 'react';

/**
 * Isolates a single section of a page so a bug in ONE component (e.g. a custom
 * SVG layout with real, varied data) can't blank out the whole page. Falls back
 * to a small inline message instead of tripping the page-level error boundary —
 * critical on pages like the archive, where the rest of the content (the saved
 * member, quick actions) is exactly how someone confirms their save worked.
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
}

export default class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('SectionErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="ibox">
            <i className="ti ti-alert-triangle" /> This section couldn&apos;t load right now. The rest of your
            archive is unaffected.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
