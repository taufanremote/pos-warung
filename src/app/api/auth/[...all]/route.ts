import { auth } from "@/lib/auth/config";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const GET = handler;
export const POST = handler;