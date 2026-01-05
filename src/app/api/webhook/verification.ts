import { NextRequest, NextResponse } from "next/server";

// Webhook verification para Meta/WhatsApp
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "lysandra_verify_token";

    console.log("🔍 Webhook Verification Request:", { mode, token, challenge });

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verified successfully");
        return new NextResponse(challenge, { status: 200 });
    } else {
        console.log("❌ Webhook verification failed");
        return new NextResponse("Forbidden", { status: 403 });
    }
}
