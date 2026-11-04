import Link from "next/link";
import type { ReactNode } from "react";
export const input="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500";
export const select=input;
export const label="text-xs font-semibold text-slate-600";
export const btn={primary:"rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700", secondary:"rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50", danger:"rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"};
export function Page({children}:{children:ReactNode}){return <div className="mx-auto max-w-7xl p-4 pb-24 sm:p-6">{children}</div>;}
export function PageHeader({title,sub,action}:{title:string;sub?:string;action?:ReactNode}){return <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>{sub&&<p className="mt-1 text-sm text-slate-500">{sub}</p>}</div>{action}</div>;}
export function Card({title,children,className=""}:{title?:string;children:ReactNode;className?:string}){return <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{title&&<h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">{title}</h2>}<div className="p-4">{children}</div></section>;}
export function Empty({children}:{children:ReactNode}){return <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">{children}</p>;}
export function Badge({children,tone="slate"}:{children:ReactNode;tone?:"slate"|"red"|"teal"|"indigo"|"amber"}){const c={slate:"bg-slate-100 text-slate-700",red:"bg-rose-100 text-rose-700",teal:"bg-teal-100 text-teal-700",indigo:"bg-indigo-100 text-indigo-700",amber:"bg-amber-100 text-amber-800"}[tone];return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${c}`}>{children}</span>;}
export function TextLink({href,children}:{href:string;children:ReactNode}){return <Link className="text-sm font-medium text-indigo-700 hover:underline" href={href}>{children}</Link>;}
