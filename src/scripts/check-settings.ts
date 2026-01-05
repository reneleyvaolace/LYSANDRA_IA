import { db } from "../lib/firebase-admin";

async function checkSettings() {
    try {
        const settingsSnap = await db.collection("settings").doc("main").get();
        if (settingsSnap.exists) {
            console.log("Settings found in Firestore:");
            console.log(JSON.stringify(settingsSnap.data(), null, 2));
        } else {
            console.log("No settings found in Firestore.");
        }
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkSettings();
