// Simplified phoneme inventory — ARPAbet-lite, no stress markers.
// Each ID maps to a pre-baked .ogg registered in sound_definitions.json
// as `verity.phoneme.<id>`.
export const PHONEMES = [
    "p","b","t","d","k","g","f","v","th","dh","s","z","sh","zh","ch","jh",
    "m","n","ng","l","r","w","y","h",
    "aa","ae","ah","ao","eh","er","ey","ih","iy","ow","uw","uh","ay","aw","oy"
];

// Greedy longest-match grapheme patterns, checked before single-letter fallback.
// Sorted longest-first so e.g. "tion" matches before "ti"/"t".
const PATTERNS = [
    ["tion", ["sh","ah","n"]], ["sion", ["zh","ah","n"]],
    ["ough", ["ah","f"]], ["augh", ["ae","f"]], ["eigh", ["ey"]], ["igh", ["ay"]],
    ["tch", ["ch"]], ["sch", ["s","k"]],
    ["ck", ["k"]], ["ph", ["f"]], ["th", ["th"]], ["sh", ["sh"]], ["ch", ["ch"]],
    ["wh", ["w"]], ["ng", ["ng"]], ["qu", ["k","w"]],
    ["ee", ["iy"]], ["ea", ["iy"]], ["oo", ["uw"]], ["ou", ["aw"]], ["ow", ["ow"]],
    ["oy", ["oy"]], ["oi", ["oy"]], ["ay", ["ey"]], ["ai", ["ey"]],
    ["au", ["ao"]], ["aw", ["ao"]], ["ar", ["aa","r"]], ["or", ["ao","r"]],
    ["er", ["er"]], ["ur", ["er"]], ["ie", ["ay"]]
];

const SINGLE = {
    a:"ae", b:"b", c:"k", d:"d", e:"eh", f:"f", g:"g", h:"h", i:"ih", j:"jh",
    k:"k", l:"l", m:"m", n:"n", o:"ao", p:"p", q:"k", r:"r", s:"s", t:"t",
    u:"ah", v:"v", w:"w", x:["k","s"], y:"y", z:"z"
};

// Whole-word exceptions for pronunciations the spelling-pattern rules above
// get wrong. This is a growing list, not exhaustive — add to it as
// mispronounced words surface. Two known failure classes that land here:
//  - "th" defaults to unvoiced (as in "thin"), but many common words use
//    voiced "dh" (as in "this") — not predictable from spelling alone.
//  - the standalone pronoun "i" is the "ay" diphthong (as in "eye"), not
//    the short "ih" the single-letter fallback would give it.
const WORD_OVERRIDES = {
    i: ["ay"],
    anything: ["eh","n","iy","th","ih","ng"],
    anybody: ["eh","n","iy","b","aa","d","iy"],
    anyone: ["eh","n","iy","w","ah","n"],
    anywhere: ["eh","n","iy","w","eh","r"],
    anymore: ["eh","n","iy","m","ao","r"],
    any: ["eh","n","iy"],
    further: ["f","er","dh","er"],
    this: ["dh","ih","s"],
    that: ["dh","ae","t"],
    these: ["dh","iy","z"],
    those: ["dh","ow","z"],
    they: ["dh","ey"],
    them: ["dh","eh","m"],
    their: ["dh","eh","r"],
    then: ["dh","eh","n"],
    than: ["dh","ae","n"],
    though: ["dh","ow"],
    there: ["dh","eh","r"],
    the: ["dh","ah"],
    other: ["ah","dh","er"],
    another: ["ah","n","ah","dh","er"],
    mother: ["m","ah","dh","er"],
    father: ["f","aa","dh","er"],
    brother: ["b","r","ah","dh","er"],
    rather: ["r","ae","dh","er"],
    together: ["t","ah","g","eh","dh","er"],
    weather: ["w","eh","dh","er"],
    gather: ["g","ae","dh","er"],
    either: ["iy","dh","er"],
    neither: ["n","iy","dh","er"],
};

// Diphone lookup — phoneme-pair -> registered diphone sound id
// (verity.diphone.<id> in sound_definitions.json). Only pairs listed here
// get substituted; anything absent falls back to the two separate
// monophones, so this degrades gracefully as you record more.
//
// Key format: "<phoneme1>_<phoneme2>". Add an entry only once you've
// actually recorded and trimmed that diphone clip (see diphone recording
// workflow — carrier word, cut at steady-state midpoints).
const DIPHONES = new Map([
    // All 70 recommended pairs — enabled now that clips exist. Remember:
    // each of these needs verity.diphone.<id> registered in
    // sound_definitions.json before this will actually play anything.
    ["y_aw", "y-aw"],
    ["ae_t", "ae-t"],
    ["n_ao", "n-ao"],
    ["ae_n", "ae-n"],
    ["eh_s", "eh-s"],
    ["m_eh", "m-eh"],
    ["ao_n", "ao-n"],
    ["s_t", "s-t"],
    ["ih_ng", "ih-ng"],
    ["t_ao", "t-ao"],
    ["ao_r", "ao-r"],
    ["r_eh", "r-eh"],
    ["d_ao", "d-ao"],
    ["dh_ae", "dh-ae"],
    ["eh_n", "eh-n"],
    ["ih_t", "ih-t"],
    ["l_l", "l-l"],
    ["l_ao", "l-ao"],
    ["n_d", "n-d"],
    ["dh_ih", "dh-ih"],
    ["ih_n", "ih-n"],
    ["aa_r", "aa-r"],
    ["v_eh", "v-eh"],
    ["n_t", "n-t"],
    ["t_eh", "t-eh"],
    ["ae_l", "ae-l"],
    ["ae_s", "ae-s"],
    ["ao_t", "ao-t"],
    ["w_ae", "w-ae"],
    ["n_eh", "n-eh"],
    ["t_ih", "t-ih"],
    ["ao_m", "ao-m"],
    ["er_eh", "er-eh"],
    ["k_w", "k-w"],
    ["dh_ah", "dh-ah"],
    ["k_eh", "k-eh"],
    ["d_eh", "d-eh"],
    ["s_ao", "s-ao"],
    ["s_eh", "s-eh"],
    ["ih_s", "ih-s"],
    ["w_eh", "w-eh"],
    ["k_ae", "k-ae"],
    ["t_ae", "t-ae"],
    ["ae_k", "ae-k"],
    ["l_eh", "l-eh"],
    ["eh_l", "eh-l"],
    ["eh_k", "eh-k"],
    ["k_ao", "k-ao"],
    ["eh_d", "eh-d"],
    ["v_er", "v-er"],
    ["b_eh", "b-eh"],
    ["f_ao", "f-ao"],
    ["ih_l", "ih-l"],
    ["ah_n", "ah-n"],
    ["ao_s", "ao-s"],
    ["iy_d", "iy-d"],
    ["h_ae", "h-ae"],
    ["n_ow", "n-ow"],
    ["ih_k", "ih-k"],
    ["d_ih", "d-ih"],
    ["r_iy", "r-iy"],
    ["m_ao", "m-ao"],
    ["l_ay", "l-ay"],
    ["r_ae", "r-ae"],
    ["ih_m", "ih-m"],
    ["ae_m", "ae-m"],
    ["m_ae", "m-ae"],
    ["s_ae", "s-ae"],
    ["w_ao", "w-ao"],
    ["l_ih", "l-ih"],
]);

// Recording checklist, not live — the 30 most frequent phoneme-pairs found
// by scanning this file's own dialogue strings (~55k words) through
// wordToPhonemes(), ranked by occurrence count. `carrier` is a real word
// from the dialogue corpus that contains this exact transition — use it,
// or any other natural word with the same pair, as the carrier word when
// recording (see diphone recording workflow: say the carrier normally,
// trim at the steady-state midpoint of each flanking phone).
export const RECOMMENDED_DIPHONES = [
    { pair: "y_aw",  id: "y-aw",  count: 2342, carrier: "you"  },
    { pair: "ae_t",  id: "ae-t",  count: 2292, carrier: "at"   },
    { pair: "n_ao",  id: "n-ao",  count: 2232, carrier: "no"   },
    { pair: "ae_n",  id: "ae-n",  count: 2216, carrier: "an"   },
    { pair: "eh_s",  id: "eh-s",  count: 2143, carrier: "yes"  },
    { pair: "m_eh",  id: "m-eh",  count: 2036, carrier: "me"   },
    { pair: "ao_n",  id: "ao-n",  count: 1935, carrier: "on"   },
    { pair: "s_t",   id: "s-t",   count: 1868, carrier: "just" },
    { pair: "ih_ng", id: "ih-ng", count: 1856, carrier: "something" },
    { pair: "t_ao",  id: "t-ao",  count: 1657, carrier: "to"   },
    { pair: "ao_r",  id: "ao-r",  count: 1640, carrier: "or"   },
    { pair: "r_eh",  id: "r-eh",  count: 1528, carrier: "rest" },
    { pair: "d_ao",  id: "d-ao",  count: 1522, carrier: "do"   },
    { pair: "dh_ae", id: "dh-ae", count: 1448, carrier: "that" },
    { pair: "eh_n",  id: "eh-n",  count: 1398, carrier: "ten"  },
    { pair: "ih_t",  id: "ih-t",  count: 1354, carrier: "it"   },
    { pair: "l_l",   id: "l-l",   count: 1345, carrier: "will" },
    { pair: "l_ao",  id: "l-ao",  count: 1285, carrier: "long" },
    { pair: "n_d",   id: "n-d",   count: 1263, carrier: "and"  },
    { pair: "dh_ih", id: "dh-ih", count: 1240, carrier: "this" },
    { pair: "ih_n",  id: "ih-n",  count: 1206, carrier: "in"   },
    { pair: "aa_r",  id: "aa-r",  count: 1202, carrier: "are"  },
    { pair: "v_eh",  id: "v-eh",  count: 1180, carrier: "vest" },
    { pair: "n_t",   id: "n-t",   count: 1173, carrier: "want" },
    { pair: "t_eh",  id: "t-eh",  count: 1147, carrier: "tell" },
    { pair: "ae_l",  id: "ae-l",  count: 1137, carrier: "all"  },
    { pair: "ae_s",  id: "ae-s",  count: 1099, carrier: "as"   },
    { pair: "ao_t",  id: "ao-t",  count: 1083, carrier: "not"  },
    { pair: "w_ae",  id: "w-ae",  count: 1076, carrier: "was"  },
    { pair: "n_eh",  id: "n-eh",  count: 984,  carrier: "nest" },

    // Ranks 31-70. `real: false` = the auto-picked carrier is a fragment
    // or not a standalone English word (from a short/partial match in the
    // dialogue word list) — swap in your own natural word containing that
    // same pair before recording; don't type the fragment itself into
    // Fish Audio.
    { pair: "t_ih",  id: "t-ih",  count: 928, carrier: "tip",  real: true },
    { pair: "ao_m",  id: "ao-m",  count: 926, carrier: "mom",  real: true  },
    { pair: "er_eh", id: "er-eh", count: 925, carrier: "here", real: true  },
    { pair: "k_w",   id: "k-w",   count: 919, carrier: "quick", real: true },
    { pair: "dh_ah", id: "dh-ah", count: 907, carrier: "the",  real: true  },
    { pair: "k_eh",  id: "k-eh",  count: 899, carrier: "ice",  real: true  },
    { pair: "d_eh",  id: "d-eh",  count: 878, carrier: "desk", real: true },
    { pair: "s_ao",  id: "s-ao",  count: 872, carrier: "so",   real: true  },
    { pair: "s_eh",  id: "s-eh",  count: 836, carrier: "set",  real: true },
    { pair: "ih_s",  id: "ih-s",  count: 834, carrier: "is",   real: true  },
    { pair: "w_eh",  id: "w-eh",  count: 812, carrier: "we",   real: true  },
    { pair: "k_ae",  id: "k-ae",  count: 801, carrier: "cat",  real: true },
    { pair: "t_ae",  id: "t-ae",  count: 749, carrier: "tap",  real: true },
    { pair: "ae_k",  id: "ae-k",  count: 737, carrier: "back", real: true },
    { pair: "l_eh",  id: "l-eh",  count: 725, carrier: "let",  real: true },
    { pair: "eh_l",  id: "eh-l",  count: 722, carrier: "bell", real: true },
    { pair: "eh_k",  id: "eh-k",  count: 714, carrier: "neck", real: true },
    { pair: "k_ao",  id: "k-ao",  count: 705, carrier: "cost", real: true },
    { pair: "eh_d",  id: "eh-d",  count: 703, carrier: "fed",  real: true  },
    { pair: "v_er",  id: "v-er",  count: 646, carrier: "ever", real: true },
    { pair: "b_eh",  id: "b-eh",  count: 638, carrier: "be",   real: true  },
    { pair: "f_ao",  id: "f-ao",  count: 627, carrier: "for",  real: true  },
    { pair: "ih_l",  id: "ih-l",  count: 615, carrier: "bill", real: true },
    { pair: "ah_n",  id: "ah-n",  count: 609, carrier: "under", real: true },
    { pair: "ao_s",  id: "ao-s",  count: 600, carrier: "boss", real: true },
    { pair: "iy_d",  id: "iy-d",  count: 595, carrier: "need", real: true  },
    { pair: "h_ae",  id: "h-ae",  count: 594, carrier: "ha",   real: true  },
    { pair: "n_ow",  id: "n-ow",  count: 587, carrier: "now",  real: true  },
    { pair: "ih_k",  id: "ih-k",  count: 583, carrier: "ice",  real: true  },
    { pair: "d_ih",  id: "d-ih",  count: 574, carrier: "did",  real: true },
    { pair: "r_iy",  id: "r-iy",  count: 568, carrier: "read", real: true },
    { pair: "m_ao",  id: "m-ao",  count: 565, carrier: "mop",  real: true },
    { pair: "l_ay",  id: "l-ay",  count: 559, carrier: "fly",  real: true  },
    { pair: "r_ae",  id: "r-ae",  count: 553, carrier: "rat",  real: true },
    { pair: "ih_m",  id: "ih-m",  count: 546, carrier: "him",  real: true },
    { pair: "ae_m",  id: "ae-m",  count: 529, carrier: "am",   real: true  },
    { pair: "m_ae",  id: "m-ae",  count: 525, carrier: "man",  real: true  },
    { pair: "s_ae",  id: "s-ae",  count: 524, carrier: "sat",  real: true },
    { pair: "w_ao",  id: "w-ao",  count: 521, carrier: "won",  real: true  },
    { pair: "l_ih",  id: "l-ih",  count: 516, carrier: "lit",  real: true  },
];

/** Greedily merge adjacent phoneme pairs into diphones where available.
 *  Returns array of { unit, isDiphone }.
 */
function mergeDiphones(phones) {
    const out = [];
    let i = 0;
    while (i < phones.length) {
        if (i + 1 < phones.length) {
            const key = `${phones[i]}_${phones[i + 1]}`;
            const diphoneId = DIPHONES.get(key);
            if (diphoneId) {
                out.push({ unit: diphoneId, isDiphone: true });
                i += 2;
                continue;
            }
        }
        out.push({ unit: phones[i], isDiphone: false });
        i += 1;
    }
    return out;
}

/** word (lowercase, letters only) -> phoneme ID array */
export function wordToPhonemes(word) {
    if (WORD_OVERRIDES[word]) return [...WORD_OVERRIDES[word]];

    const out = [];
    let i = 0;
    outer:
    while (i < word.length) {
        for (const [pattern, phones] of PATTERNS) {
            if (word.startsWith(pattern, i)) {
                out.push(...phones);
                i += pattern.length;
                continue outer;
            }
        }
        // 'y' behaves differently depending on position:
        //  - word-initial (yes, you): consonant glide
        //  - word-final, with an earlier vowel letter (happy, city, any):
        //    unstressed "ee" vowel
        //  - word-final, no earlier vowel (fly, my, try, sky): part of the
        //    "eye" diphthong
        //  - mid-word otherwise (gym, myth, system): short "ih"
        if (word[i] === "y" && i > 0) {
            const isFinal = i === word.length - 1;
            if (isFinal) {
                const hasEarlierVowel = /[aeiou]/.test(word.slice(0, i));
                out.push(hasEarlierVowel ? "iy" : "ay");
            } else {
                out.push("ih");
            }
            i++;
            continue;
        }
        const single = SINGLE[word[i]];
        if (single) out.push(...(Array.isArray(single) ? single : [single]));
        i++;
    }
    return out;
}

/** Full text -> array of { unit, isDiphone, pauseAfterMs } including punctuation pauses */
export function textToPhonemeSequence(text) {
    const sequence = [];
    const tokens = text.toLowerCase().match(/[a-z]+|[.,!?;]/g) ?? [];

    for (const token of tokens) {
        if (/[a-z]/.test(token)) {
            const phones = wordToPhonemes(token);
            const units = mergeDiphones(phones);
            units.forEach((u, idx) => {
                sequence.push({
                    unit: u.unit,
                    isDiphone: u.isDiphone,
                    pauseAfterMs: idx === units.length - 1 ? 90 : 20
                });
            });
        } else if (token === "," || token === ";") {
            sequence.push({ unit: null, isDiphone: false, pauseAfterMs: 180 });
        } else {
            sequence.push({ unit: null, isDiphone: false, pauseAfterMs: 350 }); // . ! ?
        }
    }
    return sequence;
}
