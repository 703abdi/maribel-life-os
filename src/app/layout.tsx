import "./globals.css"; import type { Metadata } from "next"; import {BRAND} from "@/config/brand";
export const metadata:Metadata={title:BRAND.name,description:"Direct your life."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
