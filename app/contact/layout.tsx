export default async function Layout({ children }: { children: any }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {children}
      </main>
    </div>
  );
}
