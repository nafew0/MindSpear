"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import { store, persistor } from "@/stores/store";
import { PersistGate } from 'redux-persist/integration/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class" enableSystem>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SidebarProvider>{children}</SidebarProvider>
        </PersistGate>
      </ReduxProvider>
    </ThemeProvider>
  );
}
