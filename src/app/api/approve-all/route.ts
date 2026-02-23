import { NextResponse } from "next/server";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

async function convexMutation(name: string, args: Record<string, unknown>) {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: name, args }),
  });
  const data = await res.json();
  if (data.status === "error") throw new Error(data.errorMessage ?? "Convex error");
  return data.value;
}

export async function POST() {
  try {
    const result = await convexMutation("migrations:approveAllExistingUsers", {});
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
