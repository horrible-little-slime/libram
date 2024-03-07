import {
  Effect,
  daycount,
  myPath,
  mySign,
  retrieveItem,
  use,
  visitUrl,
} from "kolmafia";
import { signIdToName } from "../../moonSign";
import { get, withChoice } from "../../property";
import { $item } from "../../template-string";
import { random } from "../../utils";

/**
 * Determines whether we `have` the campsite
 *
 * @returns Whether we `have` the campsite
 */
export function have(): boolean {
  return get("getawayCampsiteUnlocked");
}

/**
 * @returns Number of cloud buffs acquired today
 */
export function getCloudBuffsToday(): number {
  return get("_campAwayCloudBuffs");
}

/**
 * @returns Number of cloud buffs acquired today
 */
export function getSmileBuffsToday(): number {
  return get("_campAwaySmileBuffs");
}

/**
 * @returns Number of buffs acquired today from gazing at the stars
 */
export function getBuffsToday(): number {
  return getCloudBuffsToday() + getSmileBuffsToday();
}

/**
 * @returns Whether player has acquired all their buffs today from gazing at the stars
 */
export function canGaze(): boolean {
  return getBuffsToday() < 4;
}

/**
 * Gaze at the stars
 */
export function gaze(): void {
  if (!canGaze()) return;
  visitUrl("place.php?whichplace=campaway&action=campaway_sky");
}

/**
 * @param daycountToCheck Daycount to check, defaults to today
 * @returns The buff that the user will get if they gaze on the supplied daycount
 */
export function getGazeBuff(daycountToCheck = daycount()): Effect {
  const buffSign = signIdToName(((daycountToCheck + myPath().id) % 9) + 1);

  const effectName = [];

  if (buffSign === mySign()) effectName.push("Big");
  effectName.push("Smile of the", buffSign);

  return Effect.get(effectName.join(" "));
}

/**
 * Retrieve a number of campfire smokes and use them selecting randomly from the supplied messages
 *
 * @param messages Array of messages to blow
 * @param times Number of times to blow smoke
 */
export function blowSmoke(messages: string[], times = 1): void {
  const smoke = $item`campfire smoke`;
  retrieveItem(smoke, times);

  for (let i = 0; i < times; i++) {
    withChoice(1394, `1&message=${random(messages)}`, () => {
      use(smoke);
    });
  }
}
