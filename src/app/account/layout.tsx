
import { ReactNode } from "react";
import AccountSidebar from "@/components/account/AccountSidebar";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 pt-40 pb-24 md:px-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        <aside className="lg:w-72 flex-shrink-0">
          <AccountSidebar />
        </aside>
        <main className="flex-grow animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}
