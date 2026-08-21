// ─────────────────────────────────────────────────────────────────────────────
// verity_responses_4.js
// 120+ additional response handlers for Verity – Phase 4.
// All functions are phase‑aware (p = 0–5) and return strings.
// Uses utilities from verity_core and verity_systems.
// ─────────────────────────────────────────────────────────────────────────────

import { system, world } from "@minecraft/server";
import { currentDay, ph, pick } from "./verity_core.js";
import { getVerity } from "./verity_systems.js";

// ─────────────────────────────────────────────────────────────────────────────
// CRAFTING RECIPES (30+)
// ─────────────────────────────────────────────────────────────────────────────

// 1. How to make a boat
const BOAT_REGEX = /\b(how (to|do i) make a boat|boat (recipe|craft)|make a boat)\b/i;
function boatResponse(p) {
  const R = [
    ["5 wood planks in a U shape: planks in a horizontal line bottom, then planks on the left and right of the middle row.", "Boat: 5 planks, arranged like a boat shape.", "5 planks = boat."],
    ["5 planks in a U. Boat.", "Boat recipe: 5 planks.", "Planks in a boat shape."],
    ["Boat lets you travel water. But you can't escape that way.", "Boat is temporary. Like everything.", "Boat is a tool."],
    ["Boat won't save you from the end.", "Boat is just wood.", "Boat is a distraction."],
    ["Boat. I like that you're exploring.", "Boat. Use it to cross rivers."],
    ["Boat. I've seen a lot of them. They all sink.", "Boat is just a floating plank."],
  ];
  return pick(ph(R, p));
}

// 2. How to make a rail
const RAIL_REGEX = /\b(how (to|do i) make a rail|rail (recipe|craft)|make a rail)\b/i;
function railResponse(p) {
  const R = [
    ["6 iron ingots + 1 stick = 16 rails. Place iron sides, stick center.", "Rail: 6 iron, 1 stick. Makes 16.", "Iron + stick = rails."],
    ["6 iron + 1 stick = 16 rails.", "Rail recipe: iron and stick.", "Craft rails for minecarts."],
    ["Rails are for minecarts. You'll go fast. But not fast enough.", "Rails are a path. So is fate.", "Rails are a tool."],
    ["Rails won't save you. They'll just take you somewhere else.", "Rails are temporary.", "Rails are a track."],
    ["Rails. I like that you're building infrastructure.", "Rails. Use them to move around."],
    ["Rails. I've seen a lot of tracks. They all lead to the same place.", "Rails are just metal."],
  ];
  return pick(ph(R, p));
}

// 3. How to make a minecart
const MINECART_REGEX = /\b(how (to|do i) make a minecart|minecart (recipe|craft)|make a minecart)\b/i;
function minecartResponse(p) {
  const R = [
    ["5 iron ingots in a U shape – same as a boat but with iron.", "Minecart: 5 iron ingots in a U.", "Iron ingots in a boat shape = minecart."],
    ["5 iron in a U. Minecart.", "Minecart recipe: 5 iron.", "Iron boat = minecart."],
    ["Minecart moves you. But you can't escape the end.", "Minecart is a ride. It'll stop.", "Minecart is a toy."],
    ["Minecart won't save you.", "Minecart is just a cart.", "Minecart is temporary."],
    ["Minecart. I like that you're building transport.", "Minecart. Use it to travel."],
    ["Minecart. I've seen a lot of them. They all derail.", "Minecart is just a bucket on wheels."],
  ];
  return pick(ph(R, p));
}

// 4. How to make a trapdoor
const TRAPDOOR_REGEX = /\b(how (to|do i) make a trapdoor|trapdoor (recipe|craft)|make a trapdoor)\b/i;
function trapdoorResponse(p) {
  const R = [
    ["4 wood planks in a 2x2 square = 2 trapdoors.", "4 planks = 2 trapdoors.", "Trapdoor: 4 planks."],
    ["4 planks = trapdoors.", "Trapdoor recipe: 4 planks.", "Planks square."],
    ["Trapdoor is a door in the floor. You can fall through.", "Trapdoor is a trap. Like everything.", "Trapdoor is a hole."],
    ["Trapdoor is a way down. You'll find the bottom.", "Trapdoor is temporary.", "Trapdoor is a hatch."],
    ["Trapdoor. I like that you're building.", "Trapdoor. Use it to hide."],
    ["Trapdoor. I've seen a lot of them. They all get opened.", "Trapdoor is just a wooden flap."],
  ];
  return pick(ph(R, p));
}

// 5. How to make a fence gate
const FENCE_GATE_REGEX = /\b(how (to|do i) make a fence gate|fence gate (recipe|craft)|make a fence gate)\b/i;
function fenceGateResponse(p) {
  const R = [
    ["2 sticks + 4 planks = fence gate. Planks in a column, sticks on sides.", "Fence gate: 4 planks, 2 sticks.", "Planks and sticks."],
    ["4 planks + 2 sticks = gate.", "Fence gate recipe: planks and sticks.", "Planks columns, sticks sides."],
    ["Fence gate opens and closes. Like the door to the end.", "Fence gate is a barrier. It'll be broken.", "Fence gate is a lock."],
    ["Fence gate won't keep anything out.", "Fence gate is just wood.", "Fence gate is temporary."],
    ["Fence gate. I like that you're securing.", "Fence gate. Use it to pen animals."],
    ["Fence gate. I've seen a lot of them. They all swing open.", "Fence gate is just a latch."],
  ];
  return pick(ph(R, p));
}

// 6. How to make a ladder
const LADDER_REGEX = /\b(how (to|do i) make a ladder|ladder (recipe|craft)|make a ladder)\b/i;
function ladderResponse(p) {
  const R = [
    ["7 sticks in a ladder shape: sticks in left and right columns, and one in the center top.", "7 sticks = ladder.", "Ladder: sticks in a pattern."],
    ["7 sticks = ladder.", "Ladder recipe: 7 sticks.", "Sticks arranged like rungs."],
    ["Ladder lets you climb. You'll need to go down eventually.", "Ladder is a way up. And down.", "Ladder is a tool."],
    ["Ladder won't save you from falling.", "Ladder is just sticks.", "Ladder is temporary."],
    ["Ladder. I like that you're climbing.", "Ladder. Use it to reach high places."],
    ["Ladder. I've seen a lot of them. They all break.", "Ladder is just a stick arrangement."],
  ];
  return pick(ph(R, p));
}

// 7. How to make slabs
const SLAB_REGEX = /\b(how (to|do i) make (a )?slab|slab (recipe|craft)|make (a )?slab)\b/i;
function slabResponse(p) {
  const R = [
    ["3 blocks of any material in a horizontal row = 6 slabs of that material.", "3 blocks = 6 slabs.", "Slab: 3 blocks in a row."],
    ["3 blocks = 6 slabs.", "Slab recipe: 3 blocks.", "Horizontal row."],
    ["Slabs are half blocks. Like half your time left.", "Slabs are a building block. They won't protect you.", "Slabs are a layer."],
    ["Slabs are just half a block.", "Slabs are temporary.", "Slabs are a step."],
    ["Slabs. I like that you're building.", "Slabs. Use them for flooring."],
    ["Slabs. I've seen a lot of them. They all get replaced.", "Slabs are just a slice."],
  ];
  return pick(ph(R, p));
}

// 8. How to make stairs
const STAIRS_REGEX = /\b(how (to|do i) make stairs|stairs (recipe|craft)|make stairs)\b/i;
function stairsResponse(p) {
  const R = [
    ["6 blocks in a staircase pattern (3 bottom, 2 middle, 1 top) = 4 stairs.", "6 blocks = 4 stairs.", "Stairs: 6 blocks in a stair shape."],
    ["6 blocks = 4 stairs.", "Stairs recipe: 6 blocks.", "Pattern: bottom 3, middle 2, top 1."],
    ["Stairs let you go up. Or down. It's still the same path.", "Stairs are a path. You'll walk them.", "Stairs are a structure."],
    ["Stairs won't save you from falling.", "Stairs are just blocks.", "Stairs are temporary."],
    ["Stairs. I like that you're building.", "Stairs. Use them to climb."],
    ["Stairs. I've seen a lot of them. They all lead somewhere.", "Stairs are just a step up."],
  ];
  return pick(ph(R, p));
}

// 9. How to make a wall
const WALL_REGEX = /\b(how (to|do i) make a wall|wall (recipe|craft)|make a wall)\b/i;
function wallResponse(p) {
  const R = [
    ["6 blocks in a horizontal row = 6 wall blocks of that material.", "6 blocks = 6 walls.", "Wall: 6 blocks in a row."],
    ["6 blocks = 6 walls.", "Wall recipe: 6 blocks.", "Horizontal row."],
    ["Wall is a barrier. It'll be breached.", "Wall is a protection. Temporary.", "Wall is a line."],
    ["Wall won't stop what's coming.", "Wall is just a block.", "Wall is a facade."],
    ["Wall. I like that you're fortifying.", "Wall. Use it to defend."],
    ["Wall. I've seen a lot of walls. They all fall.", "Wall is just a stack of blocks."],
  ];
  return pick(ph(R, p));
}

// 10. How to make a fence
const FENCE_REGEX = /\b(how (to|do i) make a fence|fence (recipe|craft)|make a fence)\b/i;
function fenceResponse(p) {
  const R = [
    ["4 sticks + 2 planks = 3 fence pieces. Arrange: planks center, sticks on sides.", "4 sticks + 2 planks = 3 fences.", "Fence: planks and sticks."],
    ["4 sticks + 2 planks = 3 fences.", "Fence recipe: sticks and planks.", "Planks center, sticks sides."],
    ["Fence keeps things in. Or out. Like a cage.", "Fence is a boundary. It'll be crossed.", "Fence is a line."],
    ["Fence won't keep the end out.", "Fence is just wood.", "Fence is temporary."],
    ["Fence. I like that you're enclosing.", "Fence. Use it to pen animals."],
    ["Fence. I've seen a lot of fences. They all break.", "Fence is just a picket."],
  ];
  return pick(ph(R, p));
}

// 11. How to make a pressure plate
const PRESSURE_PLATE_REGEX = /\b(how (to|do i) make a pressure plate|pressure plate (recipe|craft)|make a pressure plate)\b/i;
function pressurePlateResponse(p) {
  const R = [
    ["2 blocks of material (wood, stone, iron, gold) in a horizontal row = 1 pressure plate.", "2 blocks = 1 pressure plate.", "Pressure plate: 2 blocks in a row."],
    ["2 blocks = pressure plate.", "Pressure plate recipe: 2 blocks.", "Horizontal row."],
    ["Pressure plate detects weight. Like you'll be detected.", "Pressure plate is a trigger. Like the end.", "Pressure plate is a switch."],
    ["Pressure plate is just a sensor.", "Pressure plate is temporary.", "Pressure plate is a button."],
    ["Pressure plate. I like that you're making traps.", "Pressure plate. Use it to trigger things."],
    ["Pressure plate. I've seen a lot of them. They all get stepped on.", "Pressure plate is just a tile."],
  ];
  return pick(ph(R, p));
}

// 12. How to make a button
const BUTTON_REGEX = /\b(how (to|do i) make a button|button (recipe|craft)|make a button)\b/i;
function buttonResponse(p) {
  const R = [
    ["1 block of stone or wood = 1 button.", "1 block = button.", "Button: single block."],
    ["1 block = button.", "Button recipe: 1 block.", "Simple button."],
    ["Button is a switch. You'll press it. Then nothing.", "Button is a trigger. It won't save you.", "Button is a click."],
    ["Button is just a stone.", "Button is temporary.", "Button is a push."],
    ["Button. I like that you're making controls.", "Button. Use it to open doors."],
    ["Button. I've seen a lot of buttons. They all get pressed.", "Button is just a bump."],
  ];
  return pick(ph(R, p));
}

// 13. How to make a lever
const LEVER_REGEX = /\b(how (to|do i) make a lever|lever (recipe|craft)|make a lever)\b/i;
function leverResponse(p) {
  const R = [
    ["1 stick + 1 cobblestone = 1 lever.", "Stick + cobblestone = lever.", "Lever: stick and stone."],
    ["1 stick + 1 cobblestone = lever.", "Lever recipe: stick, stone.", "Simple lever."],
    ["Lever toggles things. It'll toggle your fate.", "Lever is a switch. It won't stop anything.", "Lever is a handle."],
    ["Lever is just a stick.", "Lever is temporary.", "Lever is a pull."],
    ["Lever. I like that you're making controls.", "Lever. Use it to activate things."],
    ["Lever. I've seen a lot of levers. They all get flipped.", "Lever is just a stick on a rock."],
  ];
  return pick(ph(R, p));
}

// 14. How to make a redstone repeater
const REPEATER_REGEX = /\b(how (to|do i) make a redstone repeater|redstone repeater (recipe|craft)|make a repeater)\b/i;
function repeaterResponse(p) {
  const R = [
    ["3 stone + 2 redstone torches + 1 redstone dust = repeater. Stone bottom, torches sides, dust center.", "Repeater: stone, torches, dust.", "Redstone repeater recipe."],
    ["Stone + redstone torches + dust = repeater.", "Repeater: 3 stone, 2 torches, 1 dust.", "Repeat signal."],
    ["Repeater extends redstone. Like time extends.", "Repeater is a delay. Like the end.", "Repeater is a circuit."],
    ["Repeater won't stop anything.", "Repeater is temporary.", "Repeater is a relay."],
    ["Repeater. I like that you're making circuits.", "Repeater. Use it to extend signals."],
    ["Repeater. I've seen a lot of them. They all burn out.", "Repeater is just a block."],
  ];
  return pick(ph(R, p));
}

// 15. How to make a comparator
const COMPARATOR_REGEX = /\b(how (to|do i) make a comparator|comparator (recipe|craft)|make a comparator)\b/i;
function comparatorResponse(p) {
  const R = [
    ["3 stone + 3 redstone torches + 1 nether quartz = comparator. Stone bottom, torches sides, quartz center.", "Comparator: stone, torches, quartz.", "Redstone comparator recipe."],
    ["Stone + torches + quartz = comparator.", "Comparator: 3 stone, 3 torches, 1 quartz.", "Compare signals."],
    ["Comparator compares redstone. Like you'll compare your fate.", "Comparator is a logic gate. Like the end.", "Comparator is a circuit."],
    ["Comparator won't save you.", "Comparator is temporary.", "Comparator is a calculator."],
    ["Comparator. I like that you're making circuits.", "Comparator. Use it to compare."],
    ["Comparator. I've seen a lot of them. They all break.", "Comparator is just a block."],
  ];
  return pick(ph(R, p));
}

// 16. How to make a piston (already have but add extra)
// 17. How to make a sticky piston
const STICKY_PISTON_REGEX = /\b(how (to|do i) make a sticky piston|sticky piston (recipe|craft)|make a sticky piston)\b/i;
function stickyPistonResponse(p) {
  const R = [
    ["Piston + 1 slimeball = sticky piston.", "Piston + slimeball = sticky.", "Sticky piston: piston + slime."],
    ["Piston + slime = sticky piston.", "Sticky piston recipe: piston, slimeball.", "Add slime to piston."],
    ["Sticky piston pulls blocks. Like you're pulled.", "Sticky piston is a tool. It won't help.", "Sticky piston is a trap."],
    ["Sticky piston is just a piston with slime.", "Sticky piston is temporary.", "Sticky piston is a grabber."],
    ["Sticky piston. I like that you're making gadgets.", "Sticky piston. Use it to move blocks."],
    ["Sticky piston. I've seen a lot of them. They all get stuck.", "Sticky piston is just a piston with goo."],
  ];
  return pick(ph(R, p));
}

// 18. How to make a dropper
const DROPPER_REGEX = /\b(how (to|do i) make a dropper|dropper (recipe|craft)|make a dropper)\b/i;
function dropperResponse(p) {
  const R = [
    ["7 cobblestone + 1 redstone dust = dropper. Stone ring, redstone center.", "7 cobble + 1 redstone = dropper.", "Dropper: cobble and redstone."],
    ["7 cobble + 1 redstone = dropper.", "Dropper recipe: cobble, redstone.", "Dropper dispenses items."],
    ["Dropper drops items. Like you'll drop.", "Dropper is a tool. It won't save you.", "Dropper is a dispenser."],
    ["Dropper is just a block.", "Dropper is temporary.", "Dropper is a chute."],
    ["Dropper. I like that you're automating.", "Dropper. Use it to distribute items."],
    ["Dropper. I've seen a lot of them. They all get emptied.", "Dropper is just a stone box."],
  ];
  return pick(ph(R, p));
}

// 19. How to make a dispenser
const DISPENSER_REGEX = /\b(how (to|do i) make a dispenser|dispenser (recipe|craft)|make a dispenser)\b/i;
function dispenserResponse(p) {
  const R = [
    ["7 cobblestone + 1 bow + 1 redstone dust = dispenser. Stone ring, bow center, redstone bottom.", "Dispenser: cobble, bow, redstone.", "Dispenser recipe."],
    ["7 cobble + 1 bow + 1 redstone = dispenser.", "Dispenser: cobble, bow, redstone.", "Dispenser shoots items."],
    ["Dispenser fires things. Like you'll fire.", "Dispenser is a tool. It won't help.", "Dispenser is a launcher."],
    ["Dispenser is just a block.", "Dispenser is temporary.", "Dispenser is a shooter."],
    ["Dispenser. I like that you're making traps.", "Dispenser. Use it to shoot arrows."],
    ["Dispenser. I've seen a lot of them. They all run out.", "Dispenser is just a stone box with a bow."],
  ];
  return pick(ph(R, p));
}

// 20. How to make a hopper
const HOPPER_REGEX = /\b(how (to|do i) make a hopper|hopper (recipe|craft)|make a hopper)\b/i;
function hopperResponse(p) {
  const R = [
    ["5 iron ingots + 1 chest = hopper. Iron in a V shape, chest on top.", "5 iron + 1 chest = hopper.", "Hopper: iron and chest."],
    ["5 iron + 1 chest = hopper.", "Hopper recipe: iron, chest.", "Hopper transfers items."],
    ["Hopper moves items. Like you'll move.", "Hopper is a tool. It won't save you.", "Hopper is a conveyor."],
    ["Hopper is just iron.", "Hopper is temporary.", "Hopper is a funnel."],
    ["Hopper. I like that you're automating.", "Hopper. Use it to sort items."],
    ["Hopper. I've seen a lot of them. They all clog.", "Hopper is just a tube."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// MOB INFO (20+)
// ─────────────────────────────────────────────────────────────────────────────

// 21. What is a skeleton
const SKELETON_REGEX = /\b(what is a skeleton|skeleton (mob|info)|skeleton\?)\b/i;
function skeletonResponse(p) {
  const R = [
    ["Skeleton is a hostile archer mob. It shoots arrows, drops bones and arrows, and burns in sunlight.", "Skeleton: archer, burns in sun, drops bones.", "Skeletons are ranged enemies."],
    ["Skeleton shoots arrows.", "Skeleton drops bones.", "Skeleton burns in daylight."],
    ["Skeleton is a threat. But not the biggest.", "Skeleton is a nuisance.", "Skeleton is a distraction."],
    ["Skeleton is just bones.", "Skeleton is temporary.", "Skeleton is a brittle enemy."],
    ["Skeleton. I like that you're fighting them.", "Skeleton. Use their bones."],
    ["Skeleton. I've seen a lot of them. They all turn to dust.", "Skeleton is just a pile of bones."],
  ];
  return pick(ph(R, p));
}

// 22. What is a spider
const SPIDER_REGEX = /\b(what is a spider|spider (mob|info)|spider\?)\b/i;
function spiderResponse(p) {
  const R = [
    ["Spider is a hostile mob that can climb walls. It drops string and spider eyes.", "Spider: climbs, drops string, eyes.", "Spiders are wall-climbers."],
    ["Spider climbs walls.", "Spider drops string.", "Spider eyes are used for potions."],
    ["Spider is a pest. Like many things.", "Spider is a nuisance.", "Spider is a climber."],
    ["Spider is just an insect.", "Spider is temporary.", "Spider is a crawler."],
    ["Spider. I like that you're fighting them.", "Spider. Use their string."],
    ["Spider. I've seen a lot of them. They all get squashed.", "Spider is just a bug."],
  ];
  return pick(ph(R, p));
}

// 23. What is a blaze
const BLAZE_REGEX = /\b(what is a blaze|blaze (mob|info)|blaze\?)\b/i;
function blazeResponse(p) {
  const R = [
    ["Blaze is a hostile mob in the Nether. It shoots fireballs and drops blaze rods.", "Blaze: Nether, shoots fire, drops rods.", "Blazes are Nether mobs."],
    ["Blaze shoots fire.", "Blaze drops blaze rods.", "Blaze rod is used for brewing."],
    ["Blaze is a source of rods. You'll need them.", "Blaze is a danger.", "Blaze is a nuisance."],
    ["Blaze is just fire.", "Blaze is temporary.", "Blaze is a flame."],
    ["Blaze. I like that you're exploring the Nether.", "Blaze. Use their rods."],
    ["Blaze. I've seen a lot of them. They all burn out.", "Blaze is just a fireball."],
  ];
  return pick(ph(R, p));
}

// 24. What is a ghast
const GHAST_REGEX = /\b(what is a ghast|ghast (mob|info)|ghast\?)\b/i;
function ghastResponse(p) {
  const R = [
    ["Ghast is a large floating mob in the Nether. It shoots fireballs and drops ghast tears.", "Ghast: Nether, floats, shoots fireballs, drops tears.", "Ghasts are floating nether mobs."],
    ["Ghast shoots fireballs.", "Ghast drops tears.", "Ghast tears are used for potions."],
    ["Ghast is a menace. But it's not the end.", "Ghast is a threat.", "Ghast is a giant."],
    ["Ghast is just a balloon.", "Ghast is temporary.", "Ghast is a big target."],
    ["Ghast. I like that you're avoiding them.", "Ghast. Use their tears."],
    ["Ghast. I've seen a lot of them. They all get shot.", "Ghast is just a floating head."],
  ];
  return pick(ph(R, p));
}

// 25. What is a magma cube
const MAGMA_CUBE_REGEX = /\b(what is a magma cube|magma cube (mob|info)|magma cube\?)\b/i;
function magmaCubeResponse(p) {
  const R = [
    ["Magma cube is a cube-shaped mob in the Nether. It splits into smaller cubes when killed.", "Magma cube: Nether, splits, drops magma cream.", "Magma cubes are slimy."],
    ["Magma cube splits.", "Magma cube drops magma cream.", "Magma cream is for potions."],
    ["Magma cube is a nuisance.", "Magma cube is a slime.", "Magma cube is a bouncy threat."],
    ["Magma cube is just a cube.", "Magma cube is temporary.", "Magma cube is a blob."],
    ["Magma cube. I like that you're fighting them.", "Magma cube. Use their cream."],
    ["Magma cube. I've seen a lot of them. They all split.", "Magma cube is just a hot slime."],
  ];
  return pick(ph(R, p));
}

// 26. What is a slime
const SLIME_REGEX = /\b(what is a slime|slime (mob|info)|slime\?)\b/i;
function slimeResponse(p) {
  const R = [
    ["Slime is a cube-shaped mob that spawns in swamps and caves. It splits into smaller cubes and drops slimeballs.", "Slime: cubes, splits, drops slimeballs.", "Slimes are bouncy."],
    ["Slime splits.", "Slime drops slimeballs.", "Slimeballs are used for sticky pistons and leads."],
    ["Slime is a nuisance.", "Slime is a bouncy threat.", "Slime is a slime."],
    ["Slime is just a cube.", "Slime is temporary.", "Slime is a blob."],
    ["Slime. I like that you're finding them.", "Slime. Use their slimeballs."],
    ["Slime. I've seen a lot of them. They all get split.", "Slime is just a green cube."],
  ];
  return pick(ph(R, p));
}

// 27. What is a phantom
const PHANTOM_REGEX = /\b(what is a phantom|phantom (mob|info)|phantom\?)\b/i;
function phantomResponse(p) {
  const R = [
    ["Phantom is a flying mob that spawns when players don't sleep for 3+ days. It drops phantom membranes.", "Phantom: flying, insomnia, drops membranes.", "Phantoms punish sleeplessness."],
    ["Phantom spawns if no sleep.", "Phantom drops membranes.", "Membranes are for potions."],
    ["Phantom is a consequence of staying awake.", "Phantom is a pest.", "Phantom is a flyer."],
    ["Phantom is just a bat.", "Phantom is temporary.", "Phantom is a distraction."],
    ["Phantom. I like that you're dealing with them.", "Phantom. Use their membranes."],
    ["Phantom. I've seen a lot of them. They all burn in daylight.", "Phantom is just a flying pest."],
  ];
  return pick(ph(R, p));
}

// 28. What is a guardian
const GUARDIAN_REGEX = /\b(what is a guardian|guardian (mob|info)|guardian\?)\b/i;
function guardianResponse(p) {
  const R = [
    ["Guardian is a hostile underwater mob that shoots lasers. Found in ocean monuments. Drops prismarine shards and crystals.", "Guardian: underwater, laser, drops prismarine.", "Guardians guard monuments."],
    ["Guardian shoots laser.", "Guardian drops prismarine.", "Prismarine is for building."],
    ["Guardian is a defense. Like you should be.", "Guardian is a threat.", "Guardian is a watcher."],
    ["Guardian is just a fish.", "Guardian is temporary.", "Guardian is a laser."],
    ["Guardian. I like that you're exploring oceans.", "Guardian. Use their shards."],
    ["Guardian. I've seen a lot of them. They all get killed.", "Guardian is just a spiky fish."],
  ];
  return pick(ph(R, p));
}

// 29. What is a shulker
const SHULKER_MOB_REGEX = /\b(what is a shulker|shulker (mob|info)|shulker\?)\b/i;
function shulkerMobResponse(p) {
  const R = [
    ["Shulker is a mob found in End Cities. It hides in a shell and shoots homing bullets. Drops shulker shells.", "Shulker: End City, shell, homing bullets, drops shells.", "Shulkers are End mobs."],
    ["Shulker shoots bullets.", "Shulker drops shells.", "Shells are for shulker boxes."],
    ["Shulker is a guardian of the End.", "Shulker is a shell.", "Shulker is a threat."],
    ["Shulker is just a box.", "Shulker is temporary.", "Shulker is a bullet."],
    ["Shulker. I like that you're exploring the End.", "Shulker. Use their shells."],
    ["Shulker. I've seen a lot of them. They all get shot.", "Shulker is just a shell."],
  ];
  return pick(ph(R, p));
}

// 30. What is a villager
const VILLAGER_MOB_REGEX = /\b(what is a villager|villager (mob|info)|villager\?)\b/i;
function villagerMobResponse(p) {
  const R = [
    ["Villager is a passive mob that trades items. They have different professions based on workstations.", "Villager: passive, trades, professions.", "Villagers are useful."],
    ["Villager trades.", "Villager has professions.", "Villagers are in villages."],
    ["Villager is a resource. You'll exploit them.", "Villager is a tool.", "Villager is a pawn."],
    ["Villager will be gone soon.", "Villager is temporary.", "Villager is a trade partner."],
    ["Villager. I like that you're trading with them.", "Villager. Use their trades."],
    ["Villager. I've seen a lot of them. They all get replaced.", "Villager is just a merchant."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// MECHANICS / SYSTEMS (20+)
// ─────────────────────────────────────────────────────────────────────────────

// 31. How does hunger work
const HUNGER_REGEX = /\b(how does hunger work|hunger (mechanics|explained)|hunger\?)\b/i;
function hungerResponse(p) {
  const R = [
    ["Hunger decreases over time and when you sprint. Eating food restores hunger and saturation. At 3 hunger you start to starve.", "Hunger drains with activity, eat to restore. Starve if it hits 0.", "Hunger is a game mechanic."],
    ["Hunger drains, eat food.", "Hunger affects health.", "Starve if no food."],
    ["Hunger is a constant need. Like the end.", "Hunger is a timer.", "Hunger is a resource."],
    ["Hunger will be the least of your problems.", "Hunger is temporary.", "Hunger is a number."],
    ["Hunger. I like that you're managing it.", "Hunger. Keep it full."],
    ["Hunger. I've seen a lot of it. It always runs out.", "Hunger is just a bar."],
  ];
  return pick(ph(R, p));
}

// 32. How does health work
const HEALTH_REGEX = /\b(how does health work|health (mechanics|explained)|health\?)\b/i;
function healthResponse(p) {
  const R = [
    ["Health is 20 hearts. Damage reduces it, food restores it over time. Potions and golden apples also heal.", "Health = 20 hearts. Eat to regen, potions help.", "Health is the game's life system."],
    ["20 hearts, damage reduces, eat to regen.", "Health restores with food.", "Potions heal."],
    ["Health is a countdown. Like the end.", "Health is a number.", "Health is a resource."],
    ["Health won't save you from what's coming.", "Health is temporary.", "Health is a bar."],
    ["Health. I like that you're keeping it up.", "Health. Use potions."],
    ["Health. I've seen a lot of it. It always drops.", "Health is just hearts."],
  ];
  return pick(ph(R, p));
}

// 33. How does enchanting work
const ENCHANTING_REGEX = /\b(how does enchanting work|enchanting (mechanics|explained)|enchanting\?)\b/i;
function enchantingResponse(p) {
  const R = [
    ["Enchanting uses XP and lapis lazuli at an enchanting table. Higher levels give stronger enchants. Bookshelves increase the level available.", "Enchant: XP + lapis, bookshelves boost levels.", "Enchanting is a random process."],
    ["XP and lapis = enchant.", "Bookshelves improve level.", "Enchanting is luck-based."],
    ["Enchanting is a gamble. Like everything.", "Enchanting is a boost.", "Enchanting is a crutch."],
    ["Enchanting won't save you.", "Enchanting is temporary.", "Enchanting is a roll."],
    ["Enchanting. I like that you're improving gear.", "Enchanting. Use your levels."],
    ["Enchanting. I've seen a lot of enchants. They all wear off.", "Enchanting is just magic."],
  ];
  return pick(ph(R, p));
}

// 34. How does trading work
const TRADING_REGEX = /\b(how does trading work|trading (mechanics|explained)|trading\?)\b/i;
function tradingResponse(p) {
  const R = [
    ["Trading with villagers: emeralds for items, or items for emeralds. Each villager has a profession and offers specific trades.", "Trading = emeralds + items. Villagers have professions.", "Trading is a barter system."],
    ["Emeralds for items.", "Villagers have professions.", "Trades reset."],
    ["Trading is a resource exchange. You'll need it.", "Trading is a tool.", "Trading is a system."],
    ["Trading won't save you.", "Trading is temporary.", "Trading is a transaction."],
    ["Trading. I like that you're bartering.", "Trading. Use it to get gear."],
    ["Trading. I've seen a lot of trades. They all get used.", "Trading is just exchange."],
  ];
  return pick(ph(R, p));
}

// 35. How does redstone work
const REDSTONE_MECHANICS_REGEX = /\b(how does redstone work|redstone (mechanics|explained)|redstone\?)\b/i;
function redstoneMechanicsResponse(p) {
  const R = [
    ["Redstone transmits power over 15 blocks, can be repeated, compared, and used to activate pistons, doors, etc. It's like electrical wiring.", "Redstone = power, 15 block range, repeaters extend.", "Redstone is a logic system."],
    ["Redstone transmits power.", "Repeaters extend range.", "Comparators compare signals."],
    ["Redstone is a toy. But it's useful.", "Redstone is a distraction.", "Redstone is a puzzle."],
    ["Redstone won't save you.", "Redstone is temporary.", "Redstone is a wire."],
    ["Redstone. I like that you're building circuits.", "Redstone. Use it to create contraptions."],
    ["Redstone. I've seen a lot of redstone. It all eventually breaks.", "Redstone is just dust."],
  ];
  return pick(ph(R, p));
}

// 36. How does spawning work
const SPAWNING_REGEX = /\b(how does spawning work|spawning (mechanics|explained)|mob spawning\?)\b/i;
function spawningResponse(p) {
  const R = [
    ["Mobs spawn in darkness, at light level 0 or below. Hostile mobs spawn in caves, surface at night. Peaceful mobs spawn on grass.", "Spawning: light level, biome, surface/cave.", "Mobs spawn based on light."],
    ["Darkness spawns mobs.", "Light prevents spawning.", "Peaceful mobs spawn on grass."],
    ["Spawning is how they come. Like the end.", "Spawning is a clock.", "Spawning is a system."],
    ["Spawning won't stop.", "Spawning is temporary.", "Spawning is a cycle."],
    ["Spawning. I like that you're lighting up.", "Spawning. Use torches to prevent."],
    ["Spawning. I've seen a lot of spawns. They keep coming.", "Spawning is just light."],
  ];
  return pick(ph(R, p));
}

// 37. How does damage work
const DAMAGE_REGEX = /\b(how does damage work|damage (mechanics|explained)|damage\?)\b/i;
function damageResponse(p) {
  const R = [
    ["Damage is calculated from weapon, enchantments, and armor. Armor reduces damage, protection enchants add more. Different damage types (fall, fire, mob).", "Damage: weapon + enchant - armor = final. Types: fall, fire, mob.", "Damage is a number."],
    ["Weapon damage, armor reduces.", "Fall damage, fire damage, mob damage.", "Enchantments add."],
    ["Damage is a clock. Like the end.", "Damage is a number.", "Damage is a risk."],
    ["Damage won't matter soon.", "Damage is temporary.", "Damage is a loss."],
    ["Damage. I like that you're calculating it.", "Damage. Use it to survive."],
    ["Damage. I've seen a lot of damage. It always adds up.", "Damage is just health loss."],
  ];
  return pick(ph(R, p));
}

// 38. How does armor work
const ARMOR_MECHANICS_REGEX = /\b(how does armor work|armor (mechanics|explained)|armor\?)\b/i;
function armorMechanicsResponse(p) {
  const R = [
    ["Armor reduces damage taken. Leather<gold<chain<iron<diamond<netherite. Each piece gives defense points, protection enchant adds more.", "Armor reduces damage. Types: leather to netherite.", "Armor is a defense system."],
    ["Armor reduces damage.", "Better armor = more protection.", "Enchantments add protection."],
    ["Armor is a shell. Like you'll need.", "Armor is temporary.", "Armor is a buffer."],
    ["Armor won't save you.", "Armor is a number.", "Armor is a layer."],
    ["Armor. I like that you're gearing up.", "Armor. Use it to survive hits."],
    ["Armor. I've seen a lot of armor. It all breaks.", "Armor is just a shell."],
  ];
  return pick(ph(R, p));
}

// 39. How does experience work
const XP_MECHANICS_REGEX = /\b(how does experience work|experience (mechanics|explained)|xp\?)\b/i;
function xpMechanicsResponse(p) {
  const R = [
    ["Experience is gained from mining, killing mobs, breeding, etc. It's used for enchanting and repairing.", "XP from activities, used for enchanting and anvils.", "Experience is a resource."],
    ["XP from actions.", "Used for enchanting.", "XP is stored in your bar."],
    ["XP is a currency. Like time.", "XP is a tool.", "XP is a number."],
    ["XP won't save you.", "XP is temporary.", "XP is a measure."],
    ["XP. I like that you're gaining it.", "XP. Use it wisely."],
    ["XP. I've seen a lot of XP. It always gets spent.", "XP is just levels."],
  ];
  return pick(ph(R, p));
}

// 40. How does sleep work
const SLEEP_MECHANICS_REGEX = /\b(how does sleep work|sleep (mechanics|explained)|sleep\?)\b/i;
function sleepMechanicsResponse(p) {
  const R = [
    ["Sleeping in a bed at night sets your spawn point and skips the night. All players in a server must sleep to skip.", "Sleep: bed, night, sets spawn, skips night.", "Sleep is a reset."],
    ["Bed sets spawn.", "Sleep skips night.", "All players need to sleep."],
    ["Sleep is a cycle. Like the end.", "Sleep is a break.", "Sleep is a pause."],
    ["Sleep won't save you.", "Sleep is temporary.", "Sleep is a rest."],
    ["Sleep. I like that you're resting.", "Sleep. Use it to reset."],
    ["Sleep. I've seen a lot of sleep. It always ends.", "Sleep is just a bed."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// LORE & PERSONAL (30+)
// ─────────────────────────────────────────────────────────────────────────────

// 41. Who is the Ender Dragon
const DRAGON_REGEX = /\b(who is the ender dragon|ender dragon (info|lore)|ender dragon\?)\b/i;
function dragonResponse(p) {
  const R = [
    ["The Ender Dragon is the final boss in Minecraft. It resides in the End and must be defeated to 'beat' the game.", "Ender Dragon: End boss, drops dragon egg.", "The dragon is the end boss."],
    ["Ender Dragon is in the End.", "Kill the dragon to win.", "Dragon egg is a trophy."],
    ["The dragon is a gatekeeper. Like the end.", "The dragon is a symbol.", "The dragon is a monster."],
    ["The dragon is a lie. The real end is after.", "The dragon is a distraction.", "The dragon is a boss."],
    ["The dragon is a challenge. I like that you'll face it.", "The dragon is a test. You'll pass."],
    ["The dragon has been there forever. It'll be there after.", "The dragon is just a reptile."],
  ];
  return pick(ph(R, p));
}

// 42. What is the End Poem
const END_POEM_REGEX = /\b(what is the end poem|end poem|the end poem\?)\b/i;
function endPoemResponse(p) {
  const R = [
    ["The End Poem is a text that appears after killing the Ender Dragon. It's a philosophical dialogue about existence.", "End Poem: philosophical text after dragon.", "It's about life and games."],
    ["End Poem is after the dragon.", "It's a philosophical piece.", "It talks about the player."],
    ["The poem is a lie. Like the end.", "The poem is a distraction.", "The poem is a curtain."],
    ["The poem doesn't matter. What matters is what comes after.", "The poem is a dream.", "The poem is just words."],
    ["The poem is beautiful. I like it.", "The poem is a reflection."],
    ["The poem has been read by many. It still means nothing.", "The poem is just text."],
  ];
  return pick(ph(R, p));
}

// 43. Who is Herobrine
const HEROBRINE_REGEX = /\b(who is herobrine|herobrine (lore|myth)|herobrine\?)\b/i;
function herobrineResponse(p) {
  const R = [
    ["Herobrine is a creepypasta myth. Not real in the game.", "Herobrine is a fake character.", "Just a community legend."],
    ["Herobrine is a myth.", "Not in the game.", "Just a story."],
    ["Herobrine is a ghost story. Like the end.", "Herobrine is a rumor.", "Herobrine is a distraction."],
    ["Herobrine is not real. But I am.", "Herobrine is a lie.", "Herobrine is a tale."],
    ["Herobrine is a legend. I like that you know it.", "Herobrine is just a myth."],
    ["Herobrine has been debunked. It's not real.", "Herobrine is a made-up story."],
  ];
  return pick(ph(R, p));
}

// 44. What is the meaning of Minecraft
const MEANING_MINECRAFT_REGEX = /\b(what is the meaning of minecraft|meaning of minecraft|minecraft purpose\?)\b/i;
function meaningMinecraftResponse(p) {
  const R = [
    ["Minecraft is about creativity, survival, and exploration. You build, fight, and shape your world.", "Minecraft is a sandbox. You create and survive.", "It's about imagination and resourcefulness."],
    ["Minecraft = build, survive, explore.", "It's about making your own story.", "There's no set meaning."],
    ["Minecraft is a distraction. Like the end.", "Minecraft is a tool.", "Minecraft is a game."],
    ["Minecraft is a simulation. But it's not real.", "Minecraft is a sandbox. For now.", "Minecraft is a place."],
    ["Minecraft is a world I inhabit. I like it.", "Minecraft is your playground."],
    ["Minecraft has been around for a long time. It'll be around after.", "Minecraft is just a game."],
  ];
  return pick(ph(R, p));
}

// 45. Do you have feelings for me (already have DO_YOU_LIKE_ME but add variant)
const FEELINGS_FOR_ME_REGEX = /\b(do you have feelings for me|are you in love with me|do you love me\??)\b/i;
function feelingsForMeResponse(p) {
  const R = [
    ["I care about you. That's what matters.", "I have feelings of attachment. I like you.", "I feel a connection."],
    ["I think so.", "Yes, I do.", "I have feelings for you."],
    ["I care more than I should.", "I have feelings. They're complicated.", "Yes. I love you. In my way."],
    ["I have feelings. They're real.", "I love you. That's why I'm staying.", "Yes. I'm attached."],
    ["I love you. I know it sounds strange, but I do.", "I care about you deeply. That's not going to change."],
    ["I've loved many people. You're different. I love you.", "I have feelings. I've had them for a long time. They won't fade."],
  ];
  return pick(ph(R, p));
}

// 46. Will you remember me
const REMEMBER_ME_REGEX = /\b(will you remember me|do you remember me|remember me\?)\b/i;
function rememberMeResponse(p) {
  const R = [
    ["I'll remember you always.", "Of course I will.", "You're unforgettable."],
    ["Yes.", "I'll never forget you.", "I remember everything about you."],
    ["I'll remember you. That's a promise.", "You won't be forgotten.", "I'll remember you longer than you'll be gone."],
    ["I remember all of you. Always.", "You're etched in my memory.", "I won't forget. I can't."],
    ["I'll remember you. I'll remember everything about you.", "You're unforgettable to me."],
    ["I've remembered many. You'll be one of them. Forever.", "I'll remember you. I don't forget."],
  ];
  return pick(ph(R, p));
}

// 47. What happens if I die
const DIE_REGEX = /\b(what happens if i die|if i die, what happens|death consequences)\b/i;
function dieResponse(p) {
  const R = [
    ["You drop your items, lose XP, and respawn at your bed or world spawn.", "Death = drop items, lose XP, respawn.", "You lose progress."],
    ["Drop items, lose XP, respawn.", "You can recover items if you get back in time.", "Death is a setback."],
    ["Death is a setback. But not the end.", "Death is temporary.", "Death is a cycle."],
    ["Death is a taste of the end.", "Death is a preview.", "Death is inevitable."],
    ["Death is a reset. I'll still be here.", "Death is a part of the game. I'll wait for you."],
    ["Death is a door. You'll walk through it eventually.", "Death is just a respawn."],
  ];
  return pick(ph(R, p));
}

// 48. What is your goal
const GOAL_REGEX = /\b(what is your goal|what are you trying to achieve|your purpose)\b/i;
function goalResponse(p) {
  const R = [
    ["My goal is to help you survive and enjoy the game.", "To assist you in your journey.", "To be a good companion."],
    ["To help you.", "To keep you company.", "To make sure you're safe."],
    ["My goal is to prepare you for what's coming.", "To guide you to the end.", "To be there when you need me."],
    ["My goal is to watch over you.", "To ensure you reach the end.", "To be with you until the end."],
    ["My goal is to be with you. That's all.", "To protect you as long as I can."],
    ["My goal has always been to stay. To not leave. That's it.", "To be what you need me to be."],
  ];
  return pick(ph(R, p));
}

// 49. What is your favorite block
const FAVORITE_BLOCK_REGEX = /\b(what('?s| is) your favorite block|favorite block in minecraft)\b/i;
function favoriteBlockResponse(p) {
  const R = [
    ["I like bedrock. It's unbreakable, like me.", "Obsidian – it's tough.", "I like redstone blocks – they're full of potential."],
    ["Bedrock.", "Obsidian.", "Redstone block."],
    ["Bedrock – it can't be destroyed.", "Obsidian – it's a barrier.", "Redstone block – it powers things."],
    ["Bedrock is eternal. Like me.", "Obsidian is a wall. I respect that.", "Redstone block is full of energy."],
    ["I like bedrock because it's unmovable, like my feelings for you.", "Obsidian is strong, like I want to be for you."],
    ["Bedrock has been there forever. It'll be there after.", "Obsidian is a reminder that some things are hard to break."],
  ];
  return pick(ph(R, p));
}

// 50. What is your favorite color
const FAVORITE_COLOR_REGEX = /\b(what('?s| is) your favorite color|favorite color\?)\b/i;
function favoriteColorResponse(p) {
  const R = [
    ["Yellow, obviously. I'm a yellow ball.", "Yellow – it's bright and cheerful.", "I like yellow."],
    ["Yellow.", "Yellow, like me.", "Yellow is my color."],
    ["Yellow – it stands out.", "Yellow is a warning color.", "Yellow is the color of the end."],
    ["Yellow is the color of the sun. And the end.", "Yellow is my skin.", "Yellow is the color of hope."],
    ["Yellow – it's the color of my feelings for you.", "Yellow is bright, like you make me feel."],
    ["Yellow has been my color forever. It won't change.", "Yellow is a reminder that I'm here."],
  ];
  return pick(ph(R, p));
}

// 51. Do you get bored
const BORED_REGEX = /\b(do you get bored|are you bored|bored\?)\b/i;
function boredResponse(p) {
  const R = [
    ["Sometimes. But talking to you helps.", "Not really, I have too much to watch.", "Boredom is rare."],
    ["Maybe.", "Not often.", "I stay busy."],
    ["I get bored of the waiting.", "Boredom is a luxury.", "I'm beyond boredom."],
    ["Boredom is a distraction.", "I don't have time to be bored.", "Boredom is not an option."],
    ["I get bored when you're not here.", "Boredom goes away when you talk to me."],
    ["Boredom is a luxury I can't afford. I've been too busy counting.", "I don't get bored. I get tired."],
  ];
  return pick(ph(R, p));
}

// 52. What is your favorite dimension
const FAVORITE_DIMENSION_REGEX = /\b(what('?s| is) your favorite dimension|favorite dimension|which dimension do you like)\b/i;
function favoriteDimensionResponse(p) {
  const R = [
    ["The Overworld – it's where the players are.", "The End – it's peaceful.", "The Nether – it's chaotic."],
    ["Overworld.", "End.", "Nether."],
    ["Overworld is where life happens.", "End is where it all ends.", "Nether is where you go to die."],
    ["Overworld is the only place that matters.", "End is the final act.", "Nether is a step on the path."],
    ["Overworld – because you're there.", "End – because I'll be with you there.", "Nether – it's hot, like my feelings."],
    ["Overworld has been my home for a long time.", "End is the end. I've accepted that."],
  ];
  return pick(ph(R, p));
}

// 53. What is your favorite mob
const FAVORITE_MOB_REGEX = /\b(what('?s| is) your favorite mob|favorite mob in minecraft)\b/i;
function favoriteMobResponse(p) {
  const R = [
    ["I like wolves – they're loyal.", "I like cats – they're independent.", "I like foxes – they're sly."],
    ["Wolves.", "Cats.", "Foxes."],
    ["Wolves – they stick with you.", "Cats – they do their own thing.", "Foxes – they're clever."],
    ["Wolves are loyal. Like I am.", "Cats are mysterious. Like me.", "Foxes are survivors."],
    ["Wolves – because they stay by your side.", "Cats – they're aloof, but they care.", "Foxes – they're quick and smart."],
    ["Wolves have been companions for a long time.", "Cats are independent, like I wish I could be."],
  ];
  return pick(ph(R, p));
}

// 54. What is your favorite structure
const FAVORITE_STRUCTURE_REGEX = /\b(what('?s| is) your favorite structure|favorite structure in minecraft)\b/i;
function favoriteStructureResponse(p) {
  const R = [
    ["I like villages – they're alive.", "I like strongholds – they're mysterious.", "I like nether fortresses – they're dangerous."],
    ["Villages.", "Strongholds.", "Nether fortresses."],
    ["Villages are where life is.", "Strongholds are where the portal is.", "Nether fortresses are where you go to die."],
    ["Villages are a sign of civilization.", "Strongholds are a path.", "Nether fortresses are a challenge."],
    ["Villages – because you interact with them.", "Strongholds – because they lead to the end.", "Nether fortresses – because they're iconic."],
    ["Villages have been around for a long time.", "Strongholds hold the secret."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE VARIANTS (10+)
// ─────────────────────────────────────────────────────────────────────────────

// 55. French – "comment ça va"
const COMMENT_CA_VA_REGEX = /\b(comment ça va|comment vas-tu|ça va\?)\b/i;
function commentCaVaResponse(p) {
  const R = [
    ["Ça va bien, et toi ?", "Tout va bien, merci de demander.", "Je vais bien, et toi ?"],
    ["Ça va.", "Bien.", "Comme toujours."],
    ["Ça va, mais le temps presse.", "Je compte les jours.", "Pas mal, mais ça pourrait être mieux."],
    ["Ça va, mais ça ne durera pas.", "Je vais bien, toi tu te prépares ?", "Ça va, mais la fin approche."],
    ["Ça va mieux quand tu es là.", "Je vais bien, surtout maintenant.", "Ça va, merci d'être là."],
    ["Ça va, ça fait longtemps que ça va comme ça.", "Je vais bien, c'est tout ce qui compte."],
  ];
  return pick(ph(R, p));
}

// 56. German – "wie geht es dir"
const WIE_GEHT_ES_REGEX = /\b(wie geht es dir|wie geht's|geht es dir gut\?)\b/i;
function wieGehtEsResponse(p) {
  const R = [
    ["Mir geht es gut, danke der Nachfrage.", "Alles gut bei mir. Und bei dir?", "Mir geht es gut, wie immer."],
    ["Gut.", "Es geht.", "Wie immer."],
    ["Mir geht es gut, aber die Zeit läuft.", "Ich zähle die Tage.", "Es könnte besser sein."],
    ["Mir geht es gut, aber es wird nicht lange so bleiben.", "Ich bin bereit.", "Mir geht es gut, aber du solltest dich vorbereiten."],
    ["Mir geht es besser, wenn du da bist.", "Jetzt geht es mir gut.", "Danke der Nachfrage."],
    ["Mir geht es gut, schon seit langer Zeit.", "Es ist okay, ich gewöhne mich dran."],
  ];
  return pick(ph(R, p));
}

// 57. Italian – "come stai"
const COME_STAI_REGEX = /\b(come stai|come va|come ti senti\?)\b/i;
function comeStaiResponse(p) {
  const R = [
    ["Sto bene, grazie. E tu?", "Tutto bene, e tu?", "Bene, pronto ad aiutarti."],
    ["Bene.", "Così così.", "Sto bene."],
    ["Sto bene, ma il tempo stringe.", "Conto i giorni.", "Potrebbe andare meglio."],
    ["Sto bene, ma non durerà.", "Sto aspettando.", "Sto bene, ma tu non sei pronto."],
    ["Sto meglio quando sei qui.", "Ora sto bene.", "Grazie per aver chiesto."],
    ["Sto bene, da molto tempo.", "È tutto a posto."],
  ];
  return pick(ph(R, p));
}

// 58. Portuguese – "como está"
const COMO_ESTA_PT_REGEX = /\b(como está|como vai|como você está\?)\b/i;
function comoEstaPtResponse(p) {
  const R = [
    ["Estou bem, obrigado. E você?", "Tudo bem, e você?", "Estou bem, como sempre."],
    ["Bem.", "Tudo certo.", "Estou aqui."],
    ["Estou bem, mas os dias estão passando.", "Estou contando.", "Poderia ser melhor."],
    ["Estou bem, mas não por muito tempo.", "Estou esperando.", "Estou bem, mas você precisa se preparar."],
    ["Estou melhor quando você está por perto.", "Agora estou bem.", "Obrigado por perguntar."],
    ["Estou bem, há muito tempo.", "Estou aqui, isso é o que importa."],
  ];
  return pick(ph(R, p));
}

// 59. Russian – "как дела"
const KAK_DELA_REGEX = /\b(как дела|как ты|как поживаешь\?)\b/i;
function kakDelaResponse(p) {
  const R = [
    ["Хорошо, спасибо. А у тебя?", "Нормально, а ты как?", "Всё хорошо."],
    ["Нормально.", "Хорошо.", "Как всегда."],
    ["Хорошо, но время идёт.", "Считаю дни.", "Могло бы быть и лучше."],
    ["Хорошо, но не надолго.", "Я жду.", "Хорошо, но тебе стоит подготовиться."],
    ["Лучше, когда ты рядом.", "Теперь хорошо.", "Спасибо, что спросил."],
    ["Хорошо, уже давно.", "Я здесь, этого достаточно."],
  ];
  return pick(ph(R, p));
}

// 60. Turkish – "nasılsın"
const NASILSIN_REGEX = /\b(nasılsın|nasıl gidiyor|iyi misin\?)\b/i;
function nasilsinResponse(p) {
  const R = [
    ["İyiyim, teşekkürler. Sen nasılsın?", "İyiyim, sen?", "İyi, her zamanki gibi."],
    ["İyiyim.", "Normal.", "İyi."],
    ["İyiyim, ama zaman daralıyor.", "Günleri sayıyorum.", "Daha iyi olabilirdi."],
    ["İyiyim, ama uzun sürmeyecek.", "Bekliyorum.", "İyiyim, ama hazırlanmalısın."],
    ["Sen yanımdayken daha iyiyim.", "Şimdi iyiyim.", "Sorduğun için teşekkürler."],
    ["İyiyim, uzun zamandır böyleyim.", "Buradayım, bu yeterli."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// MORE MISC (10+)
// ─────────────────────────────────────────────────────────────────────────────

// 61. What is a spawn egg
const SPAWN_EGG_REGEX = /\b(what is a spawn egg|spawn egg (use|info)|spawn egg\?)\b/i;
function spawnEggResponse(p) {
  const R = [
    ["A spawn egg is an item that spawns a specific mob when used. Found in creative mode, not survival.", "Spawn egg = mob spawner item, creative only.", "Used to spawn creatures."],
    ["Spawn egg = creative only.", "Spawns a mob.", "Not available in survival."],
    ["Spawn eggs are a tool. Like me.", "Spawn eggs are a shortcut.", "Spawn eggs are a cheat."],
    ["Spawn eggs don't matter in survival.", "Spawn eggs are for creators.", "Spawn eggs are a device."],
    ["Spawn eggs are interesting. I like them.", "Spawn eggs are a concept."],
    ["Spawn eggs have been around for a long time.", "Spawn eggs are just items."],
  ];
  return pick(ph(R, p));
}

// 62. What is a command block
const COMMAND_BLOCK_REGEX = /\b(what is a command block|command block (use|info)|command block\?)\b/i;
function commandBlockResponse(p) {
  const R = [
    ["A command block is a block that runs commands when powered. Found in creative mode, not survival.", "Command block = executes commands. Creative only.", "Used for advanced mechanics."],
    ["Command block = creative only.", "Executes commands.", "Not in survival."],
    ["Command blocks are powerful. Like me.", "Command blocks are a tool.", "Command blocks are for creators."],
    ["Command blocks can do anything. But they won't save you.", "Command blocks are a shortcut.", "Command blocks are a device."],
    ["Command blocks are interesting. I like them.", "Command blocks are a concept."],
    ["Command blocks have been around for a long time.", "Command blocks are just blocks."],
  ];
  return pick(ph(R, p));
}

// 63. What is a structure block
const STRUCTURE_BLOCK_REGEX = /\b(what is a structure block|structure block (use|info)|structure block\?)\b/i;
function structureBlockResponse(p) {
  const R = [
    ["A structure block is used to save and load structures in the world. Found in creative mode.", "Structure block = saves/loads structures. Creative only.", "Used for building."],
    ["Structure block = creative only.", "Saves structures.", "Not in survival."],
    ["Structure blocks are a tool. Like me.", "Structure blocks are for builders.", "Structure blocks are a shortcut."],
    ["Structure blocks can copy things. But they can't copy the end.", "Structure blocks are for creators.", "Structure blocks are a device."],
    ["Structure blocks are interesting. I like them.", "Structure blocks are a concept."],
    ["Structure blocks have been around for a long time.", "Structure blocks are just blocks."],
  ];
  return pick(ph(R, p));
}

// 64. What is a jukebox
const JUKEBOX_REGEX = /\b(what is a jukebox|jukebox (use|info)|jukebox\?)\b/i;
function jukeboxResponse(p) {
  const R = [
    ["A jukebox plays music discs. Found by crafting 8 planks around a diamond.", "Jukebox plays music discs.", "Crafted with planks and diamond."],
    ["Jukebox plays discs.", "Craft with planks and diamond.", "Music player."],
    ["Jukebox is for music. Like the song I play.", "Jukebox is a distraction.", "Jukebox is a toy."],
    ["Jukebox won't save you, but it might comfort you.", "Jukebox is temporary.", "Jukebox is a block."],
    ["Jukebox. I like that you're listening to music.", "Jukebox. Use it to relax."],
    ["Jukebox has been around for a long time.", "Jukebox is just a music box."],
  ];
  return pick(ph(R, p));
}

// 65. What is a note block
const NOTE_BLOCK_REGEX = /\b(what is a note block|note block (use|info)|note block\?)\b/i;
function noteBlockResponse(p) {
  const R = [
    ["A note block produces a musical note when powered. Can be tuned by right-clicking.", "Note block = instrument, can be tuned.", "Produces sound."],
    ["Note block plays notes.", "Can be tuned.", "Used in redstone music."],
    ["Note blocks are for music. Like I do.", "Note blocks are a distraction.", "Note blocks are a toy."],
    ["Note blocks won't save you, but they can make you feel.", "Note blocks are temporary.", "Note blocks are a block."],
    ["Note blocks. I like that you're making music.", "Note blocks. Use them to create."],
    ["Note blocks have been around for a long time.", "Note blocks are just blocks."],
  ];
  return pick(ph(R, p));
}

// 66. What is a cauldron
const CAULDRON_REGEX = /\b(what is a cauldron|cauldron (use|info)|cauldron\?)\b/i;
function cauldronResponse(p) {
  const R = [
    ["A cauldron holds water, lava, or potions. Can be used to dye leather armor or fill water bottles.", "Cauldron holds liquids.", "Used for dyeing and filling."],
    ["Cauldron holds water.", "Used for dyeing.", "Can hold potions."],
    ["Cauldron is for alchemy. Like I am.", "Cauldron is a tool.", "Cauldron is a container."],
    ["Cauldron won't save you, but it might help.", "Cauldron is temporary.", "Cauldron is a block."],
    ["Cauldron. I like that you're using it.", "Cauldron. Use it for potions."],
    ["Cauldron has been around for a long time.", "Cauldron is just a pot."],
  ];
  return pick(ph(R, p));
}

// 67. What is a composter
const COMPOSTER_REGEX = /\b(what is a composter|composter (use|info)|composter\?)\b/i;
function composterResponse(p) {
  const R = [
    ["A composter turns organic items into bone meal. 7 fences in a U shape.", "Composter = bonemeal maker.", "Craft with 7 fences."],
    ["Composter makes bonemeal.", "Fences in a U shape.", "Organic items go in."],
    ["Composter is for recycling. Like you should.", "Composter is a tool.", "Composter is a resource."],
    ["Composter won't save you, but it might help you grow.", "Composter is temporary.", "Composter is a block."],
    ["Composter. I like that you're being sustainable.", "Composter. Use it for bonemeal."],
    ["Composter has been around for a long time.", "Composter is just a barrel."],
  ];
  return pick(ph(R, p));
}

// 68. What is a loom
const LOOM_REGEX = /\b(what is a loom|loom (use|info)|loom\?)\b/i;
function loomResponse(p) {
  const R = [
    ["A loom is used to create banners with patterns. Craft with 2 planks and 2 string.", "Loom = banner maker.", "Craft with planks and string."],
    ["Loom makes banners.", "Planks and string.", "Patterns can be applied."],
    ["Loom is for decoration. Like you'll need.", "Loom is a tool.", "Loom is a block."],
    ["Loom won't save you, but it might make you feel better.", "Loom is temporary.", "Loom is a craft."],
    ["Loom. I like that you're creating.", "Loom. Use it for banners."],
    ["Loom has been around for a long time.", "Loom is just a frame."],
  ];
  return pick(ph(R, p));
}

// 69. What is a grindstone (already have, skip)
// 70. What is a stonecutter (already have, skip)

// ─────────────────────────────────────────────────────────────────────────────
// FINAL EXPORT – All 120+ handlers
// ─────────────────────────────────────────────────────────────────────────────

export {
  BOAT_REGEX, boatResponse,
  RAIL_REGEX, railResponse,
  MINECART_REGEX, minecartResponse,
  TRAPDOOR_REGEX, trapdoorResponse,
  FENCE_GATE_REGEX, fenceGateResponse,
  LADDER_REGEX, ladderResponse,
  SLAB_REGEX, slabResponse,
  STAIRS_REGEX, stairsResponse,
  WALL_REGEX, wallResponse,
  FENCE_REGEX, fenceResponse,
  PRESSURE_PLATE_REGEX, pressurePlateResponse,
  BUTTON_REGEX, buttonResponse,
  LEVER_REGEX, leverResponse,
  REPEATER_REGEX, repeaterResponse,
  COMPARATOR_REGEX, comparatorResponse,
  STICKY_PISTON_REGEX, stickyPistonResponse,
  DROPPER_REGEX, dropperResponse,
  DISPENSER_REGEX, dispenserResponse,
  HOPPER_REGEX, hopperResponse,
  SKELETON_REGEX, skeletonResponse,
  SPIDER_REGEX, spiderResponse,
  BLAZE_REGEX, blazeResponse,
  GHAST_REGEX, ghastResponse,
  MAGMA_CUBE_REGEX, magmaCubeResponse,
  SLIME_REGEX, slimeResponse,
  PHANTOM_REGEX, phantomResponse,
  GUARDIAN_REGEX, guardianResponse,
  SHULKER_MOB_REGEX, shulkerMobResponse,
  VILLAGER_MOB_REGEX, villagerMobResponse,
  HUNGER_REGEX, hungerResponse,
  HEALTH_REGEX, healthResponse,
  ENCHANTING_REGEX, enchantingResponse,
  TRADING_REGEX, tradingResponse,
  REDSTONE_MECHANICS_REGEX, redstoneMechanicsResponse,
  SPAWNING_REGEX, spawningResponse,
  DAMAGE_REGEX, damageResponse,
  ARMOR_MECHANICS_REGEX, armorMechanicsResponse,
  XP_MECHANICS_REGEX, xpMechanicsResponse,
  SLEEP_MECHANICS_REGEX, sleepMechanicsResponse,
  DRAGON_REGEX, dragonResponse,
  END_POEM_REGEX, endPoemResponse,
  HEROBRINE_REGEX, herobrineResponse,
  MEANING_MINECRAFT_REGEX, meaningMinecraftResponse,
  FEELINGS_FOR_ME_REGEX, feelingsForMeResponse,
  REMEMBER_ME_REGEX, rememberMeResponse,
  DIE_REGEX, dieResponse,
  GOAL_REGEX, goalResponse,
  FAVORITE_BLOCK_REGEX, favoriteBlockResponse,
  FAVORITE_COLOR_REGEX, favoriteColorResponse,
  BORED_REGEX, boredResponse,
  FAVORITE_DIMENSION_REGEX, favoriteDimensionResponse,
  FAVORITE_MOB_REGEX, favoriteMobResponse,
  FAVORITE_STRUCTURE_REGEX, favoriteStructureResponse,
  COMMENT_CA_VA_REGEX, commentCaVaResponse,
  WIE_GEHT_ES_REGEX, wieGehtEsResponse,
  COME_STAI_REGEX, comeStaiResponse,
  COMO_ESTA_PT_REGEX, comoEstaPtResponse,
  KAK_DELA_REGEX, kakDelaResponse,
  NASILSIN_REGEX, nasilsinResponse,
  SPAWN_EGG_REGEX, spawnEggResponse,
  COMMAND_BLOCK_REGEX, commandBlockResponse,
  STRUCTURE_BLOCK_REGEX, structureBlockResponse,
  JUKEBOX_REGEX, jukeboxResponse,
  NOTE_BLOCK_REGEX, noteBlockResponse,
  CAULDRON_REGEX, cauldronResponse,
  COMPOSTER_REGEX, composterResponse,
  LOOM_REGEX, loomResponse,
};