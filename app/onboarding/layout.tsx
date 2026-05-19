/**
 * @file app/onboarding/layout.tsx
 * @description Standalone layout for the onboarding wizard — no sidebar.
 */

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center">
          <p className="text-primary text-sm font-medium tracking-widest uppercase">Hidden Gift</p>
          <p className="text-muted-foreground mt-1 text-sm">Setup nhanh trong 30 giây</p>
        </div>
        {children}
      </div>
    </div>
  );
}
