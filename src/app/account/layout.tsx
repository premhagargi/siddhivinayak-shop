
import { ReactNode } from "react";
import AccountSidebar from "@/components/account/AccountSidebar";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 pt-40 pb-24 md:px-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <aside className="lg:col-span-3">
          <AccountSidebar />
        </aside>
        <main className="lg:col-span-9 animate-in fade-in slide-in-from-right-4 duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}
