// ─────────────────────────────────────────────────────────────
// loreContent.js — all compendium text for The Between
// Tone: romantic end-of-the-world. Elegiac, melancholy, beautiful
// decay. Never horror, never dread. Things end gently here.
// ─────────────────────────────────────────────────────────────

export const WORLD_LORE = {
  title: 'The Between',
  paragraphs: [
    `The Between is not a place you arrive at. It is a place you stop leaving. Somewhere between the last breath and whatever comes after, there is water — still, flooded, endless — and ruins that were never quite finished being built. Gold light moves through the clouds here, though no one has ever found where it comes from. It is beautiful. That is the cruelest part.`,

    `No one remembers crossing over. One moment there was a life, urgent and unfinished, and the next there is only the water, the stairs that lead to nowhere, and the quiet. The Between does not take anyone by force. It simply waits, patient as architecture, until something in you stops fighting the current.`,

    `The water here has never been measured. It does not rise. It does not recede. Some who have walked it far enough say it remembers footsteps that were never taken — that if you stand still long enough, you can watch ripples form from someone who hasn't arrived yet. No one stays still long enough to confirm it.`,

    `Spires, stairways, half-finished cathedrals — the Between is full of structures that lead nowhere and were never meant to. They were not built for shelter. They were built the way memory builds a room you used to live in: approximately, beautifully, with doors that open onto more water. Nothing here was ever completed. Nothing here ever needed to be.`,

    `Most who speak of the Between describe it as peaceful before they describe it as wrong. There is no violence in its design — only stillness, and the slow erosion of urgency. People who stay do not scream. They settle, the way light settles on water at the end of a long day. The horror, if there is any, is how easy it is to want to stay.`,

    `There is no morning here, though the light changes as if there were one. There is no night, though the gold dims sometimes, the way a held breath eventually has to be let go. Those who have been here longest stop counting. Counting implies an end, and the Between was never interested in being finished.`,

    `Not everyone who arrives stops moving. A few keep walking — toward the spires in the distance, toward whatever the Cartographer has mapped for them. No one knows what waits at the end of that path. Only that some people would rather find out than rest.`,

    `No one who has reached the end of the Cartographer's map has ever come back to describe it. This may mean there is nothing there. It may mean there is everything. The Between, true to its nature, offers no comfort either way — only the path, and the quiet certainty that someone, eventually, will choose to walk it.`,
  ],
}

export const CHARACTER_LORE = {
  kaen: {
    name: 'Kaen',
    title: 'The Armoured',
    role: 'Heavy Combatant',
    shortLore: 'He has been here longer than memory. He does not know why. He knows only that he is still standing.',
    fullLore: [
      `Kaen does not remember the world before the water. He remembers the weight of his armour, the cold of it against his skin on the first morning he woke here, and nothing else. Whether he chose this armour or it chose him, he has stopped asking.`,
      `He fights not because he believes he can leave, but because stopping feels like a kind of agreement he is not ready to make. Every Remnant he puts down is one more morning he does not have to decide whether today is the day he sits in the water and stays.`,
      `He does not speak often. When he does, it is usually to the dead.`,
    ],
  },
  sable: {
    name: 'Sable',
    title: 'The Unseen',
    role: 'Precision Assassin',
    shortLore: 'She speaks rarely. When she does, it sounds like she is reading from something written a long time ago.',
    fullLore: [
      `Sable moves like someone who has already decided how this ends. She does not waste motion, does not waste breath, does not waste hope. Whatever brought her here, she made her peace with it before her boots ever touched the water.`,
      `Unlike Kaen, she does not fight the Between out of defiance. She fights it the way a scholar finishes a sentence — because it was already begun, because stopping halfway would be its own kind of wrong.`,
      `She is faster than anything that hunts here. She has never needed to ask why.`,
    ],
  },
}

export const BESTIARY = {
  remnant: {
    name: 'The Remnant',
    tier: 'Standard Encounter',
    origin: `What's left when a person stops being a person but hasn't yet stopped moving. Most who settle into the Between become this, eventually — it is not a transformation so much as a forgetting.`,
    behavior: `The Remnant does not hunt. It reaches, the way a sleeper's hand reaches for someone no longer beside them. It is not malicious — it does not hate the living. It simply forgot, somewhere along the way, what hands are for besides reaching.`,
    whyItFights: `It does not fight to survive, only to keep moving — the last instinct a person carries after everything else has gone quiet. Stillness, to a Remnant, is the only true ending.`,
    appearance: `Spectral, half-formed, draped in whatever it wore on the day it stopped counting days. Water clings to it like memory clings to a name you've almost forgotten.`,
    defeatLines: [
      "You'll stay now. Like the rest of us.",
      "It's quieter here. You'll see.",
      "No one finishes. Not even you.",
      "Rest. You were never going to leave.",
      "We were like you once. Still walking.",
      "The Between keeps what it catches.",
    ],
  },
  unfinished: {
    name: 'The Unfinished',
    tier: 'Elite Encounter',
    origin: `Some who arrive in the Between never fully become Remnants. They stay caught halfway — aware enough to almost remember themselves, lost enough to never quite manage it.`,
    behavior: `The Unfinished fights with the desperation of someone trying to complete a sentence they've forgotten the end of. It is faster than a Remnant, more deliberate, because some fragment of will still remains — fraying, but not yet gone.`,
    whyItFights: `It believes, in whatever way a half-formed thing can believe anything, that finishing this fight will finish whatever it left unfinished in life. It is wrong. It fights anyway.`,
    appearance: `More solid than a Remnant, more human in outline, but flickering at the edges — like a person and the memory of that person occupying the same space, neither one fully winning.`,
    defeatLines: [
      "I was almost something. So were you.",
      "You can't finish what I couldn't.",
      "We're the same now. Incomplete.",
      "Stay. Help me become.",
    ],
  },
  cartographer: {
    name: 'The Cartographer',
    tier: 'Final Boss',
    origin: `Before the Between, the Cartographer mapped places that wanted to be found — coastlines, mountain passes, the edges of empires. It was good at its work. It is still good at its work.`,
    behavior: `It does not reach, does not stumble, does not forget. The Cartographer moves with the calm precision of someone who has already seen how this ends, because in a way, it has — it mapped your path the moment you crossed into the Between.`,
    whyItFights: `Not for survival, and not from confusion like the others. The Cartographer fights because every battle is another line added to a map that was always going to include you. It is not cruel. It is simply thorough.`,
    appearance: `Tall, composed, dressed in the remains of something that was once formal — a cartographer's coat, ink-stained hands. It carries no visible weapon. It has never needed one.`,
    defeatLines: [
      "I marked your path the moment you arrived.",
      "Another road, ending where they all end. Here.",
      "I have a place for you on the map already.",
      "You walked exactly as I drew it.",
    ],
  },
}

export const HOW_TO_PLAY = [
  {
    heading: 'HP — Health',
    text: 'Your life total. Reach zero and the run ends. Kaen carries more HP than Sable — he is built to endure. Sable is built to never be hit at all.',
  },
  {
    heading: 'Stamina (ST)',
    text: 'Every card costs Stamina to play. You restore to full Stamina at the start of each turn, so spend freely — but plan your hand around what you can actually afford.',
  },
  {
    heading: 'Posture',
    text: 'Both you and your enemy have a posture bar. Landing hits builds the enemy\'s posture; taking hits builds yours. When a posture bar fills completely, that combatant staggers — open to a devastating follow-up strike.',
  },
  {
    heading: 'Enemy Intent',
    text: 'Before the enemy acts, you\'ll see what they\'re about to do — an attack, a guard, or something else. Use this to decide whether to push damage, defend, or reposition.',
  },
  {
    heading: 'Card Draw',
    text: 'Each turn you draw 4 cards from your deck. You won\'t see the same hand twice in a row — the deck holds back what you just played so every turn feels different. Don\'t like your hand? Redraw once per turn for 2 Stamina.',
  },
  {
    heading: 'Rewards',
    text: 'Win a fight and the Between offers you something — a new card, an upgrade to an existing one, or a permanent boost to your stats. You may also choose to take nothing. Choose carefully; you won\'t always get another chance.',
  },
  {
    heading: 'Risk and Consequence',
    text: 'Losing does not always mean the same thing. On Floor I, a loss simply lets you try again — though you won\'t earn a reward for a repeated attempt. On Floor II, a loss sends you back to its beginning, and any progress made there is lost. Falling to the Cartographer at the very end resets the entire path. Choose your fights, and your rewards, with that in mind.',
  },
  {
    heading: 'Fleeing',
    text: 'You may flee a fight at any time, but the Between does not forgive an unfinished battle gently — fleeing counts as a loss, with no reward, exactly as if you had been defeated.',
  },
]

export const SYNERGIES = {
  kaen: [
    {
      combo: 'Shield Bash → Greatsword Strike',
      why: 'Shield Bash builds heavy posture cheaply. Once the enemy staggers, Greatsword Strike\'s damage multiplies — turning a setup card into a finisher.',
    },
    {
      combo: 'Endure → Ruin Strike',
      why: 'Endure costs almost nothing and steadies your posture. Ruin Strike scales with missing HP — so the worse your fight is going, the harder you hit back.',
    },
    {
      combo: 'Rally → Shatter',
      why: 'Rally clears your own posture, buying you room to commit to Shatter\'s heavy posture-break swing without fear of being staggered yourself first.',
    },
  ],
  sable: [
    {
      combo: 'Bleed Edge → Exploit',
      why: 'Bleed Edge builds enemy posture efficiently. The moment they stagger, Exploit becomes available — and its damage is the highest burst in Sable\'s kit.',
    },
    {
      combo: 'Vanish → Slit Throat',
      why: 'Vanish nullifies an incoming hit entirely. Slit Throat can only be used while evading — chain them together for a defensive dodge that becomes a lethal counter.',
    },
    {
      combo: 'Death Mark → any damaging card',
      why: 'Death Mark adds bonus damage to your next hit, regardless of what it is. Pair it with Shadow Strike for a cheap, reliable burst.',
    },
  ],
}

export const CREDITS = {
  music: {
    label: 'Music',
    text: 'Music by Douglas Gustafson from Pixabay',
    link: 'https://pixabay.com/users/psychronic-13092015/',
  },
  art: {
    label: 'Art',
    text: 'All character and environment art is AI-generated, exclusive to this project.',
  },
  creator: {
    label: 'Created by',
    text: 'Yogita Builds — © 2026. All rights reserved.',
  },
}