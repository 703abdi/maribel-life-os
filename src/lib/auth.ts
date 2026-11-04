import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
export const SESSION_COOKIE_NAME="life_session"; const SECONDS=60*60*24*30;
const key=()=>{ const s=process.env.AUTH_SECRET; if(!s||s.length<16) throw new Error("AUTH_SECRET must be at least 16 characters."); return new TextEncoder().encode(s); };
export type SessionPayload={userId:string;email:string;role:"OWNER";sessionVersion:number};
export async function createSessionToken(p:SessionPayload){return new SignJWT(p).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime(`${SECONDS}s`).sign(key());}
export async function verifySessionToken(t:string):Promise<SessionPayload|null>{try {const {payload}=await jwtVerify(t,key()); return typeof payload.userId==="string"&&typeof payload.email==="string"&&payload.role==="OWNER"&&typeof payload.sessionVersion==="number"?payload as unknown as SessionPayload:null;}catch{return null;}}
export async function getSession(){const c=await cookies(); const t=c.get(SESSION_COOKIE_NAME)?.value; return t?verifySessionToken(t):null;}
export async function setSessionCookie(t:string){const c=await cookies(); c.set(SESSION_COOKIE_NAME,t,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:SECONDS});}
export async function clearSessionCookie(){(await cookies()).delete(SESSION_COOKIE_NAME);}
export async function invalidateUserSessions(id:string){await prisma.user.update({where:{id},data:{sessionVersion:{increment:1}}});}
export const hashPassword=(p:string)=>bcrypt.hash(p,12); export const verifyPassword=(p:string,h:string)=>bcrypt.compare(p,h);
export async function requireUser(){const s=await getSession(); if(!s)redirect("/login"); const u=await prisma.user.findUnique({where:{id:s.userId},select:{id:true,email:true,name:true,role:true,active:true,sessionVersion:true}}); if(!u||!u.active||u.sessionVersion!==s.sessionVersion)redirect("/login?message=session-expired"); return u;}
