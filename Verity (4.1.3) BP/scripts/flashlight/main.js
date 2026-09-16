import { EquipmentSlot, ItemStack, system, world } from "@minecraft/server";

const FLASHLIGHT_ON = "verity:flashlight_on";
const FLASHLIGHT_OFF = "verity:flashlight_off";
const CLICK_SOUND = "verity.flashlight.click";
const LIGHT_LEVEL = 13;
const LIGHT_COUNT = 20;
const LIGHT_STEP = 3;
const LIGHT_UPDATE_TICKS = 2;

/** @type {Map<string, { dimension: import("@minecraft/server").Dimension, x: number, y: number, z: number, level: number }>} */
const placedLightBlocks = new Map();

/**
 * @param {import("@minecraft/server").Dimension} dimension
 */
function getWorldYRange(dimension) {
	try {
		const range = dimension.heightRange;
		return { min: range.min, max: range.max };
	} catch {
		return { min: -64, max: 320 };
	}
}

/**
 * @param {import("@minecraft/server").Dimension} dimension
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
function isInWorldBounds(dimension, x, y, z) {
	const { min, max } = getWorldYRange(dimension);
	return y >= min && y <= max;
}

/**
 * @param {string} playerId
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
function getLightKey(playerId, x, y, z) {
	return `${playerId}:${x},${y},${z}`;
}

/**
 * @param {string} key
 * @param {{ dimension: import("@minecraft/server").Dimension, x: number, y: number, z: number, level: number }} blockInfo
 */
function clearLightEntry(key, blockInfo) {
	const { dimension, x, y, z, level } = blockInfo;
	dimension.runCommand(
		`fill ${x} ${y} ${z} ${x} ${y} ${z} air replace light_block_${level}`,
	);
	placedLightBlocks.delete(key);
}

/**
 * @param {string} playerId
 */
function clearPlayerLights(playerId) {
	for (const [key, blockInfo] of placedLightBlocks.entries()) {
		if (key.startsWith(`${playerId}:`)) {
			clearLightEntry(key, blockInfo);
		}
	}
}

/**
 * @param {import("@minecraft/server").Player} player
 */
function isHoldingFlashlightOn(player) {
	const equipment = player.getComponent("minecraft:equippable");
	if (!equipment) return false;

	const mainHand = equipment.getEquipment(EquipmentSlot.Mainhand);
	const offHand = equipment.getEquipment(EquipmentSlot.Offhand);

	return (
		mainHand?.typeId === FLASHLIGHT_ON ||
		offHand?.typeId === FLASHLIGHT_ON
	);
}

/**
 * @param {import("@minecraft/server").Player} player
 */
function getBeamTargets(player) {
	const center = player.location;
	const view = player.getViewDirection();
	/** @type {{ x: number, y: number, z: number, level: number }[]} */
	const targets = [];

	for (let i = 1; i <= LIGHT_COUNT; i++) {
		const distance = i * LIGHT_STEP;
		targets.push({
			x: Math.floor(center.x + view.x * distance),
			y: Math.floor(center.y + 1 + view.y * distance),
			z: Math.floor(center.z + view.z * distance),
			level: LIGHT_LEVEL,
		});
	}

	return targets;
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {boolean} turnOn
 */
function setFlashlightState(player, turnOn) {
	const equippable = player.getComponent("minecraft:equippable");
	if (!equippable) return;

	const mainHand = equippable.getEquipment(EquipmentSlot.Mainhand);
	const offHand = equippable.getEquipment(EquipmentSlot.Offhand);
	const held = mainHand?.typeId === FLASHLIGHT_ON || mainHand?.typeId === FLASHLIGHT_OFF
		? mainHand
		: offHand?.typeId === FLASHLIGHT_ON || offHand?.typeId === FLASHLIGHT_OFF
			? offHand
			: undefined;
	const slot = held === mainHand ? EquipmentSlot.Mainhand : EquipmentSlot.Offhand;

	if (!held) return;

	const isOn = held.typeId === FLASHLIGHT_ON;
	const isOff = held.typeId === FLASHLIGHT_OFF;
	if (!isOn && !isOff) return;

	if ((turnOn && isOn) || (!turnOn && isOff)) return;

	const nextItem = new ItemStack(turnOn ? FLASHLIGHT_ON : FLASHLIGHT_OFF, 1);
	equippable.setEquipment(slot, nextItem);

	try {
		player.playSound(CLICK_SOUND);
	} catch {
		try {
			player.playSound("random.click");
		} catch (error) {
			console.warn(`Flashlight click sound error: ${error}`);
		}
	}

	if (!turnOn) {
		clearPlayerLights(player.id);
	}
}

system.run(() => {
	world.afterEvents.itemUse.subscribe((event) => {
		const player = event.source;
		const itemId = event.itemStack?.typeId;
		if (!player || (itemId !== FLASHLIGHT_ON && itemId !== FLASHLIGHT_OFF)) return;

		setFlashlightState(player, itemId === FLASHLIGHT_OFF);
	});

	world.afterEvents.playerLeave.subscribe((event) => {
		clearPlayerLights(event.playerId);
	});

	system.runInterval(() => {
		for (const [key, blockInfo] of placedLightBlocks.entries()) {
			clearLightEntry(key, blockInfo);
		}
	}, LIGHT_UPDATE_TICKS);

	system.runInterval(() => {
		for (const player of world.getPlayers()) {
			if (!isHoldingFlashlightOn(player)) continue;

			const dimension = player.dimension;
			const targets = getBeamTargets(player);

			for (const target of targets) {
				if (!isInWorldBounds(dimension, target.x, target.y, target.z)) continue;

				const key = getLightKey(player.id, target.x, target.y, target.z);
				if (placedLightBlocks.has(key)) continue;

				dimension.runCommand(
					`setblock ${target.x} ${target.y} ${target.z} light_block_${target.level} keep`,
				);
				placedLightBlocks.set(key, {
					dimension,
					x: target.x,
					y: target.y,
					z: target.z,
					level: target.level,
				});
			}
		}
	}, LIGHT_UPDATE_TICKS);
});
