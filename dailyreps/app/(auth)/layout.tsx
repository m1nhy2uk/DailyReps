export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen px-4">
      {children}
    </div>
  );
}
