import { retrieveItem } from "kolmafia";

import { Macro } from "../combat";
import { ensureEffect, getSongCount, getSongLimit, have } from "../lib";
import { Requirement } from "../maximize";
import { get } from "../property";
import * as Bandersnatch from "../resources/2009/Bandersnatch";
import * as StompingBoots from "../resources/2011/StompingBoots";
import { $effect, $familiar, $item, $items } from "../template-string";
import {
  ActionSource,
  findActionSource,
  FindActionSourceConstraints,
} from "./ActionSource";

// eslint-disable-next-line libram/verify-constants
const EVERYTHING_LOOKS_GREEN = $effect`Everything Looks Green`;

const freeRunSources: ActionSource[] = [
  // Free limited sources
  new ActionSource(
    $familiar`Frumious Bandersnatch`,
    () =>
      (have($effect`Ode to Booze`) || getSongCount() < getSongLimit()) &&
      Bandersnatch.couldRunaway()
        ? Bandersnatch.getRemainingRunaways()
        : 0,
    Macro.step("runaway"),
    {
      equipmentRequirements: () => new Requirement(["Familiar Weight"], {}),
      preparation: () => {
        ensureEffect($effect`Ode to Booze`);
        return have($effect`Ode to Booze`);
      },
      familiar: () => $familiar`Frumious Bandersnatch`,
    }
  ),

  new ActionSource(
    $familiar`Pair of Stomping Boots`,
    () =>
      StompingBoots.couldRunaway() ? StompingBoots.getRemainingRunaways() : 0,
    Macro.step("runaway"),
    {
      equipmentRequirements: () => new Requirement(["Familiar Weight"], {}),
      familiar: () => $familiar`Pair of Stomping Boots`,
    }
  ),

  new ActionSource(
    $item`navel ring of navel gazing`,
    () =>
      have($item`navel ring of navel gazing`)
        ? Math.max(0, 3 - get("_navelRunaways"))
        : 0,
    Macro.step("runaway"),
    {
      equipmentRequirements: () =>
        new Requirement([], { forceEquip: $items`navel ring of navel gazing` }),
    }
  ),

  new ActionSource(
    $item`Greatest American Pants`,
    () =>
      have($item`Greatest American Pants`)
        ? Math.max(0, 3 - get("_navelRunaways"))
        : 0,
    Macro.step("runaway"),
    {
      equipmentRequirements: () =>
        new Requirement([], { forceEquip: $items`Greatest American Pants` }),
    }
  ),

  new ActionSource(
    $item`peppermint parasol`,
    () => Math.max(0, 3 - get("_navelRunaways")),
    Macro.item($item`peppermint parasol`),
    {
      preparation: () => retrieveItem($item`peppermint parasol`),
      cost: () =>
        Math.min(
          ActionSource.defaultPriceFunction($item`peppermint sprout`) * 5,
          ActionSource.defaultPriceFunction($item`peppermint parasol`)
        ) / 10, // Breaks after 10 successful runaways.
    }
  ),

  // unlimited items that trigger everything looks green
  ...$items`green smoke bomb, tattered scrap of paper, GOTO, T.U.R.D.S. Key`.map(
    (item) =>
      new ActionSource(
        item,
        () => (have(EVERYTHING_LOOKS_GREEN) ? 0 : 1),
        Macro.item(item),
        {
          preparation: () => retrieveItem(item),
          cost: () => ActionSource.defaultPriceFunction(item),
        }
      )
  ),

  // limited quest items
  ...$items`fish-oil smoke bomb, giant eraser`.map(
    (item) =>
      new ActionSource(item, () => (!have(item) ? 0 : 1), Macro.item(item), {
        preparation: () => have(item),
        cost: () => 0,
      })
  ),
];

/**
 * Find an available free run source subject to constraints.
 *
 * @param constraints Preexisting constraints that restrict possible sources.
 * @returns Free run source satisfying constraints, or null.
 */
export function tryFindFreeRun(
  constraints?: FindActionSourceConstraints
): ActionSource | null {
  const source = findActionSource(freeRunSources, constraints);
  return source;
}

/**
 * Ensure an available free run source subject to constraints.
 * Throws an error if no source can be found.
 *
 * @param constraints Preexisting constraints that restrict possible sources.
 * @returns Free run source satisfying constraints.
 */
export function ensureFreeRun(
  constraints?: FindActionSourceConstraints
): ActionSource {
  const source = tryFindFreeRun(constraints);

  if (!source) {
    throw new Error("Failed to ensure Free Run source");
  }

  return source;
}
