/**
 * @file app/(auth)/layout.tsx
 * @description Centered card layout for login / signup / verify pages.
 */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-primary text-sm font-medium tracking-widest uppercase">Hidden Gift</p>
          <p className="text-muted-foreground mt-1 text-sm">Bí mật yêu thương cho hai người</p>
        </div>
        {children}
      </div>
    </div>
  );
}
