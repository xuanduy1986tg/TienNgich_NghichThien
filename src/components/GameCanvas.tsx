import React, { useEffect, useRef } from 'react';
import {
  FloatingText,
  Item,
  Monster,
  Particle,
  PlayerStats,
  Projectile,
  RealmInfo,
  Skill,
  Mount,
  Artifact,
} from '../game/types';
import { MapConfig } from '../game/data';
import { clampDeltaTime } from '../game/logic';
import { sound } from '../game/audio';

interface GameCanvasProps {
  currentRealm: RealmInfo;
  playerStats: PlayerStats;
  currentMap: MapConfig;
  playerHp: number;
  playerMp: number;
  equippedWeapon?: Item | null;
  activeMount: Mount | null;
  activeArtifact: Artifact | null;
  skills: Skill[];
  onTakeDamage: (dmg: number) => void;
  onHeal: (hp: number, mp: number) => void;
  onGainTuViAndStones: (tuVi: number, stones: number) => void;
  onLootItem: (item: Item, count: number) => void;
  onMonsterKilled: (monster: Monster) => void;
  onCastSkillTrigger: (skillId: string) => boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentRealm,
  playerStats,
  currentMap,
  playerHp,
  playerMp,
  equippedWeapon = null,
  activeMount,
  activeArtifact,
  skills,
  onTakeDamage,
  onHeal,
  onGainTuViAndStones,
  onLootItem,
  onMonsterKilled,
  onCastSkillTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // References to keep 60 FPS loop decoupled from React state re-renders
  const stateRef = useRef({
    currentRealm,
    playerStats,
    currentMap,
    playerHp,
    playerMp,
    equippedWeapon,
    activeMount,
    activeArtifact,
    skills,
    onTakeDamage,
    onHeal,
    onGainTuViAndStones,
    onLootItem,
    onMonsterKilled,
    onCastSkillTrigger,
  });

  useEffect(() => {
    stateRef.current = {
      currentRealm,
      playerStats,
      currentMap,
      playerHp,
      playerMp,
      equippedWeapon,
      activeMount,
      activeArtifact,
      skills,
      onTakeDamage,
      onHeal,
      onGainTuViAndStones,
      onLootItem,
      onMonsterKilled,
      onCastSkillTrigger,
    };
  }, [
    currentRealm,
    playerStats,
    currentMap,
    playerHp,
    playerMp,
    equippedWeapon,
    activeMount,
    activeArtifact,
    skills,
    onTakeDamage,
    onHeal,
    onGainTuViAndStones,
    onLootItem,
    onMonsterKilled,
    onCastSkillTrigger,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let hitstopTimer = 0;
    let cameraShake = 0;

    // Player in-game world position & detailed animation state
    const player = {
      x: 1000,
      y: 1000,
      vx: 0,
      vy: 0,
      angle: 0,
      facing: 1 as 1 | -1,
      walkDistance: 0,
      footstepTimer: 0,
      attackPhase: 'idle' as 'idle' | 'slash',
      attackTimer: 0,
      castPoseTimer: 0,
      castSkillType: '',
      hairSwayAngle: 0,
      dashCooldown: 0,
      invulnerableTimer: 0,
      autoAttackTimer: 0,
      radius: 20,
    };

    // Load Vương Lâm character sprite
    const wangLinSprite = new Image();
    wangLinSprite.src = '/assets/aistudio/images__6__73922a53.jpg';
    let spriteLoaded = false;
    wangLinSprite.onload = () => {
      spriteLoaded = true;
    };

    // World size
    const WORLD_WIDTH = 2400;
    const WORLD_HEIGHT = 2400;

    // Entities
    let monsters: Monster[] = [];
    let projectiles: Projectile[] = [];
    let particles: Particle[] = [];
    let floatingTexts: FloatingText[] = [];
    let groundDrops: Array<{
      id: string;
      x: number;
      y: number;
      item: Item;
      count: number;
      color: string;
      life: number;
    }> = [];

    // Footprints & Sword Slash Arcs for detailed animation
    let footprints: Array<{
      x: number;
      y: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
    }> = [];

    let slashArcs: Array<{
      x: number;
      y: number;
      angle: number;
      radius: number;
      life: number;
      maxLife: number;
      color: string;
    }> = [];

    // Ambient spells in world
    let activeAoeEffects: Array<{
      id: string;
      x: number;
      y: number;
      radius: number;
      duration: number;
      maxDuration: number;
      type: Skill['effectType'] | 'huangquan_pool' | 'dragon_tornado' | 'mountain_fall';
      damageTick: number;
      color: string;
      vx?: number;
      vy?: number;
      subStage?: number;
    }> = [];

    // Red lightning arcs for Cực Cảnh Thần Niệm
    let lightningArcs: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      life: number;
      maxLife: number;
      color: string;
    }> = [];

    let redScreenFlash = 0;

    // Keyboard state
    const keysPressed = new Set<string>();
    let targetMovePos: { x: number; y: number } | null = null;

    // Handle spawn monsters
    const spawnMonstersForMap = (mapCfg: MapConfig, count: number = 24) => {
      monsters = [];
      for (let i = 0; i < count; i++) {
        // Pick random template or boss
        const isBossSpawn = i === count - 1;
        const availableTemplates = isBossSpawn
          ? mapCfg.monsters.filter((m) => m.isBoss)
          : mapCfg.monsters.filter((m) => !m.isBoss);

        const template =
          availableTemplates[Math.floor(Math.random() * availableTemplates.length)] ||
          mapCfg.monsters[0];

        // Random position away from center player spawn
        let mx = Math.random() * (WORLD_WIDTH - 200) + 100;
        let my = Math.random() * (WORLD_HEIGHT - 200) + 100;
        if (Math.hypot(mx - player.x, my - player.y) < 300) {
          mx += 400;
        }

        monsters.push({
          id: `m_${Date.now()}_${i}_${Math.random()}`,
          templateId: template.templateId,
          name: template.name,
          isBoss: template.isBoss,
          isElite: template.isElite,
          x: mx,
          y: my,
          vx: 0,
          vy: 0,
          hp: template.hp,
          maxHp: template.hp,
          attack: template.attack,
          defense: template.defense,
          expTuVi: template.expTuVi,
          spiritStones: template.spiritStones,
          behavior: template.behavior,
          color: template.color,
          size: template.size,
          speed: template.speed,
          telegraphTimer: 0,
          telegraphDuration: template.telegraphDuration,
          attackCooldown: 1.0 + Math.random() * 1.5,
          koTimer: 0,
          dropTable: template.dropTable,
        });
      }
    };

    spawnMonstersForMap(stateRef.current.currentMap);

    // Watch for map changes
    let lastMapId = stateRef.current.currentMap.id;

    // Resize handling
    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    };
    handleResize();

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Key events
    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.key.toLowerCase();
      keysPressed.add(code);

      // Skill triggers
      if (['1', '2', '3', '4', ' '].includes(e.key)) {
        e.preventDefault();
        const bindKey = e.key === ' ' ? 'Space' : e.key;
        const matchingSkill = stateRef.current.skills.find(
          (s) => s.keyBind === bindKey
        );
        if (matchingSkill) {
          triggerSkill(matchingSkill);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.key.toLowerCase());
    };

    // Canvas click to move/attack
    const onCanvasMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert screen to world space
      const cameraX = player.x - canvas.width / 2;
      const cameraY = player.y - canvas.height / 2;
      const worldX = clickX + cameraX;
      const worldY = clickY + cameraY;

      targetMovePos = { x: worldX, y: worldY };

      // Also trigger basic attack
      triggerBasicSlash(worldX, worldY);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('mousedown', onCanvasMouseDown);

    // Basic Slash (Phi kiếm trảm kích)
    const triggerBasicSlash = (targetX: number, targetY: number) => {
      sound.playSlash();
      const angle = Math.atan2(targetY - player.y, targetX - player.x);
      const projSpeed = 460;

      // Determine weapon visual profile based on equipped weapon
      const eqWeapon = stateRef.current.equippedWeapon;
      let weaponColor = '#38bdf8';
      let arcRadius = 48;
      if (eqWeapon) {
        if (eqWeapon.name.includes('Huyết') || eqWeapon.rarity === 'co_bao') {
          weaponColor = '#ef4444';
          arcRadius = 50;
        } else if (eqWeapon.name.includes('Cổ Thần') || eqWeapon.name.includes('Phủ') || eqWeapon.rarity === 'than_khi') {
          weaponColor = '#f59e0b';
          arcRadius = 58;
        } else if (eqWeapon.name.includes('Trảm Tiên') || eqWeapon.rarity === 'tien') {
          weaponColor = '#06b6d4';
          arcRadius = 50;
        }
      }

      // Update character attack animation and facing direction
      player.angle = angle;
      player.facing = Math.cos(angle) >= 0 ? 1 : -1;
      player.attackPhase = 'slash';
      player.attackTimer = 0.24;

      // Add dynamic glowing sword slash crescent arc
      slashArcs.push({
        x: player.x,
        y: player.y,
        angle: angle,
        radius: arcRadius,
        life: 0.22,
        maxLife: 0.22,
        color: weaponColor,
      });

      projectiles.push({
        id: `p_${Date.now()}_${Math.random()}`,
        x: player.x + Math.cos(angle) * 25,
        y: player.y + Math.sin(angle) * 25,
        vx: Math.cos(angle) * projSpeed,
        vy: Math.sin(angle) * projSpeed,
        radius: arcRadius > 50 ? 10 : 8,
        damage: stateRef.current.playerStats.atk,
        color: weaponColor,
        life: 0.65,
        maxLife: 0.65,
        fromPlayer: true,
      });

      // Slash particles
      for (let i = 0; i < 6; i++) {
        particles.push({
          x: player.x,
          y: player.y,
          vx: Math.cos(angle + (Math.random() - 0.5) * 0.8) * 140,
          vy: Math.sin(angle + (Math.random() - 0.5) * 0.8) * 140,
          size: 3 + Math.random() * 3,
          color: weaponColor,
          alpha: 1,
          life: 0.35,
          maxLife: 0.35,
        });
      }
    };

    // Skill Execution Helper
    const triggerSkill = (skill: Skill) => {
      // Check cooldown and mana
      if (skill.currentCooldown > 0) return;
      if (stateRef.current.playerMp < skill.mpCost) {
        floatingTexts.push({
          id: `ft_${Date.now()}`,
          x: player.x,
          y: player.y - 35,
          text: 'Chân khí không đủ!',
          color: '#38bdf8',
          fontSize: 14,
          life: 0.8,
          maxLife: 0.8,
        });
        return;
      }

      // Check realm requirement
      if (stateRef.current.currentRealm.index < skill.realmReqIndex) {
        floatingTexts.push({
          id: `ft_${Date.now()}`,
          x: player.x,
          y: player.y - 35,
          text: `Chưa mở khóa! Cần cảnh giới cao hơn`,
          color: '#ef4444',
          fontSize: 14,
          life: 0.8,
          maxLife: 0.8,
        });
        return;
      }

      const success = stateRef.current.onCastSkillTrigger(skill.id);
      if (!success) return;

      // Trigger casting stance pose & visual effects
      player.castPoseTimer = 0.45;
      player.castSkillType = skill.effectType;

      cameraShake = 8;

      // Handle each specific skill VFX and logic
      if (skill.effectType === 'gravity') {
        // 1. Dẫn Lực Thuật (Gravitational Singularity Vortex)
        sound.playGraviton();
        cameraShake = 10;
        const targetX = player.x + Math.cos(player.angle) * 150;
        const targetY = player.y + Math.sin(player.angle) * 150;
        activeAoeEffects.push({
          id: `grav_${Date.now()}`,
          x: targetX,
          y: targetY,
          radius: skill.radius,
          duration: 2.5,
          maxDuration: 2.5,
          type: 'gravity',
          damageTick: 0.2,
          color: '#38bdf8',
        });
      } else if (skill.effectType === 'lightning') {
        // 2. Cực Cảnh Thần Niệm (Chaining Red Lightning Death Ray)
        sound.playLightning();
        cameraShake = 24;
        hitstopTimer = 0.08;
        redScreenFlash = 0.24;

        // Find candidate monsters within radius * 1.4 sorted by distance
        const targets: Monster[] = monsters
          .filter((m) => m.hp > 0 && Math.hypot(m.x - player.x, m.y - player.y) <= skill.radius * 1.4)
          .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))
          .slice(0, 6);

        let lastX = player.x;
        let lastY = player.y;

        for (const m of targets) {
          // Absolute 100% defense pierce
          const dmg = Math.round(
            stateRef.current.playerStats.atk * skill.damageMultiplier * (1 + (skill.level - 1) * 0.12)
          );
          m.hp -= dmg;
          m.hitFlashTimer = 0.22;
          m.telegraphTimer = 0; // Stun / Interrupt

          // Lightning chaining arc
          lightningArcs.push({
            x1: lastX,
            y1: lastY,
            x2: m.x,
            y2: m.y,
            life: 0.28,
            maxLife: 0.28,
            color: '#ef4444',
          });
          lastX = m.x;
          lastY = m.y;

          // Violent impulse away from player
          const kAngle = Math.atan2(m.y - player.y, m.x - player.x);
          m.vx += Math.cos(kAngle) * 320;
          m.vy += Math.sin(kAngle) * 320;

          floatingTexts.push({
            id: `cuc_canh_${Date.now()}_${m.id}`,
            x: m.x,
            y: m.y - 30,
            vx: (Math.random() - 0.5) * 60,
            vy: -140,
            text: `CỰC CẢNH! -${dmg}`,
            color: '#ef4444',
            fontSize: 19,
            life: 1.3,
            maxLife: 1.3,
          });

          // Red plasma spark burst
          for (let k = 0; k < 14; k++) {
            particles.push({
              x: m.x,
              y: m.y,
              vx: (Math.random() - 0.5) * 320,
              vy: (Math.random() - 0.5) * 320,
              size: 3.5 + Math.random() * 4,
              color: '#ef4444',
              alpha: 1,
              life: 0.45,
              maxLife: 0.45,
            });
          }
        }
      } else if (skill.effectType === 'finger') {
        // 3. Hoàng Tuyền Chỉ (Netherworld Finger Beam + Toxic Swamp)
        sound.playFingerZap();
        cameraShake = 15;
        const beamAngle = player.angle;
        const beamLength = 440;

        // Beam particle trail
        for (let step = 30; step < beamLength; step += 25) {
          const bx = player.x + Math.cos(beamAngle) * step;
          const by = player.y + Math.sin(beamAngle) * step;
          particles.push({
            x: bx,
            y: by,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            size: 18,
            color: '#eab308',
            alpha: 1,
            life: 0.4,
            maxLife: 0.4,
          });
        }

        // Damage & shred defense for all monsters in line
        for (const m of monsters) {
          if (m.hp <= 0) continue;
          const dx = m.x - player.x;
          const dy = m.y - player.y;
          const dist = Math.hypot(dx, dy);
          if (dist < beamLength) {
            const angleToM = Math.atan2(dy, dx);
            const angleDiff = Math.abs(angleToM - beamAngle);
            if (angleDiff < 0.4 || angleDiff > Math.PI * 2 - 0.4) {
              const dmg = Math.round(stateRef.current.playerStats.atk * skill.damageMultiplier);
              m.hp -= dmg;
              m.defense = Math.max(5, Math.round(m.defense * 0.5)); // 50% defense shred
              m.hitFlashTimer = 0.18;
              m.vx += Math.cos(beamAngle) * 260;
              m.vy += Math.sin(beamAngle) * 260;

              floatingTexts.push({
                id: `ft_fg_${m.id}_${Date.now()}`,
                x: m.x,
                y: m.y - 25,
                vx: Math.cos(beamAngle) * 80,
                vy: -110,
                text: `PHÁ GIÁP! -${dmg}`,
                color: '#eab308',
                fontSize: 16,
                life: 1.1,
                maxLife: 1.1,
              });
            }
          }
        }

        // Drop 3 bubbling Netherworld toxic pools along the beam line
        for (let pStep = 100; pStep <= 360; pStep += 130) {
          activeAoeEffects.push({
            id: `pool_${Date.now()}_${pStep}`,
            x: player.x + Math.cos(beamAngle) * pStep,
            y: player.y + Math.sin(beamAngle) * pStep,
            radius: 50,
            duration: 4.0,
            maxDuration: 4.0,
            type: 'huangquan_pool',
            damageTick: 0.25,
            color: '#eab308',
          });
        }
      } else if (skill.effectType === 'soul') {
        // 4. Tôn Hồn Phiên (100k Souls Flocking + Full Lifesteal)
        sound.playSoulWail();
        cameraShake = 12;

        // Summon 6 homing soul skulls
        for (let i = 0; i < 6; i++) {
          const soulAngle = (Math.PI * 2 * i) / 6;
          projectiles.push({
            id: `soul_${Date.now()}_${i}`,
            x: player.x + Math.cos(soulAngle) * 35,
            y: player.y + Math.sin(soulAngle) * 35,
            vx: Math.cos(soulAngle) * 190,
            vy: Math.sin(soulAngle) * 190,
            radius: 14,
            damage: Math.round((stateRef.current.playerStats.atk * skill.damageMultiplier) / 4),
            color: '#a855f7',
            life: 2.6,
            maxLife: 2.6,
            fromPlayer: true,
            skillType: 'soul',
          });
        }
      } else if (skill.effectType === 'domain') {
        // 5. Sinh Tử Luân Hồi Ý Cảnh (Yin-Yang Taiji Domain + Invulnerability)
        sound.playSoulWail();
        sound.playTribulationThunder();
        cameraShake = 26;
        player.invulnerableTimer = 3.5; // Invulnerable in domain

        activeAoeEffects.push({
          id: `domain_${Date.now()}`,
          x: player.x,
          y: player.y,
          radius: skill.radius,
          duration: 5.0,
          maxDuration: 5.0,
          type: 'domain',
          damageTick: 0.35,
          color: '#ffffff',
        });
      } else if (skill.effectType === 'wind_rain') {
        // 6. Hô Phong Hoán Vũ (Two Black Dragon Tornadoes + Corrosive Dark Rain)
        sound.playBlackDragonRoar();
        cameraShake = 22;

        // Spawn 2 roaming Black Dragon tornadoes
        for (let i = 0; i < 2; i++) {
          const offsetAngle = (i === 0 ? 0.8 : -0.8) + player.angle;
          activeAoeEffects.push({
            id: `dragon_${Date.now()}_${i}`,
            x: player.x + Math.cos(offsetAngle) * 100,
            y: player.y + Math.sin(offsetAngle) * 100,
            vx: Math.cos(offsetAngle) * 60,
            vy: Math.sin(offsetAngle) * 60,
            radius: 130,
            duration: 4.5,
            maxDuration: 4.5,
            type: 'dragon_tornado',
            damageTick: 0.25,
            color: '#334155',
          });
        }
      } else if (skill.effectType === 'mountain') {
        // 7. Sơn Băng (3 Colossal Mountain Peaks Slamming Down + Earthquake)
        sound.playMountainCrash();
        cameraShake = 34;
        hitstopTimer = 0.1;

        activeAoeEffects.push({
          id: `mountain_${Date.now()}`,
          x: player.x,
          y: player.y,
          radius: skill.radius,
          duration: 3.5,
          maxDuration: 3.5,
          type: 'mountain_fall',
          damageTick: 0.4,
          color: '#ea580c',
          subStage: 0,
        });
      }
    };

    // Main 60 FPS loop
    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = clampDeltaTime(rawDt, 0.05);

      if (redScreenFlash > 0) {
        redScreenFlash -= dt;
      }
      for (let i = lightningArcs.length - 1; i >= 0; i--) {
        lightningArcs[i].life -= dt;
        if (lightningArcs[i].life <= 0) {
          lightningArcs.splice(i, 1);
        }
      }

      // Handle map change
      if (stateRef.current.currentMap.id !== lastMapId) {
        lastMapId = stateRef.current.currentMap.id;
        spawnMonstersForMap(stateRef.current.currentMap);
        groundDrops = [];
        activeAoeEffects = [];
        projectiles = [];
        player.x = 1000;
        player.y = 1000;
      }

      // Check hitstop
      if (hitstopTimer > 0) {
        hitstopTimer -= dt;
      } else {
        // Update physics & movement
        let moveX = 0;
        let moveY = 0;

        if (keysPressed.has('w') || keysPressed.has('arrowup')) moveY -= 1;
        if (keysPressed.has('s') || keysPressed.has('arrowdown')) moveY += 1;
        if (keysPressed.has('a') || keysPressed.has('arrowleft')) moveX -= 1;
        if (keysPressed.has('d') || keysPressed.has('arrowright')) moveX += 1;

        // Mouse click target movement
        if (targetMovePos) {
          const dx = targetMovePos.x - player.x;
          const dy = targetMovePos.y - player.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 15) {
            moveX = dx / dist;
            moveY = dy / dist;
          } else {
            targetMovePos = null;
          }
        }

        const len = Math.hypot(moveX, moveY);
        const speed = stateRef.current.playerStats.speed;
        if (len > 0) {
          player.vx = (moveX / len) * speed;
          player.vy = (moveY / len) * speed;
          player.angle = Math.atan2(player.vy, player.vx);
          if (Math.abs(player.vx) > 5) {
            player.facing = player.vx > 0 ? 1 : -1;
          }
          player.walkDistance += speed * dt;
          player.footstepTimer += speed * dt;

          // Spawn glowing spiritual footstep ripples
          if (player.footstepTimer >= 20) {
            player.footstepTimer = 0;
            const footSide = Math.sin(player.walkDistance * 0.16) > 0 ? 1 : -1;
            const perpX = -Math.sin(player.angle) * 8 * footSide;
            const perpY = Math.cos(player.angle) * 8 * footSide;
            footprints.push({
              x: player.x + perpX,
              y: player.y + 16 + perpY,
              life: 0.55,
              maxLife: 0.55,
              size: 5,
              color: stateRef.current.currentRealm.badgeColor,
            });
          }
        } else {
          player.vx *= 0.8;
          player.vy *= 0.8;
        }

        player.x += player.vx * dt;
        player.y += player.vy * dt;

        // Decrement attack and cast pose timers
        if (player.attackTimer > 0) {
          player.attackTimer -= dt;
          if (player.attackTimer <= 0) {
            player.attackPhase = 'idle';
          }
        }
        if (player.castPoseTimer > 0) {
          player.castPoseTimer -= dt;
        }

        // Clamp inside world bounds
        player.x = Math.max(50, Math.min(WORLD_WIDTH - 50, player.x));
        player.y = Math.max(50, Math.min(WORLD_HEIGHT - 50, player.y));

        // Auto attack nearest monster if in range
        player.autoAttackTimer += dt;
        if (player.autoAttackTimer >= 0.75) {
          let closestDist = 220;
          let targetM: Monster | null = null;
          for (const m of monsters) {
            if (m.hp <= 0) continue;
            const dist = Math.hypot(m.x - player.x, m.y - player.y);
            if (dist < closestDist) {
              closestDist = dist;
              targetM = m;
            }
          }
          if (targetM) {
            triggerBasicSlash(targetM.x, targetM.y);
            player.autoAttackTimer = 0;
          }
        }

        // Update Projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
          const p = projectiles[i];
          p.life -= dt;

          // If soul projectile, home into closest monster
          if (p.skillType === 'soul') {
            let nearestDist = 350;
            let target: Monster | null = null;
            for (const m of monsters) {
              if (m.hp <= 0) continue;
              const d = Math.hypot(m.x - p.x, m.y - p.y);
              if (d < nearestDist) {
                nearestDist = d;
                target = m;
              }
            }
            if (target) {
              const homingAngle = Math.atan2(target.y - p.y, target.x - p.x);
              p.vx += Math.cos(homingAngle) * 400 * dt;
              p.vy += Math.sin(homingAngle) * 400 * dt;
            }
          }

          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Collision with monsters
          if (p.fromPlayer) {
            let hit = false;
            for (const m of monsters) {
              if (m.hp <= 0) continue;
              if (Math.hypot(m.x - p.x, m.y - p.y) < m.size + p.radius) {
                hit = true;
                const isCrit = Math.random() < stateRef.current.playerStats.critRate;
                const dmg = isCrit ? Math.round(p.damage * 1.8) : p.damage;
                m.hp -= dmg;
                m.hitFlashTimer = 0.14;

                // Knockback impulse from attack
                const knockAngle = Math.atan2(m.y - player.y, m.x - player.x);
                m.vx += Math.cos(knockAngle) * (isCrit ? 220 : 120);
                m.vy += Math.sin(knockAngle) * (isCrit ? 220 : 120);

                // Lifesteal & Soul healing
                if (p.skillType === 'soul') {
                  stateRef.current.onHeal(dmg, Math.round(dmg * 0.25));
                  floatingTexts.push({
                    id: `heal_soul_${Date.now()}_${Math.random()}`,
                    x: player.x,
                    y: player.y - 35,
                    vx: 0,
                    vy: -80,
                    text: `+${dmg} HÚT HỒN!`,
                    color: '#10b981',
                    fontSize: 14,
                    life: 1.0,
                    maxLife: 1.0,
                  });
                } else {
                  const healAmt = Math.round(dmg * stateRef.current.playerStats.lifesteal);
                  if (healAmt > 0) {
                    stateRef.current.onHeal(healAmt, 0);
                  }
                }

                // Floating text with bounce trajectory
                floatingTexts.push({
                  id: `ft_${Date.now()}_${Math.random()}`,
                  x: m.x,
                  y: m.y - 20,
                  vx: (Math.random() - 0.5) * 70,
                  vy: isCrit ? -140 : -100,
                  text: `${isCrit ? 'BẠO KÍCH! ' : ''}-${dmg}`,
                  color: isCrit ? '#f59e0b' : '#f87171',
                  fontSize: isCrit ? 16 : 13,
                  life: 0.95,
                  maxLife: 0.95,
                });

                // Impact particle burst with weapon energy sparks
                for (let k = 0; k < 8; k++) {
                  particles.push({
                    x: m.x,
                    y: m.y,
                    vx: (Math.random() - 0.5) * 200,
                    vy: (Math.random() - 0.5) * 200,
                    size: 3 + Math.random() * 3,
                    color: isCrit ? '#f59e0b' : p.color,
                    alpha: 1,
                    life: 0.35,
                    maxLife: 0.35,
                  });
                }
                break;
              }
            }
            if (hit && !p.pierce) {
              p.life = 0;
            }
          }

          if (p.life <= 0) {
            projectiles.splice(i, 1);
          }
        }

        // Update AOE Spells with distinct physics & mechanics
        for (let i = activeAoeEffects.length - 1; i >= 0; i--) {
          const aoe = activeAoeEffects[i];
          aoe.duration -= dt;
          aoe.damageTick -= dt;

          // Roaming Black Dragon tornadoes move dynamically
          if (aoe.type === 'dragon_tornado') {
            aoe.x += (aoe.vx || 0) * dt;
            aoe.y += (aoe.vy || 0) * dt;
            // Spawn dark rain & dust particles
            if (Math.random() < 0.4) {
              particles.push({
                x: aoe.x + (Math.random() - 0.5) * aoe.radius,
                y: aoe.y + (Math.random() - 0.5) * aoe.radius,
                vx: (Math.random() - 0.5) * 60,
                vy: 120 + Math.random() * 100,
                size: 2.5,
                color: '#475569',
                alpha: 0.8,
                life: 0.4,
                maxLife: 0.4,
              });
            }
          }

          // Gravitational pull pulls monsters AND drops into core
          if (aoe.type === 'gravity') {
            for (const m of monsters) {
              if (m.hp <= 0) continue;
              const dist = Math.hypot(m.x - aoe.x, m.y - aoe.y);
              if (dist <= aoe.radius * 1.5) {
                const pullAngle = Math.atan2(aoe.y - m.y, aoe.x - m.x);
                m.x += Math.cos(pullAngle) * 240 * dt;
                m.y += Math.sin(pullAngle) * 240 * dt;
                if (dist < 45) {
                  m.telegraphTimer = 0; // interrupt attack
                }
              }
            }
            // Pull ground loot drops toward singularity!
            for (const drop of groundDrops) {
              const dDist = Math.hypot(drop.x - aoe.x, drop.y - aoe.y);
              if (dDist <= aoe.radius * 2) {
                const dropAngle = Math.atan2(aoe.y - drop.y, aoe.x - drop.x);
                drop.x += Math.cos(dropAngle) * 200 * dt;
                drop.y += Math.sin(dropAngle) * 200 * dt;
              }
            }
          }

          // Taiji Domain slows monsters by 80%
          if (aoe.type === 'domain') {
            for (const m of monsters) {
              if (m.hp <= 0) continue;
              const dist = Math.hypot(m.x - aoe.x, m.y - aoe.y);
              if (dist <= aoe.radius) {
                m.vx *= 0.2;
                m.vy *= 0.2;
              }
            }
          }

          if (aoe.damageTick <= 0) {
            aoe.damageTick = aoe.type === 'domain' ? 0.35 : aoe.type === 'mountain_fall' ? 0.5 : 0.25;

            // Apply damage to monsters inside
            for (const m of monsters) {
              if (m.hp <= 0) continue;
              const dist = Math.hypot(m.x - aoe.x, m.y - aoe.y);
              if (dist <= aoe.radius) {
                let multiplier = 0.8;
                let textPrefix = '';
                if (aoe.type === 'gravity') {
                  multiplier = 0.9;
                  textPrefix = 'DẪN LỰC ';
                } else if (aoe.type === 'domain') {
                  multiplier = 1.4;
                  textPrefix = 'SINH TỬ ';
                } else if (aoe.type === 'dragon_tornado') {
                  multiplier = 1.1;
                  textPrefix = 'HẮC LONG ';
                  m.vy -= 160 * dt; // Toss monster up
                } else if (aoe.type === 'huangquan_pool') {
                  multiplier = 0.7;
                  textPrefix = 'HOÀNG TUYỀN ';
                } else if (aoe.type === 'mountain_fall') {
                  multiplier = 3.6;
                  textPrefix = 'SƠN BĂNG! ';
                  m.telegraphTimer = 0;
                  m.attackCooldown += 2.0; // Stun
                  cameraShake = 28;
                }

                const dmg = Math.round(stateRef.current.playerStats.atk * multiplier);
                m.hp -= dmg;
                m.hitFlashTimer = 0.16;

                floatingTexts.push({
                  id: `aoe_dmg_${Date.now()}_${m.id}_${Math.random()}`,
                  x: m.x,
                  y: m.y - 15,
                  vx: (Math.random() - 0.5) * 40,
                  vy: -90,
                  text: `${textPrefix}-${dmg}`,
                  color: aoe.color,
                  fontSize: aoe.type === 'mountain_fall' ? 18 : 13,
                  life: 0.8,
                  maxLife: 0.8,
                });
              }
            }
          }

          if (aoe.duration <= 0) {
            activeAoeEffects.splice(i, 1);
          }
        }

        // Update Monsters
        for (let i = monsters.length - 1; i >= 0; i--) {
          const m = monsters[i];

          // If defeated
          if (m.hp <= 0) {
            if (m.koTimer === 0) {
              m.koTimer = 0.4; // 0.4s dissolve
              sound.playLootChime();
              stateRef.current.onMonsterKilled(m);
              stateRef.current.onGainTuViAndStones(m.expTuVi, m.spiritStones);

              // Floating rewards
              floatingTexts.push({
                id: `rew_${Date.now()}_${m.id}`,
                x: m.x,
                y: m.y - 35,
                text: `+${m.expTuVi} Tu Vi  +${m.spiritStones} Linh Thạch`,
                color: '#38bdf8',
                fontSize: 13,
                life: 1.2,
                maxLife: 1.2,
              });

              // Roll drop items
              for (const drop of m.dropTable) {
                if (Math.random() <= drop.chance) {
                  const count = Math.floor(
                    Math.random() * (drop.maxCount - drop.minCount + 1) + drop.minCount
                  );

                  let stats: Item['stats'] | undefined = undefined;
                  let desc = 'Vật phẩm quý hiếm thu thập được khi trảm sát yêu thú.';

                  if (drop.type === 'weapon') {
                    const baseAtk =
                      drop.rarity === 'than_khi'
                        ? 260
                        : drop.rarity === 'co_bao'
                        ? 160
                        : drop.rarity === 'tien'
                        ? 95
                        : drop.rarity === 'bao'
                        ? 58
                        : 30;
                    const crit =
                      drop.rarity === 'than_khi'
                        ? 0.28
                        : drop.rarity === 'co_bao'
                        ? 0.20
                        : drop.rarity === 'tien'
                        ? 0.12
                        : 0.06;
                    stats = { atk: baseAtk, critRate: crit };
                    desc = `Binh khí [${drop.name}], gia tăng +${baseAtk} Công Kích và +${Math.round(crit * 100)}% Bạo Kích khi gắn vào ô Vũ Khí.`;
                  } else if (drop.type === 'armor') {
                    const baseDef =
                      drop.rarity === 'than_khi'
                        ? 150
                        : drop.rarity === 'co_bao'
                        ? 95
                        : drop.rarity === 'tien'
                        ? 65
                        : drop.rarity === 'bao'
                        ? 40
                        : 22;
                    const baseHp =
                      drop.rarity === 'than_khi'
                        ? 1200
                        : drop.rarity === 'co_bao'
                        ? 750
                        : drop.rarity === 'tien'
                        ? 450
                        : drop.rarity === 'bao'
                        ? 260
                        : 140;
                    stats = { def: baseDef, hp: baseHp };
                    desc = `Đạo bào phòng hộ [${drop.name}], gia tăng +${baseDef} Phòng Ngự và +${baseHp} Khí Huyết khi gắn vào ô Đạo Bào.`;
                  } else if (drop.type === 'accessory') {
                    const baseAtk =
                      drop.rarity === 'than_khi'
                        ? 130
                        : drop.rarity === 'co_bao'
                        ? 85
                        : drop.rarity === 'tien'
                        ? 50
                        : 30;
                    const baseDef =
                      drop.rarity === 'than_khi'
                        ? 90
                        : drop.rarity === 'co_bao'
                        ? 55
                        : drop.rarity === 'tien'
                        ? 35
                        : 20;
                    const baseHp =
                      drop.rarity === 'than_khi'
                        ? 800
                        : drop.rarity === 'co_bao'
                        ? 500
                        : drop.rarity === 'tien'
                        ? 300
                        : 180;
                    stats = { atk: baseAtk, def: baseDef, hp: baseHp, critRate: 0.08 };
                    desc = `Trang sức ngưng tụ linh lực [${drop.name}], gia trì toàn diện các thuộc tính khi gắn vào ô Trang Sức.`;
                  } else if (drop.type === 'pill') {
                    desc = `Linh đan thần dược [${drop.name}], nuốt vào tăng ngay Tu Vi.`;
                  } else if (drop.type === 'material') {
                    desc = `Linh thạch thiên địa [${drop.name}], dùng để đột phá và nâng cấp Ngũ Hành Linh Căn.`;
                  }

                  groundDrops.push({
                    id: `drop_${Date.now()}_${Math.random()}`,
                    x: m.x + (Math.random() - 0.5) * 40,
                    y: m.y + (Math.random() - 0.5) * 40,
                    item: {
                      id: `${drop.itemId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                      name: drop.name,
                      type: drop.type,
                      rarity: drop.rarity,
                      levelReq: 1,
                      description: desc,
                      iconName:
                        drop.type === 'weapon'
                          ? 'sword'
                          : drop.type === 'armor'
                          ? 'shield'
                          : drop.type === 'accessory'
                          ? 'gem'
                          : drop.type === 'pill'
                          ? 'sparkles'
                          : 'gem',
                      count,
                      price:
                        drop.rarity === 'than_khi'
                          ? 650
                          : drop.rarity === 'co_bao'
                          ? 380
                          : drop.rarity === 'tien'
                          ? 200
                          : drop.rarity === 'bao'
                          ? 100
                          : 40,
                      stats,
                      consumableEffect:
                        drop.type === 'pill'
                          ? {
                              type: 'gain_tuvi',
                              value: drop.rarity === 'bao' ? 350 : 150,
                            }
                          : undefined,
                    },
                    count,
                    color:
                      drop.rarity === 'than_khi'
                        ? '#eab308'
                        : drop.rarity === 'co_bao'
                        ? '#ea580c'
                        : drop.rarity === 'tien'
                        ? '#a855f7'
                        : drop.rarity === 'bao'
                        ? '#3b82f6'
                        : drop.rarity === 'linh'
                        ? '#10b981'
                        : '#94a3b8',
                    life: 45, // 45 seconds on ground
                  });
                }
              }

              // Bonus equippable accessory drop from Elite or Boss
              if ((m.isBoss || m.isElite) && Math.random() < (m.isBoss ? 0.75 : 0.35)) {
                const accRarity = m.isBoss ? 'tien' : 'bao';
                const accName = m.isBoss ? 'Thái Cực Bội Hoàn (Cổ Linh)' : 'Lôi Linh Ngọc Bội';
                groundDrops.push({
                  id: `drop_acc_${Date.now()}`,
                  x: m.x + (Math.random() - 0.5) * 30,
                  y: m.y + (Math.random() - 0.5) * 30,
                  item: {
                    id: `acc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    name: accName,
                    type: 'accessory',
                    rarity: accRarity,
                    levelReq: 1,
                    description: `Pháp bảo trang sức hiếm rơi ra từ thủ lĩnh, gia tăng Công Kích, Phòng Ngự và Khí Huyết khi gắn vào ô Trang Sức.`,
                    iconName: 'gem',
                    count: 1,
                    price: 280,
                    stats: {
                      atk: m.isBoss ? 65 : 35,
                      def: m.isBoss ? 45 : 22,
                      hp: m.isBoss ? 450 : 220,
                      critRate: m.isBoss ? 0.12 : 0.06,
                    },
                  },
                  count: 1,
                  color: m.isBoss ? '#a855f7' : '#3b82f6',
                  life: 60,
                });
              }
            }

            m.koTimer -= dt;
            if (m.koTimer <= 0) {
              // Respawn monster after 6s in random place
              monsters.splice(i, 1);
              setTimeout(() => {
                monsters.push({
                  ...m,
                  id: `m_respawn_${Date.now()}`,
                  hp: m.maxHp,
                  koTimer: 0,
                  x: Math.random() * (WORLD_WIDTH - 200) + 100,
                  y: Math.random() * (WORLD_HEIGHT - 200) + 100,
                });
              }, 4000);
            }
            continue;
          }

          // Decrement hit flash timer
          if (m.hitFlashTimer && m.hitFlashTimer > 0) {
            m.hitFlashTimer -= dt;
          }

          // Monster AI behavior
          const distToPlayer = Math.hypot(player.x - m.x, player.y - m.y);

          // If within aggro radius (450px)
          if (distToPlayer < 450) {
            const angleToP = Math.atan2(player.y - m.y, player.x - m.x);

            // Behavior policy
            if (m.behavior === 'chaser') {
              m.vx = m.vx * 0.85 + Math.cos(angleToP) * m.speed * 0.15;
              m.vy = m.vy * 0.85 + Math.sin(angleToP) * m.speed * 0.15;
            } else if (m.behavior === 'flanker') {
              const flankAngle = angleToP + Math.PI / 3;
              m.vx = m.vx * 0.85 + Math.cos(flankAngle) * m.speed * 0.15;
              m.vy = m.vy * 0.85 + Math.sin(flankAngle) * m.speed * 0.15;
            } else if (m.behavior === 'charger') {
              // Prepares charge then dashes fast!
              if (m.telegraphTimer > 0) {
                m.telegraphTimer -= dt;
                m.vx *= 0.85;
                m.vy *= 0.85;
                if (m.telegraphTimer <= 0) {
                  // Dash strike!
                  m.vx = Math.cos(angleToP) * m.speed * 2.5;
                  m.vy = Math.sin(angleToP) * m.speed * 2.5;
                }
              } else {
                m.vx = m.vx * 0.85 + Math.cos(angleToP) * m.speed * 0.15;
                m.vy = m.vy * 0.85 + Math.sin(angleToP) * m.speed * 0.15;
                if (distToPlayer < 180 && m.attackCooldown <= 0) {
                  m.telegraphTimer = m.telegraphDuration;
                  m.attackCooldown = 3.0;
                }
              }
            } else if (m.behavior === 'ranged') {
              // Keeps distance and shoots
              if (distToPlayer < 200) {
                m.vx = m.vx * 0.85 - Math.cos(angleToP) * m.speed * 0.15;
                m.vy = m.vy * 0.85 - Math.sin(angleToP) * m.speed * 0.15;
              } else {
                m.vx *= 0.85;
                m.vy *= 0.85;
              }
            }

            m.x += m.vx * dt;
            m.y += m.vy * dt;

            // Attack player on contact
            m.attackCooldown -= dt;
            if (distToPlayer < m.size + player.radius + 6 && m.attackCooldown <= 0) {
              m.attackCooldown = 1.2;
              const dmg = Math.max(
                5,
                Math.round(m.attack - stateRef.current.playerStats.def * 0.4)
              );
              stateRef.current.onTakeDamage(dmg);
              cameraShake = 6;
              floatingTexts.push({
                id: `ft_p_${Date.now()}`,
                x: player.x,
                y: player.y - 25,
                text: `-${dmg}`,
                color: '#ef4444',
                fontSize: 14,
                life: 0.8,
                maxLife: 0.8,
              });
            }
          } else {
            // Idle wander
            m.vx *= 0.9;
            m.vy *= 0.9;
          }
        }

        // Pick up loot items if close
        for (let i = groundDrops.length - 1; i >= 0; i--) {
          const drop = groundDrops[i];
          drop.life -= dt;
          const dist = Math.hypot(player.x - drop.x, player.y - drop.y);

          // Magnet suction if nearby
          if (dist < 120) {
            const pullAngle = Math.atan2(player.y - drop.y, player.x - drop.x);
            drop.x += Math.cos(pullAngle) * 320 * dt;
            drop.y += Math.sin(pullAngle) * 320 * dt;
          }

          if (dist < 28) {
            stateRef.current.onLootItem(drop.item, drop.count);
            sound.playLootChime();
            floatingTexts.push({
              id: `loot_${Date.now()}_${Math.random()}`,
              x: player.x,
              y: player.y - 45,
              text: `Nhặt: ${drop.item.name} x${drop.count}`,
              color: drop.color,
              fontSize: 13,
              life: 1.2,
              maxLife: 1.2,
            });
            groundDrops.splice(i, 1);
            continue;
          }

          if (drop.life <= 0) {
            groundDrops.splice(i, 1);
          }
        }

        // Particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life -= dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.alpha = Math.max(0, p.life / p.maxLife);
          if (p.life <= 0) {
            particles.splice(i, 1);
          }
        }

        // Floating texts with arc physics
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
          const ft = floatingTexts[i];
          ft.life -= dt;
          if (ft.vx !== undefined) {
            ft.x += ft.vx * dt;
          }
          if (ft.vy !== undefined) {
            ft.vy += 120 * dt; // gravity deceleration
            ft.y += ft.vy * dt;
          } else {
            ft.y -= 25 * dt; // float up default
          }
          if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
          }
        }
      }

      // Camera Shake decay
      if (cameraShake > 0) {
        cameraShake *= 0.88;
        if (cameraShake < 0.5) cameraShake = 0;
      }

      // ================== RENDER FRAME ==================
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Camera center on player with shake
      const shakeX = (Math.random() - 0.5) * cameraShake;
      const shakeY = (Math.random() - 0.5) * cameraShake;
      const camX = player.x - canvas.width / 2 + shakeX;
      const camY = player.y - canvas.height / 2 + shakeY;

      ctx.save();
      ctx.translate(-camX, -camY);

      // 1. Draw Map Terrain & Grid
      ctx.fillStyle = stateRef.current.currentMap.bgColor;
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // Mystical ancient floor pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let x = 0; x <= WORLD_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, WORLD_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= WORLD_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WORLD_WIDTH, y);
        ctx.stroke();
      }

      // World boundary border glow
      ctx.strokeStyle = stateRef.current.currentMap.accentGlow;
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // 2. Draw AOE Effects (Sinh Tử Ý Cảnh, Gravity, Mountain, Dragon Tornado, Netherworld Pool)
      for (const aoe of activeAoeEffects) {
        ctx.save();
        if (aoe.type === 'domain') {
          // Taiji Yin-Yang rotating domain
          ctx.beginPath();
          ctx.arc(aoe.x, aoe.y, aoe.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#f8fafc';
          ctx.stroke();

          // Yin-yang halves
          const rot = (now / 1000) * 0.8;
          ctx.save();
          ctx.translate(aoe.x, aoe.y);
          ctx.rotate(rot);

          // White half
          ctx.beginPath();
          ctx.arc(0, 0, aoe.radius * 0.9, 0, Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fill();

          // Black half
          ctx.beginPath();
          ctx.arc(0, 0, aoe.radius * 0.9, Math.PI, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fill();

          // Opposite eyes
          ctx.beginPath();
          ctx.arc(aoe.radius * 0.45, 0, 14, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(-aoe.radius * 0.45, 0, 14, 0, Math.PI * 2);
          ctx.fillStyle = '#f8fafc';
          ctx.fill();

          ctx.restore();
        } else if (aoe.type === 'gravity') {
          // Gravitational Singularity Accretion Disk
          const vortexAngle = (now / 1000) * 4;
          // Accretion spiral arms
          for (let arm = 0; arm < 3; arm++) {
            ctx.save();
            ctx.translate(aoe.x, aoe.y);
            ctx.rotate(vortexAngle + (arm * Math.PI * 2) / 3);
            ctx.beginPath();
            ctx.ellipse(0, 0, aoe.radius, aoe.radius * 0.4, 0, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.restore();
          }

          // Dark Event Horizon Core
          ctx.beginPath();
          ctx.arc(aoe.x, aoe.y, 22, 0, Math.PI * 2);
          ctx.fillStyle = '#020617';
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 16;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (aoe.type === 'dragon_tornado') {
          // Black Dragon Tornado
          const spin = (now / 1000) * 6;
          ctx.save();
          ctx.translate(aoe.x, aoe.y);
          for (let layer = 0; layer < 4; layer++) {
            ctx.beginPath();
            ctx.ellipse(
              0,
              -layer * 12,
              aoe.radius * (0.4 + layer * 0.18),
              aoe.radius * 0.25,
              spin * (layer % 2 === 0 ? 1 : -1),
              0,
              Math.PI * 2
            );
            ctx.fillStyle = layer % 2 === 0 ? 'rgba(30, 41, 59, 0.35)' : 'rgba(15, 23, 42, 0.5)';
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
          // Glowing crimson eyes of the Black Dragon
          ctx.beginPath();
          ctx.arc(-8, -45, 3.5, 0, Math.PI * 2);
          ctx.arc(8, -45, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
        } else if (aoe.type === 'huangquan_pool') {
          // Netherworld Toxic Mire
          ctx.beginPath();
          ctx.arc(aoe.x, aoe.y, aoe.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Bubbles
          const bubblePhase = (now / 1000) * 3;
          for (let b = 0; b < 3; b++) {
            const bx = aoe.x + Math.sin(bubblePhase + b * 2) * (aoe.radius * 0.6);
            const by = aoe.y + Math.cos(bubblePhase + b * 2) * (aoe.radius * 0.5);
            ctx.beginPath();
            ctx.arc(bx, by, 4 + Math.sin(bubblePhase * 2 + b) * 2, 0, Math.PI * 2);
            ctx.fillStyle = '#fef08a';
            ctx.fill();
          }
        } else if (aoe.type === 'mountain_fall') {
          // Colossal Mountain Slam with seismic shockwaves
          const progress = 1 - aoe.duration / aoe.maxDuration;
          const shakeOffset = Math.sin(now * 0.05) * 4;

          // Expanding shockwave rings
          ctx.beginPath();
          ctx.arc(aoe.x, aoe.y, Math.min(aoe.radius, progress * aoe.radius * 1.5), 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(234, 88, 12, 0.7)';
          ctx.lineWidth = 4;
          ctx.stroke();

          // 3 Mountain Peak Silhouettes
          const peaks = [
            { ox: 0, oy: -15, scale: 1 },
            { ox: -60, oy: 20, scale: 0.75 },
            { ox: 60, oy: 20, scale: 0.75 },
          ];

          for (const peak of peaks) {
            ctx.save();
            ctx.translate(aoe.x + peak.ox, aoe.y + peak.oy + shakeOffset);
            ctx.scale(peak.scale, peak.scale);
            ctx.beginPath();
            ctx.moveTo(0, -80);
            ctx.lineTo(55, 30);
            ctx.lineTo(-55, 30);
            ctx.closePath();
            ctx.fillStyle = 'rgba(124, 45, 18, 0.6)';
            ctx.fill();
            ctx.strokeStyle = '#ea580c';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.restore();
          }
        } else {
          ctx.beginPath();
          ctx.arc(aoe.x, aoe.y, aoe.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${aoe.color}22`;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = aoe.color;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Red Lightning Arcs for Cực Cảnh Thần Niệm
      for (const arc of lightningArcs) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(arc.x1, arc.y1);
        const steps = 4;
        const dx = (arc.x2 - arc.x1) / steps;
        const dy = (arc.y2 - arc.y1) / steps;
        for (let s = 1; s < steps; s++) {
          const jitterX = Math.sin(s * 9 + now) * 18;
          const jitterY = Math.cos(s * 9 + now) * 18;
          ctx.lineTo(arc.x1 + dx * s + jitterX, arc.y1 + dy * s + jitterY);
        }
        ctx.lineTo(arc.x2, arc.y2);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 16;
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }

      // 3. Draw Ground Item Drops with Beams of Light
      for (const drop of groundDrops) {
        // Vertical light beam
        const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y - 70);
        gradient.addColorStop(0, `${drop.color}bb`);
        gradient.addColorStop(1, `${drop.color}00`);
        ctx.fillStyle = gradient;
        ctx.fillRect(drop.x - 4, drop.y - 70, 8, 70);

        // Core shining orb
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = drop.color;
        ctx.shadowColor = drop.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label above drop
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(drop.item.name, drop.x, drop.y - 12);
      }

      // 4. Draw Monsters
      for (const m of monsters) {
        ctx.save();
        const opacity = m.koTimer > 0 ? m.koTimer / 0.4 : 1;
        ctx.globalAlpha = opacity;

        // Attack telegraph ring / line
        if (m.telegraphTimer > 0) {
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size + 24, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Monster shadow
        ctx.beginPath();
        ctx.ellipse(m.x, m.y + m.size * 0.8, m.size, m.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fill();

        // Monster Body with Hit-Flash Reaction
        const isHitFlashing = Boolean(m.hitFlashTimer && m.hitFlashTimer > 0);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        if (isHitFlashing) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 24;
        } else {
          ctx.fillStyle = m.color;
          if (m.isBoss) {
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 18;
          }
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = isHitFlashing ? '#ef4444' : '#ffffff';
        ctx.lineWidth = m.isBoss ? 3 : 1.5;
        ctx.stroke();

        // Monster Horns / Spikes if Boss or Elite
        if (m.isBoss) {
          ctx.fillStyle = '#dc2626';
          // Left horn
          ctx.beginPath();
          ctx.moveTo(m.x - m.size * 0.6, m.y - m.size * 0.5);
          ctx.lineTo(m.x - m.size * 1.1, m.y - m.size * 1.2);
          ctx.lineTo(m.x - m.size * 0.3, m.y - m.size * 0.8);
          ctx.fill();
          // Right horn
          ctx.beginPath();
          ctx.moveTo(m.x + m.size * 0.6, m.y - m.size * 0.5);
          ctx.lineTo(m.x + m.size * 1.1, m.y - m.size * 1.2);
          ctx.lineTo(m.x + m.size * 0.3, m.y - m.size * 0.8);
          ctx.fill();
        }

        // Eye / aura with demonic glow
        ctx.beginPath();
        ctx.arc(m.x, m.y - 2, m.size * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = isHitFlashing ? '#ef4444' : (m.isBoss ? '#7f1d1d' : '#0f172a');
        ctx.fill();

        // Pupil / glowing glint looking towards player
        const lookDir = player.x > m.x ? 2.5 : -2.5;
        ctx.beginPath();
        ctx.arc(m.x + lookDir, m.y - 3, m.size * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = isHitFlashing ? '#ffffff' : (m.isBoss ? '#fbbf24' : '#38bdf8');
        ctx.fill();

        // Health Bar above monster
        const barWidth = Math.max(36, m.size * 2.2);
        const barHeight = 4;
        const hpPercent = Math.max(0, m.hp / m.maxHp);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(m.x - barWidth / 2, m.y - m.size - 12, barWidth, barHeight);
        ctx.fillStyle = m.isBoss ? '#ef4444' : '#10b981';
        ctx.fillRect(m.x - barWidth / 2, m.y - m.size - 12, barWidth * hpPercent, barHeight);

        // Monster Title & Name
        ctx.font = m.isBoss ? 'bold 13px sans-serif' : '11px sans-serif';
        ctx.fillStyle = m.isBoss ? '#fbbf24' : '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.fillText(m.name, m.x, m.y - m.size - 16);

        ctx.restore();
      }

      // 4.5 Draw Footprints & Spiritual Ripples on Ground
      for (const fp of footprints) {
        const alpha = Math.max(0, fp.life / fp.maxLife);
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(fp.x, fp.y, fp.size, fp.size * 0.45, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.7})`;
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.25})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }

      // 4.6 Draw Sword Slash Crescent Arcs
      for (const arc of slashArcs) {
        const alpha = Math.max(0, arc.life / arc.maxLife);
        ctx.save();
        ctx.translate(arc.x, arc.y);
        ctx.rotate(arc.angle);
        ctx.beginPath();
        ctx.arc(0, 0, arc.radius, -0.65, 0.65);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = 5 * alpha;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.stroke();
        // Razor white inner line
        ctx.beginPath();
        ctx.arc(0, 0, arc.radius - 2, -0.55, 0.55);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2 * alpha;
        ctx.stroke();
        ctx.restore();
      }

      // 5. Draw Player (Vương Lâm - Detailed Anatomical Model)
      ctx.save();

      // Mount rendering (Văn Thú - Mosquito Beast)
      if (stateRef.current.activeMount && stateRef.current.activeMount.active) {
        ctx.save();
        ctx.translate(player.x, player.y + 6);
        ctx.rotate(player.angle);

        // Mosquito body
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#4c1d95';
        ctx.fill();
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Stinger
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(38, 0);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Vibrating wings
        const wingOffset = Math.sin(now * 0.05) * 14;
        ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-4, -16 + wingOffset, 16, 7, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-4, 16 - wingOffset, 16, 7, 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Movement & gait calculations
      const curSpeed = Math.hypot(player.vx, player.vy);
      const isMoving = curSpeed > 15;
      const walkCycle = Math.sin(player.walkDistance * 0.16);
      const bobY = isMoving ? Math.abs(Math.sin(player.walkDistance * 0.16)) * 3.5 : 0;
      const leanTilt = isMoving ? (player.vx / 300) * 0.12 : 0;
      const facing = player.facing;

      // Contact Shadow under feet
      ctx.beginPath();
      ctx.ellipse(player.x, player.y + 16, Math.max(10, 16 - bobY * 0.5), 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();

      // Realm Cultivation Aura (glowing halo around feet & body)
      ctx.beginPath();
      ctx.ellipse(player.x, player.y + 12, 22, 9, 0, 0, Math.PI * 2);
      ctx.strokeStyle = stateRef.current.currentRealm.badgeColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = stateRef.current.currentRealm.badgeColor;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Enter Player Local Coordinate Space
      ctx.save();
      ctx.translate(player.x, player.y - bobY);
      ctx.rotate(leanTilt);
      ctx.scale(facing, 1);

      // (A) Hai Chân & Đôi Hài (Legs & Daoist Boots)
      const legStride = isMoving ? walkCycle * 8 : 0;
      // Back leg
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-7 - legStride, 4, 5, 13);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-7 - legStride, 11, 5, 2);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8 - legStride, 15, 7, 3);

      // Front leg
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2 + legStride, 4, 5, 13);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(2 + legStride, 11, 5, 2);
      ctx.fillStyle = '#334155';
      ctx.fillRect(1 + legStride, 15, 7, 3);

      // (B) Thân Mình & Đạo Bào 2 Lớp (Torso & Layered Robes)
      // Inner dark tunic
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-8, -12, 16, 18, 3);
      ctx.fill();

      // Outer white robe with flowing hem
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-10, -11);
      ctx.lineTo(10, -11);
      ctx.lineTo(12 - (isMoving ? 2 : 0), 10);
      ctx.lineTo(-12 - (isMoving ? 3 : 0), 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Cyan / Gold waist sash
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-9, -2, 18, 4);

      // Fluttering sash ribbon
      const ribbonFlutter = isMoving ? Math.sin(now * 0.01) * 3 : 0;
      ctx.beginPath();
      ctx.moveTo(-4, 2);
      ctx.quadraticCurveTo(-14 - (isMoving ? 8 : 0), 8 + ribbonFlutter, -12 - (isMoving ? 12 : 0), 18);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // (C) Tay Trái (Off-hand - Kết Ấn / Thủ Thế Chỉ Kiếm)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(-8, -5, 4.5, 7, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(-7, -4, 2.8, 0, Math.PI * 2);
      ctx.fill();
      // Upward pointing sword finger
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-7, -4);
      ctx.lineTo(-7, -8);
      ctx.stroke();

      // (D) Tay Phải & Vũ Khí (Weapon Arm & Trảm Tiên Kiếm)
      if (player.attackPhase === 'slash') {
        // Attack Swing Phase
        const slashProgress = 1 - player.attackTimer / 0.24;
        const armAngle = -0.6 + slashProgress * 1.8;
        ctx.save();
        ctx.translate(6, -6);
        ctx.rotate(armAngle);
        // Sleeve
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, -3, 14, 6);
        // Hand
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(14, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        // Determine weapon profile from equipment
        const eqWeapon = stateRef.current.equippedWeapon;
        let bladeColor = '#38bdf8';
        let bladeWidth = 3.5;
        let bladeLength = 32;
        let isAxe = false;

        if (eqWeapon) {
          if (eqWeapon.name.includes('Huyết') || eqWeapon.rarity === 'co_bao') {
            bladeColor = '#ef4444';
          } else if (eqWeapon.name.includes('Cổ Thần') || eqWeapon.name.includes('Phủ') || eqWeapon.rarity === 'than_khi') {
            bladeColor = '#f59e0b';
            bladeWidth = 5;
            bladeLength = 38;
            isAxe = true;
          } else if (eqWeapon.name.includes('Trảm Tiên') || eqWeapon.rarity === 'tien') {
            bladeColor = '#06b6d4';
          }
        }

        if (isAxe) {
          // Cổ Thần Khai Thiên Phủ (Ancient God Battle-Axe)
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(14, 0);
          ctx.lineTo(46, 0);
          ctx.stroke();

          // Golden crescent battle-axe blade
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.moveTo(32, -14);
          ctx.quadraticCurveTo(52, 0, 32, 14);
          ctx.lineTo(36, 0);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Daoist Longsword Blade
          ctx.strokeStyle = bladeColor;
          ctx.lineWidth = bladeWidth;
          ctx.shadowColor = bladeColor;
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.moveTo(14, 0);
          ctx.lineTo(14 + bladeLength, 0);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Crossguard
          ctx.fillStyle = bladeColor === '#ef4444' ? '#991b1b' : '#f59e0b';
          ctx.fillRect(13, -4, 3, 8);
        }
        ctx.restore();
      } else if (player.castPoseTimer > 0) {
        // Casting Skill Pose
        ctx.save();
        ctx.translate(6, -6);
        ctx.rotate(-1.2);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, -3, 13, 6);
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(13, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        // Sparks at hand
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(16, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Idle Arm holding sword hilt at hip
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(8, -4, 4.5, 7, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(9, 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Elegant sheathed sword at hip
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(7, 3);
        ctx.lineTo(-3, 16);
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(6, 1, 3, 3);
      }

      // (E) Đầu, Tóc Bạc & Khuôn Mặt (Head, Silver Hair & Face)
      // Ponytail swaying behind
      const hairSway = isMoving ? Math.sin(now * 0.008) * 4 : 0;
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(-4, -18);
      ctx.quadraticCurveTo(-18 - (isMoving ? 8 : 0), -10 + hairSway, -14 - (isMoving ? 14 : 0), 4);
      ctx.quadraticCurveTo(-8, -4, -2, -12);
      ctx.fill();

      // Chibi Head & Face with sprite integration
      if (spriteLoaded) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, -18, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.clip();
        ctx.drawImage(wangLinSprite, -16, -34, 32, 34);
        ctx.restore();

        // Rim border
        ctx.beginPath();
        ctx.arc(0, -18, 14, 0, Math.PI * 2);
        ctx.strokeStyle = stateRef.current.currentRealm.badgeColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      } else {
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(0, -18, 11, 0, Math.PI * 2);
        ctx.fill();
      }

      // Forehead Cổ Thần Star (Ấn Ký Cổ Thần) with ancient power pulse
      const starColor = stateRef.current.currentRealm.index >= 9 ? '#eab308' : '#ef4444';
      const starRadius = 2.2 + Math.sin(now * 0.006) * 0.4;
      ctx.fillStyle = starColor;
      ctx.shadowColor = starColor;
      ctx.shadowBlur = 10 + Math.sin(now * 0.006) * 5;
      ctx.beginPath();
      ctx.arc(1, -20, starRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Crown / Pin (Ngọc Quan)
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-4, -28);
      ctx.lineTo(4, -28);
      ctx.lineTo(2, -33);
      ctx.lineTo(-2, -33);
      ctx.closePath();
      ctx.fill();

      ctx.restore(); // end player local space

      // Floating Sword Companion (hovers and orbits Wang Lin)
      const swordOrbit = (now / 1000) * 2;
      const sx = player.x + Math.cos(swordOrbit) * 32;
      const sy = player.y + Math.sin(swordOrbit) * 32;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(swordOrbit + Math.PI / 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-2, -12, 4, 24);
      ctx.restore();

      // Name & Title above Wang Lin
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText('Vương Lâm', player.x, player.y - 34);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = stateRef.current.currentRealm.badgeColor;
      ctx.fillText(stateRef.current.currentRealm.name, player.x, player.y - 48);

      ctx.restore();

      // 6. Draw Projectiles
      for (const p of projectiles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 7. Draw Particles
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      // 8. Draw Floating Text (Damage, XP, Loot)
      for (const ft of floatingTexts) {
        ctx.save();
        ctx.font = `bold ${ft.fontSize}px sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore(); // restore camera transform

      // Red Vignette Screen Flash on Cực Cảnh Thần Niệm
      if (redScreenFlash > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(239, 68, 68, ${Math.min(0.35, redScreenFlash * 1.5)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // 9. Minimap (Top-right corner)
      const mmWidth = 140;
      const mmHeight = 140;
      const mmX = canvas.width - mmWidth - 16;
      const mmY = 70;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(mmX, mmY, mmWidth, mmHeight);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(mmX, mmY, mmWidth, mmHeight);

      // Player dot on minimap
      const pDotX = mmX + (player.x / WORLD_WIDTH) * mmWidth;
      const pDotY = mmY + (player.y / WORLD_HEIGHT) * mmHeight;
      ctx.beginPath();
      ctx.arc(pDotX, pDotY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();

      // Monster dots
      for (const m of monsters) {
        if (m.hp <= 0) continue;
        const mDotX = mmX + (m.x / WORLD_WIDTH) * mmWidth;
        const mDotY = mmY + (m.y / WORLD_HEIGHT) * mmHeight;
        ctx.beginPath();
        ctx.arc(mDotX, mDotY, m.isBoss ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fillStyle = m.isBoss ? '#ef4444' : '#f59e0b';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousedown', onCanvasMouseDown);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-crosshair overflow-hidden"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
