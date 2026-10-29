import { connection } from "next/server";
import { challengeResponse } from "@/lib/altcha";

export async function GET(req: Request) {
  await connection();
  return challengeResponse(req);
}
