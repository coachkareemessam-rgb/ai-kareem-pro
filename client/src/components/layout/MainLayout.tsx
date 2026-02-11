export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
