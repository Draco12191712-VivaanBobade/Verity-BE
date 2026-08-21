import { world } from "@minecraft/server";

world.afterEvents.playerSpawn.subscribe((event) => {
    const { player, initialSpawn } = event;

    // Only show this message when the player joins for the first time.
    if (!initialSpawn) return;

    player.sendMessage("§5§l━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    player.sendMessage("§5§lWelcome to Verity, §d" + player.name + "§5§l!");
    player.sendMessage("§5━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    player.sendMessage("§7Verity is currently in §eStable§7.");
    player.sendMessage("§7Bugs, changes, and unfinished features may still occur.");

    player.sendMessage("§6§lSetup");
    player.sendMessage("§7• Make sure §eBeta APIs§7 are enabled.");
    player.sendMessage("§7• Make sure you're running §eMinecraft 1.26.40§7.");
    player.sendMessage("§aIf you're seeing this message, your setup is working!");

    player.sendMessage("§b§lFish.audio TTS");
    player.sendMessage("§7Verity now supports AI voice via Fish.audio!");
    player.sendMessage("§7• PC/Mac/Linux: Run verity-tts-server.py in files");
    player.sendMessage("§7• Android: Use Termux (see README)");
    player.sendMessage("§7• iOS/Consoles: Use /verity:tts_provider local");
    player.sendMessage("§7Enable: §e/verity:tts_provider fish");

    player.sendMessage("§b§lVoice chat");
    player.sendMessage("§7Verity now supports voice chat!");
    player.sendMessage("§7Download the Vcmc app on Playstore, IOS, and Windows!");

    player.sendMessage("§c§lDiscord Logging & Moderation");
    player.sendMessage("§7Messages sent to Verity are logged to a Discord server");
    player.sendMessage("§7for moderation and abuse prevention.");
    player.sendMessage("§cInappropriate or abusive messages may result in");
    player.sendMessage("§ca ban from using Verity.");
    player.sendMessage("§cPlease do not send sensitive or private information to Verity.");

    player.sendMessage("§5━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    player.sendMessage("§d§Check The files in the mod to run local ai!");
    player.sendMessage("§5§l━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    player.sendMessage("§b§lOfficial Downloads");
    player.sendMessage("§7Verity is officially available through §eCurseForge§7 and §eMCPEDL§7.");
    player.sendMessage("§cDo not download Verity from unofficial websites or reuploads.");
    player.sendMessage("Join the discord server for support: https://discord.gg/affh5Xdvcg");

    player.sendMessage("§5━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    player.sendMessage("§d§lHave fun with Verity!");
    player.sendMessage("§5§l━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});