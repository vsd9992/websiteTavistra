import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught admin runtime exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#181715] text-[#eae6df] flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-2xl bg-[#24211d] border border-amber-800/40 p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h1 className="text-lg font-bold text-white">Studio Admin Runtime Shield</h1>
                <p className="text-xs text-[#a8a093]">
                  An unexpected rendering error occurred. The application was shielded from crashing the browser tab.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1e1c19] border border-[#38332c] space-y-2">
              <p className="text-xs font-mono text-rose-300">
                {this.state.error?.name}: {this.state.error?.message}
              </p>
              {this.state.errorInfo?.componentStack && (
                <details className="text-[11px] text-[#787165]">
                  <summary className="cursor-pointer hover:text-[#a8a093] transition-colors">
                    View Component Stack
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap font-mono p-2 bg-[#181715] rounded text-[10px] max-h-40 overflow-y-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-[#c59b6d] text-[#181715] font-semibold text-xs hover:bg-[#d6aa7c] transition-colors"
              >
                Attempt In-Place Recovery
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl bg-[#2a2722] border border-[#464037] text-xs font-semibold text-white hover:bg-[#343029] transition-colors"
              >
                Reload Console
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
