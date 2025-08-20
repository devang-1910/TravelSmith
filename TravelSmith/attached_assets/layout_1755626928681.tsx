export const metadata = {
  title: "TripSmith",
  description: "Travel Planner & Explorer"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
  return (
    <html lang="en">
      <head>
        {/* Expose API base to the browser without using process.env at runtime */}
        <meta name="api-base" content={apiBase} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
