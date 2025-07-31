import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class MembersErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Members Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Có lỗi xảy ra!
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <pre className="text-sm text-red-800 whitespace-pre-wrap">
              {this.state.error?.message || "Unknown error occurred"}
            </pre>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Tải lại trang
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
