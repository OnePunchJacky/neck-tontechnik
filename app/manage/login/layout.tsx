export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page doesn't need the AdminLayout wrapper
  // This layout overrides the parent /manage/layout.tsx
  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)]">
      {children}
    </div>
  );
}

