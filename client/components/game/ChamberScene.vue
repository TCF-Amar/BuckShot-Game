<template>
  <div class="relative w-full h-full max-h-full flex-1 flex flex-col justify-between overflow-hidden rounded-lg border border-[#272a2a] bg-[#050607] shadow-2xl select-none p-1 sm:p-2">
    <!-- Atmospheric Background Wall & Swinging Overhead Industrial Lamp -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-[#030304] via-[#08090a] to-[#101213] opacity-95"></div>
      <div class="swinging-light absolute -top-14 left-1/2 -translate-x-1/2 w-[650px] h-[500px] light-cone"></div>
      <div class="swinging-light absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
        <div class="w-0.5 h-14 bg-zinc-700"></div>
        <div class="w-10 sm:w-12 h-5 sm:h-6 bg-zinc-800 rounded-b-full border border-zinc-600 shadow-md flex items-center justify-center">
          <div class="w-3.5 h-3.5 rounded-full bg-amber-200/95 shadow-[0_0_20px_#f59e0b] animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- TOP SECTION: Dealer / Opponent Person Across the Table -->
    <div class="relative z-20 pt-0.5 sm:pt-2 px-1.5 sm:px-4 flex items-center justify-between flex-shrink-0 gap-1 sm:gap-2">
      <!-- Left: Round Shells Breakdown / Briefing HUD -->
      <div class="bg-[#0b0e0f]/90 border border-zinc-800/80 p-1 sm:p-2 rounded shadow font-mono text-[8px] sm:text-[10px] max-w-[120px] sm:max-w-[180px] flex-shrink-0">
        <div class="text-zinc-500 uppercase tracking-widest text-[7px] sm:text-[9px] mb-0.5 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
          <span>R{{ roundNumber }} INTEL</span>
        </div>
        <div class="flex items-center gap-1 sm:gap-1.5">
          <span class="px-1 py-0.2 rounded bg-red-950/80 border border-red-700 text-red-300 font-bold flex items-center gap-0.5">
            <span class="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-500"></span>
            {{ roundLiveCount }} LIVE
          </span>
          <span class="px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-700 text-cyan-300 font-bold flex items-center gap-0.5">
            <span class="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-cyan-400"></span>
            {{ roundBlankCount }} BLANK
          </span>
        </div>
      </div>

      <!-- Center: Detailed Opponent Persona -->
      <div class="flex flex-col items-center flex-shrink-0">
        <div
          :class="[
            'relative transition-all duration-300',
            aimTarget === 'opponent' ? 'scale-105' : '',
          ]"
        >
          <!-- Opponent Torso & Trench Coat Shoulders -->
          <div class="w-20 sm:w-28 md:w-32 h-14 sm:h-20 rounded-t-full bg-gradient-to-b from-[#141718] via-[#090b0c] to-[#040505] border-t border-x border-zinc-700/60 shadow-xl flex flex-col items-center justify-start pt-0.5 relative overflow-hidden animate-breathing">
            <!-- Head & Respirator Mask -->
            <div class="w-9 sm:w-12 h-9 sm:h-12 rounded-full bg-gradient-to-b from-[#1c1f21] to-[#0d0f10] border border-zinc-700 shadow-md flex flex-col items-center justify-center relative">
              <!-- Glowing Red Visor Slit -->
              <div class="flex items-center gap-1 my-0.5">
                <div
                  :class="[
                    'w-1.5 sm:w-2.5 h-1 sm:h-1.5 rounded-sm transition-all duration-300',
                    aimTarget === 'opponent'
                      ? 'bg-red-400 shadow-[0_0_10px_#ef4444] animate-ping'
                      : opponent?.connected
                      ? 'bg-red-600 shadow-[0_0_6px_#dc2626]'
                      : 'bg-zinc-700 opacity-40',
                  ]"
                ></div>
                <div
                  :class="[
                    'w-1.5 sm:w-2.5 h-1 sm:h-1.5 rounded-sm transition-all duration-300',
                    aimTarget === 'opponent'
                      ? 'bg-red-400 shadow-[0_0_10px_#ef4444] animate-ping'
                      : opponent?.connected
                      ? 'bg-red-600 shadow-[0_0_6px_#dc2626]'
                      : 'bg-zinc-700 opacity-40',
                  ]"
                ></div>
              </div>

              <!-- Gas Mask Filter -->
              <div class="w-3.5 sm:w-4.5 h-2 sm:h-2.5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center gap-0.5">
                <div class="w-0.5 h-1 sm:h-1.5 bg-zinc-700"></div>
                <div class="w-0.5 h-1 sm:h-1.5 bg-zinc-700"></div>
              </div>
            </div>

            <!-- Laser Sight Target on Chest -->
            <div
              v-if="aimTarget === 'opponent' && isMyTurn"
              class="absolute top-8 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-red-600 laser-dot z-30"
            ></div>
          </div>

          <!-- Handcuff Status -->
          <div
            v-if="opponent && opponent.skippedTurnsPending > 0"
            class="absolute -bottom-2 -left-2 -right-2 py-0.2 bg-black/90 border border-amber-600 rounded text-[7px] sm:text-[8px] font-mono text-amber-400 font-bold text-center tracking-wider"
          >
            ⛓️ CUFFED
          </div>
        </div>

        <span class="text-[9px] sm:text-xs font-mono font-bold tracking-wider uppercase text-zinc-300 mt-0.5 flex items-center gap-1">
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full',
              opponent?.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse',
            ]"
          ></span>
          <span class="truncate max-w-[80px] sm:max-w-none">{{ opponent?.name || 'Awaiting Opponent' }}</span>
        </span>
      </div>

      <!-- Right: Opponent CRT Vitals Monitor -->
      <div v-if="opponent" class="w-28 sm:w-44 md:w-56 flex-shrink-0">
        <CrtVitalsMonitor
          :player="opponent"
          :is-local="false"
          :is-turn="currentTurn === opponent.id"
        />
      </div>
      <div v-else class="w-28 text-right font-mono text-[9px] text-zinc-600 flex-shrink-0">
        [OFFLINE]
      </div>
    </div>

    <!-- CENTER SECTION: 3D Tabletop Surface, Shotgun, Aim Animations, Shell Rack -->
    <div class="relative z-20 flex-1 min-h-0 flex flex-col items-center justify-center chamber-viewport px-1 sm:px-4 my-0.5 sm:my-1">
      <div class="relative w-full max-w-4xl h-full max-h-[190px] sm:max-h-[250px] md:max-h-[280px] table-surface rounded-lg sm:rounded-xl border border-zinc-700/50 p-2 sm:p-3 flex flex-col justify-between overflow-hidden shadow-2xl">
        <div class="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <!-- Upper Table: Shell Rack -->
        <div class="relative z-10 flex items-center justify-between px-2 pt-0.5">
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-mono tracking-widest uppercase text-zinc-400">
              CHAMBER:
            </span>

            <!-- Shells in Rack -->
            <div class="flex items-center gap-1 sm:gap-1.5">
              <div
                v-for="idx in totalRoundShells"
                :key="idx"
                class="flex flex-col items-center"
              >
                <div
                  :class="[
                    'w-3 sm:w-4 h-6 sm:h-8 rounded-t-sm border transition-all duration-300 relative overflow-hidden',
                    idx <= shellsRemaining
                      ? 'bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#450a0a] border-red-500 shadow-md shadow-red-950/60'
                      : 'bg-[#181a1b] border-zinc-800 opacity-20',
                  ]"
                >
                  <div
                    :class="[
                      'absolute bottom-0 w-full h-2 border-t',
                      idx <= shellsRemaining
                        ? 'bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700 border-amber-500'
                        : 'bg-zinc-800 border-zinc-700',
                    ]"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sawed-Off Status Badge -->
          <div v-if="sawedOff" class="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950 border border-red-500 animate-pulse text-[9px] sm:text-[10px] font-mono font-black text-red-200">
            <span>🪚 2X DAMAGE READY</span>
          </div>
          <div v-else class="text-[9px] sm:text-xs font-mono font-bold text-red-400 bg-red-950/40 border border-red-900/60 px-1.5 py-0.2 rounded">
            {{ shellsRemaining }}/{{ totalRoundShells }} IN CHAMBER
          </div>
        </div>

        <!-- Center Table: THE SHOTGUN MODEL & PROPER AIM ANIMATION -->
        <div class="relative z-20 flex-1 min-h-0 flex items-center justify-center my-auto">
          <div
            :class="[
              'shotgun-model relative select-none cursor-pointer transition-all duration-500',
              aimTarget === 'opponent' ? 'aim-opponent-smooth' : '',
              aimTarget === 'self' ? 'aim-self-smooth' : '',
              shotAnimation === 'firing_live' || shotAnimation === 'firing_blank' ? 'animate-recoil' : '',
            ]"
            @click="onShotgunClick"
          >
            <!-- SVG Shotgun Model with Dynamic Barrel Length -->
            <svg
              class="w-52 sm:w-72 md:w-88 h-14 sm:h-18 md:h-22 drop-shadow-[0_12px_20px_rgba(0,0,0,0.95)]"
              viewBox="0 0 400 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g v-if="!sawedOff">
                <rect x="140" y="36" width="240" height="12" rx="2" fill="url(#steelGrad)" stroke="#4b5563" stroke-width="1.5" />
                <rect x="140" y="49" width="180" height="9" rx="1.5" fill="#1f2937" stroke="#374151" stroke-width="1" />
                <circle cx="375" cy="35" r="2" fill="#fbbf24" />
              </g>
              <g v-else>
                <rect x="140" y="36" width="115" height="12" rx="1" fill="url(#steelGrad)" stroke="#4b5563" stroke-width="1.5" />
                <rect x="140" y="49" width="105" height="9" rx="1" fill="#1f2937" stroke="#374151" stroke-width="1" />
                <line x1="255" y1="35" x2="255" y2="49" stroke="#ef4444" stroke-width="2.5" class="animate-pulse" />
                <line x1="245" y1="48" x2="245" y2="59" stroke="#ef4444" stroke-width="2.5" class="animate-pulse" />
              </g>

              <rect x="155" y="47" width="70" height="13" rx="2" fill="url(#woodGrad)" stroke="#78350f" stroke-width="1.5" />
              <rect x="70" y="32" width="75" height="26" rx="3" fill="url(#receiverGrad)" stroke="#374151" stroke-width="1.5" />
              <rect x="95" y="35" width="28" height="9" rx="1" fill="#111827" stroke="#4b5563" />
              <rect x="100" y="37" width="18" height="5" fill="#d97706" />

              <path d="M90 58 Q95 72 108 72 Q115 72 118 58" fill="none" stroke="#4b5563" stroke-width="2.5" />
              <path d="M102 60 Q106 66 103 70" fill="none" stroke="#9ca3af" stroke-width="2" />

              <path d="M70 34 L15 28 C8 32 4 48 8 68 L70 56 Z" fill="url(#woodGrad)" stroke="#78350f" stroke-width="1.5" />
              <rect x="10" y="29" width="6" height="39" rx="2" fill="#111827" stroke="#374151" />

              <defs>
                <linearGradient id="steelGrad" x1="140" y1="36" x2="380" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#374151" />
                  <stop offset="0.5" stop-color="#6b7280" />
                  <stop offset="1" stop-color="#1f2937" />
                </linearGradient>
                <linearGradient id="receiverGrad" x1="70" y1="32" x2="145" y2="58" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#111827" />
                  <stop offset="0.5" stop-color="#374151" />
                  <stop offset="1" stop-color="#0f172a" />
                </linearGradient>
                <linearGradient id="woodGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#92400e" />
                  <stop offset="0.5" stop-color="#b45309" />
                  <stop offset="1" stop-color="#78350f" />
                </linearGradient>
              </defs>
            </svg>

            <!-- Muzzle Flash Explosion Flare Graphic -->
            <div
              v-if="shotAnimation === 'firing_live'"
              class="absolute -right-12 top-1/2 -translate-y-1/2 w-32 sm:w-44 h-32 sm:h-44 pointer-events-none muzzle-flash-anim flex items-center justify-center z-40"
            >
              <div class="w-28 sm:w-36 h-28 sm:h-36 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 blur-md opacity-95"></div>
              <div class="absolute w-14 h-14 rounded-full bg-white blur-sm"></div>
            </div>

            <!-- Blank Firing Spark Graphic -->
            <div
              v-if="shotAnimation === 'firing_blank'"
              class="absolute -right-6 top-1/2 -translate-y-1/2 w-14 h-14 pointer-events-none animate-ping flex items-center justify-center z-40"
            >
              <div class="w-6 h-6 rounded-full bg-cyan-300 blur-sm opacity-85"></div>
            </div>
          </div>
        </div>

        <!-- Lower Table: Tactical Physical Items Resting on Table -->
        <div class="relative z-20 flex items-center justify-center gap-4 sm:gap-8 pb-0.5">
          <!-- Item 1: Magnifier -->
          <button
            type="button"
            :disabled="!canUseMagnifier"
            :class="[
              'group flex flex-col items-center transition-all duration-200 select-none focus:outline-none',
              canUseMagnifier ? 'cursor-pointer hover:-translate-y-1 hover:scale-105' : 'opacity-30 cursor-not-allowed filter grayscale',
            ]"
            title="Inspect next shell in chamber"
            @click="$emit('use-item', 'magnifier')"
          >
            <div class="relative">
              <svg class="w-7 h-7 sm:w-9 sm:h-9 drop-shadow" viewBox="0 0 48 48" fill="none">
                <circle cx="20" cy="20" r="14" stroke="#d97706" stroke-width="3" fill="#1e293b" fill-opacity="0.4" />
                <circle cx="20" cy="20" r="11" stroke="#fbbf24" stroke-width="1" stroke-dasharray="2,2" />
                <path d="M14 15 Q17 12 22 13" stroke="#fef08a" stroke-width="2" stroke-linecap="round" />
                <line x1="30" y1="30" x2="43" y2="43" stroke="#92400e" stroke-width="5" stroke-linecap="round" />
              </svg>
              <span class="absolute -top-1 -right-1 text-[7px] font-mono px-0.8 rounded font-bold border bg-amber-950 border-amber-500 text-amber-300">
                {{ inventory.magnifier }}
              </span>
            </div>
            <span class="text-[8px] sm:text-[9px] font-mono tracking-wider uppercase text-zinc-400 group-hover:text-amber-300">
              MAGNIFIER
            </span>
          </button>

          <!-- Item 2: Handcuffs -->
          <button
            type="button"
            :disabled="!canUseCuffs"
            :class="[
              'group flex flex-col items-center transition-all duration-200 select-none focus:outline-none',
              canUseCuffs ? 'cursor-pointer hover:-translate-y-1 hover:scale-105' : 'opacity-30 cursor-not-allowed filter grayscale',
            ]"
            title="Skip opponent's next turn"
            @click="$emit('use-item', 'cuffs')"
          >
            <div class="relative">
              <svg class="w-7 h-7 sm:w-9 sm:h-9 drop-shadow" viewBox="0 0 48 48" fill="none">
                <circle cx="16" cy="24" r="10" stroke="#6b7280" stroke-width="3.5" fill="#0f172a" fill-opacity="0.5" />
                <circle cx="32" cy="24" r="10" stroke="#6b7280" stroke-width="3.5" fill="#0f172a" fill-opacity="0.5" />
                <line x1="22" y1="24" x2="26" y2="24" stroke="#9ca3af" stroke-width="4" stroke-linecap="round" />
              </svg>
              <span class="absolute -top-1 -right-1 text-[7px] font-mono px-0.8 rounded font-bold border bg-cyan-950 border-cyan-500 text-cyan-300">
                {{ inventory.cuffs }}
              </span>
            </div>
            <span class="text-[8px] sm:text-[9px] font-mono tracking-wider uppercase text-zinc-400 group-hover:text-cyan-300">
              CUFFS
            </span>
          </button>

          <!-- Item 3: Medkit -->
          <button
            type="button"
            :disabled="!canUseMedkit"
            :class="[
              'group flex flex-col items-center transition-all duration-200 select-none focus:outline-none',
              canUseMedkit ? 'cursor-pointer hover:-translate-y-1 hover:scale-105' : 'opacity-30 cursor-not-allowed filter grayscale',
            ]"
            title="Inject +1 HP"
            @click="$emit('use-item', 'medkit')"
          >
            <div class="relative">
              <svg class="w-7 h-7 sm:w-9 sm:h-9 drop-shadow" viewBox="0 0 48 48" fill="none">
                <rect x="18" y="14" width="12" height="20" rx="2" fill="#064e3b" stroke="#10b981" stroke-width="2" />
                <rect x="20" y="18" width="8" height="12" fill="#34d399" fill-opacity="0.7" />
                <line x1="24" y1="6" x2="24" y2="14" stroke="#d1d5db" stroke-width="2.5" />
                <line x1="24" y1="34" x2="24" y2="42" stroke="#9ca3af" stroke-width="1.8" />
              </svg>
              <span class="absolute -top-1 -right-1 text-[7px] font-mono px-0.8 rounded font-bold border bg-emerald-950 border-emerald-500 text-emerald-300">
                {{ inventory.medkit }}
              </span>
            </div>
            <span class="text-[8px] sm:text-[9px] font-mono tracking-wider uppercase text-zinc-400 group-hover:text-emerald-300">
              MEDKIT
            </span>
          </button>

          <!-- Item 4: Blade (Handsaw) -->
          <button
            type="button"
            :disabled="!canUseBlade"
            :class="[
              'group flex flex-col items-center transition-all duration-200 select-none focus:outline-none',
              canUseBlade ? 'cursor-pointer hover:-translate-y-1 hover:scale-105' : 'opacity-30 cursor-not-allowed filter grayscale',
            ]"
            title="Saw off barrel (Double damage)"
            @click="$emit('use-item', 'blade')"
          >
            <div class="relative">
              <svg class="w-7 h-7 sm:w-9 sm:h-9 drop-shadow" viewBox="0 0 48 48" fill="none">
                <path d="M10 32 L10 16 Q10 12 14 12 L38 12 Q42 12 42 16 L42 28" stroke="#6b7280" stroke-width="3" fill="none" stroke-linecap="round" />
                <line x1="10" y1="30" x2="42" y2="30" stroke="#f87171" stroke-width="2" stroke-dasharray="2,2" />
                <rect x="6" y="28" width="6" height="14" rx="2" fill="#78350f" stroke="#451a03" stroke-width="1.5" />
              </svg>
              <span class="absolute -top-1 -right-1 text-[7px] font-mono px-0.8 rounded font-bold border bg-red-950 border-red-500 text-red-300">
                {{ inventory.blade }}
              </span>
            </div>
            <span class="text-[8px] sm:text-[9px] font-mono tracking-wider uppercase text-zinc-400 group-hover:text-red-400">
              BLADE
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Magnifier Holographic Reveal Overlay Banner -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="revealedShell"
        class="absolute inset-x-3 top-1/2 -translate-y-1/2 z-40 max-w-sm mx-auto p-3 bg-[#0a0f12]/95 border-2 border-amber-500 rounded shadow-2xl backdrop-blur-md"
      >
        <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-800/60 font-mono text-[10px]">
          <span class="text-amber-400 font-bold tracking-widest flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            CHAMBER SCAN
          </span>
          <button
            type="button"
            class="text-zinc-400 hover:text-white px-1.5 py-0.2 rounded bg-zinc-800 text-[9px]"
            @click="$emit('dismiss-reveal')"
          >
            [CLOSE]
          </button>
        </div>

        <div class="text-center py-2">
          <div class="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-0.5">
            NEXT CHAMBER CONTENT:
          </div>
          <div
            :class="[
              'text-3xl font-black font-mono tracking-[0.2em] uppercase',
              revealedShell === 'live' ? 'text-red-500 animate-pulse' : 'text-cyan-400',
            ]"
          >
            {{ revealedShell }}
          </div>
        </div>
      </div>
    </Transition>

    <!-- BOTTOM SECTION: Local Player Vitals & Tactical Trigger HUD -->
    <div class="relative z-20 pb-0.5 sm:pb-1.5 px-1 sm:px-3 flex items-stretch justify-between flex-shrink-0 gap-1.5 sm:gap-3">
      <!-- Left: Local Player CRT Vitals Monitor -->
      <div v-if="me" class="w-28 sm:w-36 md:w-52 flex-shrink-0 flex flex-col justify-center">
        <CrtVitalsMonitor
          :player="me"
          :is-local="true"
          :is-turn="isMyTurn"
        />
      </div>

      <!-- Right: Tactical Trigger Controls Grid (Always 100% visible, never cut off) -->
      <div class="flex-1 min-w-0 flex flex-col justify-between gap-1 sm:gap-1.5">
        <!-- Target Selection Row (50% / 50% split) -->
        <div class="grid grid-cols-2 gap-1 w-full">
          <!-- Aim Self Button -->
          <button
            type="button"
            :disabled="!isMyTurn || actionPending || disabled"
            :class="[
              'w-full py-1.5 sm:py-2 px-1 rounded border font-mono text-[9px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 select-none flex items-center justify-center gap-1',
              aimTarget === 'self'
                ? 'bg-amber-600 text-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                : isMyTurn && !actionPending && !disabled
                ? 'bg-[#141618] hover:bg-[#1e2225] text-amber-200 border-amber-800/70 cursor-pointer active:scale-95'
                : 'bg-[#0f1011] text-zinc-600 border-zinc-800 opacity-40 cursor-not-allowed',
            ]"
            @click="selectAim('self')"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
            <span class="truncate">AIM SELF</span>
          </button>

          <!-- Aim Opponent Button -->
          <button
            type="button"
            :disabled="!isMyTurn || actionPending || disabled"
            :class="[
              'w-full py-1.5 sm:py-2 px-1 rounded border font-mono text-[9px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 select-none flex items-center justify-center gap-1',
              aimTarget === 'opponent'
                ? 'bg-red-600 text-white border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                : isMyTurn && !actionPending && !disabled
                ? 'bg-[#1a0e10] hover:bg-[#2c1317] text-red-200 border-red-800/70 cursor-pointer active:scale-95'
                : 'bg-[#0f1011] text-zinc-600 border-zinc-800 opacity-40 cursor-not-allowed',
            ]"
            @click="selectAim('opponent')"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
            <span class="truncate">AIM OPPONENT</span>
          </button>
        </div>

        <!-- Pull Trigger Action Button (Full width, big, bright, unmissable) -->
        <button
          type="button"
          :disabled="!isMyTurn || actionPending || disabled || !aimTarget"
          :class="[
            'w-full py-2 sm:py-2.5 rounded border font-mono text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-200 select-none flex items-center justify-center gap-1.5 shadow-lg',
            aimTarget && isMyTurn && !actionPending && !disabled
              ? 'bg-[#A71922] hover:bg-[#D33B42] text-white border-red-400 shadow-[0_0_20px_rgba(167,25,34,0.8)] cursor-pointer active:scale-95 animate-pulse'
              : 'bg-[#121314] text-zinc-600 border-zinc-800 opacity-40 cursor-not-allowed',
          ]"
          @click="pullTrigger"
        >
          <span>{{ actionPending ? 'RECOIL...' : sawedOff ? '💥 PULL TRIGGER (2X)' : '💥 PULL TRIGGER' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type {
  PublicPlayerState,
  ShellType,
  ItemType,
  ShootTarget,
  PlayerInventory,
} from '../../types/game';
import CrtVitalsMonitor from './CrtVitalsMonitor.vue';

const props = defineProps<{
  me: PublicPlayerState | null;
  opponent: PublicPlayerState | null;
  roundNumber: number;
  shellsRemaining: number;
  totalRoundShells: number;
  sawedOff?: boolean;
  roundLiveCount?: number;
  roundBlankCount?: number;
  currentTurn: string | null;
  isMyTurn: boolean;
  actionPending: boolean;
  disabled?: boolean;
  revealedShell: ShellType | null;
  shotAnimation: 'idle' | 'aiming' | 'firing_live' | 'firing_blank';
}>();

const emit = defineEmits<{
  (e: 'shoot', target: ShootTarget): void;
  (e: 'use-item', item: ItemType): void;
  (e: 'dismiss-reveal'): void;
}>();

const aimTarget = ref<ShootTarget | null>('opponent');

const inventory = computed<PlayerInventory>(() => {
  return props.me?.inventory || { magnifier: 0, cuffs: 0, medkit: 0, blade: 0 };
});

const canUseMagnifier = computed(() => {
  return (
    props.isMyTurn &&
    !props.actionPending &&
    !props.disabled &&
    inventory.value.magnifier > 0
  );
});

const canUseCuffs = computed(() => {
  return (
    props.isMyTurn &&
    !props.actionPending &&
    !props.disabled &&
    inventory.value.cuffs > 0
  );
});

const canUseMedkit = computed(() => {
  return (
    props.isMyTurn &&
    !props.actionPending &&
    !props.disabled &&
    inventory.value.medkit > 0 &&
    (props.me?.health || 0) < (props.me?.maxHealth || 4)
  );
});

const canUseBlade = computed(() => {
  return (
    props.isMyTurn &&
    !props.actionPending &&
    !props.disabled &&
    inventory.value.blade > 0 &&
    !props.sawedOff
  );
});

function selectAim(target: ShootTarget) {
  if (!props.isMyTurn || props.actionPending || props.disabled) return;
  aimTarget.value = target;
}

function onShotgunClick() {
  if (!props.isMyTurn || props.actionPending || props.disabled) return;
  aimTarget.value = aimTarget.value === 'opponent' ? 'self' : 'opponent';
}

function pullTrigger() {
  if (!props.isMyTurn || props.actionPending || props.disabled || !aimTarget.value) return;
  emit('shoot', aimTarget.value);
}
</script>

<style scoped>
@keyframes breathe {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-2px) scale(1.015); }
}

.animate-breathing {
  animation: breathe 4.5s ease-in-out infinite;
}

.aim-opponent-smooth {
  transform: translateY(-40px) rotate(-6deg) scale(1.1);
  filter: drop-shadow(0 15px 25px rgba(167, 25, 34, 0.5));
}

.aim-self-smooth {
  transform: translateY(32px) rotate(180deg) scale(1.14);
  filter: drop-shadow(0 -15px 25px rgba(245, 158, 11, 0.5));
  animation: jitter 0.15s infinite linear;
}

@keyframes jitter {
  0% { transform: translateY(32px) rotate(180deg) scale(1.14); }
  50% { transform: translateY(31px) rotate(180.8deg) scale(1.142); }
  100% { transform: translateY(32px) rotate(180deg) scale(1.14); }
}
</style>
