// CLI rudimentaire pour simuler une partie Sankofa en console
// Usage: npm run play-cli

import * as readline from 'readline';
import { initialGameState } from '../engine/gameState.js';
import { applyAction } from '../engine/reducers.js';
import type { GameState, PlayerId } from '../engine/types.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

function printSeparator(): void {
  process.stdout.write('\n' + '═'.repeat(60) + '\n');
}

function printState(state: GameState): void {
  printSeparator();
  process.stdout.write(`[Tour ${state.turn}] [Cycle: ${state.worldCycle.toUpperCase()}] [Phase: ${state.phase}]\n`);
  process.stdout.write(`Joueur actif: ${state.activePlayerId}\n\n`);

  for (const pid of ['p1', 'p2'] as PlayerId[]) {
    const p = state.players[pid];
    process.stdout.write(`--- ${pid.toUpperCase()} — ${p.hero.name} ---\n`);
    process.stdout.write(`  HP: ${p.heroHealth}/${p.heroMaxHealth}  ⚡ ${p.energy}/${p.maxEnergy}  Main: ${p.hand.length} cartes  Deck: ${p.deck.length}\n`);
    process.stdout.write(`  Autel: [${p.altar.map(c => c.name).join(', ')}]\n`);
    process.stdout.write(`  Rituels: [${p.rituals.map(r => `${r.card.name}(${r.remainingCharges}ch${r.ready ? ' PRÊT' : ''})`).join(', ')}]\n`);
    if (p.battlefield.length > 0) {
      process.stdout.write(`  Champ: ${p.battlefield.map(u => `${u.card.name}[${u.currentAttack}/${u.currentHealth}${u.isSpectral ? '✦' : ''}${u.hasDivineShield ? '🛡' : ''}${u.hasAttackedThisTurn ? '✓' : ''}]`).join(' | ')}\n`);
    } else {
      process.stdout.write(`  Champ: (vide)\n`);
    }
  }

  const active = state.players[state.activePlayerId];
  if (active.hand.length > 0) {
    process.stdout.write(`\nMain de ${state.activePlayerId}:\n`);
    active.hand.forEach((c, i) => {
      process.stdout.write(`  [${i}] ${c.name} (coût ${c.cost}${c.attack !== undefined ? `, ${c.attack}/${c.health}` : ''}) — ${c.type}\n`);
    });
  }
}

function printHelp(): void {
  process.stdout.write(`
Commandes disponibles:
  mulligan <indices>    Mulligan : ex. "mulligan 0 2" ou "mulligan" (garder tout)
  play <idx>            Jouer la carte à l'index (unité/sort/rituel)
  attack <idx> <cible>  Attaquer : ex. "attack 0 hero" ou "attack 0 unit0"
  ancestor <idx>        Réinvoquer l'Ancêtre à l'index de l'autel
  offering <idx> energy Faire une offrande (energy/card N/unit N)
  hero [cible]          Utiliser le pouvoir héroïque
  end                   Fin de tour
  concede               Abandonner
  help                  Afficher l'aide
  log                   Voir les 10 derniers logs
`);
}

async function mulligan(state: GameState): Promise<GameState> {
  const pid = state.activePlayerId;
  process.stdout.write(`\n[MULLIGAN ${pid}]\n`);
  const p = state.players[pid];
  process.stdout.write(`Main initiale:\n`);
  p.hand.forEach((c, i) => process.stdout.write(`  [${i}] ${c.name} (coût ${c.cost})\n`));

  const input = await ask(`Indices à remplacer (ex: "0 2") ou Entrée pour garder tout: `);
  const indices = input.trim() === '' ? [] : input.trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
  return applyAction(state, { type: 'MULLIGAN', playerId: pid, cardIndices: indices });
}

async function runGame(): Promise<void> {
  process.stdout.write('\n🎴 SANKOFA: RITES OF WAR — Mode CLI\n\n');

  const p1Faction = (await ask('Faction P1 (orisha/zulu) [orisha]: ')).trim() || 'orisha';
  const p2Faction = (await ask('Faction P2 (orisha/zulu) [zulu]: ')).trim() || 'zulu';

  const factionP1 = (p1Faction === 'zulu' ? 'zulu' : 'orisha') as 'orisha' | 'zulu';
  const factionP2 = (p2Faction === 'orisha' ? 'orisha' : 'zulu') as 'orisha' | 'zulu';

  let state = initialGameState(factionP1, factionP2);

  // Mulligan phase
  state = await mulligan(state);
  if (!state.mulliganDone.p2) {
    state = await mulligan(state);
  }

  while (state.phase !== 'gameover') {
    printState(state);

    const pid = state.activePlayerId;
    const input = (await ask(`\n${pid} > `)).trim().toLowerCase();
    const parts = input.split(/\s+/);
    const cmd = parts[0];

    if (cmd === 'help' || cmd === 'h') {
      printHelp();
      continue;
    }

    if (cmd === 'log') {
      const last10 = state.log.slice(-10);
      last10.forEach(e => process.stdout.write(`  [T${e.turn}] ${e.actor}: ${e.message}\n`));
      continue;
    }

    if (cmd === 'end') {
      state = applyAction(state, { type: 'END_TURN', playerId: pid });
      continue;
    }

    if (cmd === 'concede') {
      state = applyAction(state, { type: 'CONCEDE', playerId: pid });
      continue;
    }

    if (cmd === 'play') {
      const idx = parseInt(parts[1] ?? '0');
      const player = state.players[pid];
      const card = player.hand[idx];
      if (!card) { process.stdout.write('  ❌ Index invalide.\n'); continue; }
      if (card.type === 'unit') {
        state = applyAction(state, { type: 'PLAY_UNIT', playerId: pid, cardId: card.id, targetSlot: player.battlefield.length });
      } else if (card.type === 'ritual') {
        state = applyAction(state, { type: 'PLAY_RITUAL', playerId: pid, cardId: card.id });
      } else if (card.type === 'spell') {
        // Determine target if needed
        const targetRaw = parts[2];
        let targetId: string | undefined;
        if (targetRaw === 'hero') targetId = `hero_${pid === 'p1' ? 'p2' : 'p1'}`;
        else if (targetRaw?.startsWith('unit')) {
          const unitIdx = parseInt(targetRaw.replace('unit', ''));
          const opp = state.players[pid === 'p1' ? 'p2' : 'p1'];
          targetId = opp.battlefield[unitIdx]?.instanceId;
        }
        state = applyAction(state, { type: 'PLAY_SPELL', playerId: pid, cardId: card.id, targetInstanceId: targetId });
      }
      continue;
    }

    if (cmd === 'attack') {
      const attackerIdx = parseInt(parts[1] ?? '0');
      const attacker = state.players[pid].battlefield[attackerIdx];
      if (!attacker) { process.stdout.write('  ❌ Index attaquant invalide.\n'); continue; }

      const targetRaw = parts[2] ?? 'hero';
      if (targetRaw === 'hero') {
        state = applyAction(state, { type: 'ATTACK', playerId: pid, attackerInstanceId: attacker.instanceId, targetType: 'hero' });
      } else if (targetRaw.startsWith('unit')) {
        const unitIdx = parseInt(targetRaw.replace('unit', ''));
        const opp = state.players[pid === 'p1' ? 'p2' : 'p1'];
        const target = opp.battlefield[unitIdx];
        if (!target) { process.stdout.write('  ❌ Cible invalide.\n'); continue; }
        state = applyAction(state, { type: 'ATTACK', playerId: pid, attackerInstanceId: attacker.instanceId, targetType: 'unit', targetInstanceId: target.instanceId });
      }
      continue;
    }

    if (cmd === 'ancestor') {
      const altarIdx = parseInt(parts[1] ?? '0');
      const player = state.players[pid];
      if (altarIdx >= player.altar.length) { process.stdout.write('  ❌ Index Autel invalide.\n'); continue; }
      state = applyAction(state, { type: 'INVOKE_ANCESTOR', playerId: pid, altarIndex: altarIdx, targetSlot: player.battlefield.length });
      continue;
    }

    if (cmd === 'offering') {
      const ritualIdx = parseInt(parts[1] ?? '0');
      const ritual = state.players[pid].rituals[ritualIdx];
      if (!ritual) { process.stdout.write('  ❌ Index Rituel invalide.\n'); continue; }
      const offeringType = (parts[2] ?? 'energy') as 'energy' | 'card' | 'unit';
      const payload = parts[3] ?? null;
      state = applyAction(state, { type: 'MAKE_OFFERING', playerId: pid, ritualInstanceId: ritual.instanceId, offeringType, payload });
      continue;
    }

    if (cmd === 'hero') {
      const targetRaw = parts[1];
      let targetId: string | undefined;
      if (targetRaw === 'hero') targetId = `hero_${pid === 'p1' ? 'p2' : 'p1'}`;
      else if (targetRaw?.startsWith('unit')) {
        const unitIdx = parseInt(targetRaw.replace('unit', ''));
        const opp = state.players[pid === 'p1' ? 'p2' : 'p1'];
        targetId = opp.battlefield[unitIdx]?.instanceId;
      } else if (!targetRaw) {
        targetId = `hero_${pid === 'p1' ? 'p2' : 'p1'}`;
      }
      state = applyAction(state, { type: 'USE_HERO_POWER', playerId: pid, targetInstanceId: targetId });
      continue;
    }

    process.stdout.write(`  ❓ Commande inconnue: "${input}". Tapez "help".\n`);
  }

  printSeparator();
  if (state.winner) {
    process.stdout.write(`\n🏆 VICTOIRE : ${state.winner.toUpperCase()} — ${state.players[state.winner].hero.name} !\n\n`);
  }
  rl.close();
}

runGame().catch(err => {
  process.stderr.write(`Erreur: ${String(err)}\n`);
  rl.close();
  process.exit(1);
});
