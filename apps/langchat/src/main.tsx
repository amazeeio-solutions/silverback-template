import "./index.css";

import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";

import App from "./App.tsx";
import { StreamProvider } from "./providers/Stream.tsx";
import { ThreadProvider } from "./providers/Thread.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <NuqsAdapter>
      <ThreadProvider>
        <StreamProvider>
          <App />
        </StreamProvider>
      </ThreadProvider>
      <Toaster />
    </NuqsAdapter>
  </BrowserRouter>,
);
