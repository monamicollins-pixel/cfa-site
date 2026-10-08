/*
 * CFA — SHARED LEARNER NAME VALIDATION
 *
 * One authoritative validator for signup and learner display.
 *
 * Accepts:
 *   Camille
 *   CAMILLE
 *   Jean-Pierre
 *   JEAN-PIERRE
 *   Jean Pierre
 *   O'Connor
 *   Élodie
 *   ÉLODIE
 *
 * Rejects:
 *   lowercase-only names
 *   profanity / abusive names
 *   obvious junk/system names
 *   numbers
 *   emojis
 *   URLs
 *   unsupported symbols
 */

(function () {
    "use strict";

    const TITLE_CASE_PATTERN =
        /^[\p{Lu}][\p{Ll}\p{M}]*(?:[ .'-][\p{Lu}][\p{Ll}\p{M}]*)*$/u;

    const FULL_CAPS_PATTERN =
        /^[\p{Lu}]+(?:[ .'-][\p{Lu}]+)*$/u;

    /*
     * Deliberately case-insensitive.
     *
     * This list is for clearly inappropriate, abusive,
     * obscene, hateful, deceptive or system-style entries.
     *
     * It is NOT intended to determine whether a cultural,
     * ethnic or uncommon real-world name is legitimate.
     */
    const BLOCKED_NAMES = new Set([
        /* Profanity / vulgarity */
        "fuck",
        "fucker",
        "fucking",
        "motherfucker",
        "fuckface",
        "shit",
        "shitty",
        "shithead",
        "shitface",
        "bullshit",
        "bitch",
        "bitches",
        "bastard",
        "asshole",
        "arsehole",
        "asshat",
        "asswipe",
        "dick",
        "dickhead",
        "pussy",
        "cunt",
        "cock",
        "prick",
        "twat",
        "wanker",
        "jerkoff",
        "jackass",
        "dumbass",
        "dipshit",
        "douche",
        "douchebag",
        "sonofabitch",

        /* Sexual / obscene */
        "whore",
        "slut",
        "hoe",
        "hooker",
        "porn",
        "porno",
        "pornography",
        "sex",
        "sexy",
        "nude",
        "nudes",
        "xxx",
        "nsfw",

        /* Insults / abusive terminology */
        "idiot",
        "stupid",
        "moron",
        "imbecile",
        "dumb",
        "loser",
        "fool",
        "scum",
        "trash",
        "garbage",
        "pathetic",
        "creep",
        "creepy",
        "retard",
        "retarded",

        /* Hate / slur terminology */
        "nigger",
        "nigga",
        "chink",
        "gook",
        "kike",
        "spic",
        "wetback",
        "cracker",
        "honky",
        "coon",
        "fag",
        "faggot",
        "dyke",
        "tranny",

        /* Fake / system / placeholder identities */
        "test",
        "testing",
        "admin",
        "administrator",
        "asdf",
        "qwerty",
        "none",
        "null",
        "anonymous",
        "unknown",
        "user",
        "username",
        "guest",
        "root",
        "superuser",

        /* Known project-specific inappropriate entry */
        "punami"
    ]);

    function normalize(value) {
        return String(value ?? "")
            .normalize("NFKC")
            .trim()
            .replace(/\s+/gu, " ");
    }

    function blocklistKey(value) {
        return normalize(value)
            .toLocaleLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/gu, "");
    }

    function hasBlockedName(value) {
        const key = blocklistKey(value);

        if (!key) {
            return false;
        }

        const words = key
            .split(/[ .'-]+/u)
            .filter(Boolean);

        return (
            BLOCKED_NAMES.has(key) ||
            words.some(word => BLOCKED_NAMES.has(word))
        );
    }

    function hasValidStructure(value) {
        return (
            TITLE_CASE_PATTERN.test(value) ||
            FULL_CAPS_PATTERN.test(value)
        );
    }

    function validateName(value) {
        const name = normalize(value);

        if (!name) {
            return {
                valid: false,
                reason: "empty",
                message: "Veuillez saisir votre prénom."
            };
        }

        if (name.length < 2 || name.length > 40) {
            return {
                valid: false,
                reason: "length",
                message: "Votre prénom doit contenir entre 2 et 40 caractères."
            };
        }

        if (!hasValidStructure(name)) {
            return {
                valid: false,
                reason: "format",
                message:
                    "Utilisez un prénom avec une majuscule au début de chaque mot ou écrivez-le entièrement en MAJUSCULES."
            };
        }

        if (hasBlockedName(name)) {
            return {
                valid: false,
                reason: "blocked",
                message: "Veuillez saisir un prénom approprié."
            };
        }

        return {
            valid: true,
            value: name,
            reason: null,
            message: ""
        };
    }

    window.CFANameValidation = Object.freeze({
        normalize,
        hasBlockedName,
        hasValidStructure,
        validateName
    });
})();
