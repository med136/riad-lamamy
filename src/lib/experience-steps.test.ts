import assert from "node:assert/strict";
import test from "node:test";
import {
  EXPERIENCE_STEPS_SETTING_KEY,
  legacyExperienceSteps,
  MAX_EXPERIENCE_STEPS,
  parseExperienceSteps,
  validateExperienceSteps,
  type ExperienceStep,
} from "./experience-steps.ts";

const text = { time: "MATIN", title: "Visite de Fès", description: "Découverte des souks" };
const en = { time: "MORNING", title: "Visit Fes", description: "Exploring the souks" };
const one: ExperienceStep = { id: "morning", icon: "sunrise", fr: text, en };

test("legacy content remains in the same order with existing translated values", () => {
  const steps = legacyExperienceSteps((key, language) => `${language}:${key}`);
  assert.deepEqual(steps.map(({ id }) => id), ["morning", "afternoon", "evening", "night"]);
  assert.equal(steps[0].fr.title, "fr:home.experience.morning_title");
  assert.equal(steps[0].en.description, "en:home.experience.morning_description");
  assert.equal(steps[1].icon, "compass");
});

test("accepts extra stages, stable ordering and bilingual content", () => {
  const steps = [one, { ...one, id: "step_added", icon: "chef-hat" as const }];
  assert.deepEqual(parseExperienceSteps(steps), steps);
  assert.equal(validateExperienceSteps(steps), null);
  assert.equal(EXPERIENCE_STEPS_SETTING_KEY, "experienceSteps");
});

test("an explicit empty list means no stages, unlike missing settings", () => {
  assert.deepEqual(parseExperienceSteps([]), []);
  assert.equal(validateExperienceSteps([]), null);
  assert.equal(parseExperienceSteps(undefined), null);
});

test("rejects duplicate identifiers, invalid icons and malformed records", () => {
  assert.equal(parseExperienceSteps([one, one]), null);
  assert.equal(parseExperienceSteps([{ ...one, icon: "unknown-icon" }]), null);
  assert.equal(parseExperienceSteps([{ ...one, id: "../../../secret" }]), null);
  assert.equal(parseExperienceSteps([{ ...one, fr: { ...text, title: 9 } }]), null);
});

test("requires a bilingual title before publishing but permits empty draft fields", () => {
  const draft = { ...one, fr: { ...text, title: "" } };
  assert.ok(parseExperienceSteps([draft]));
  assert.match(validateExperienceSteps([draft]) ?? "", /titre/i);
  assert.match(validateExperienceSteps([{ ...one, en: { ...en, title: " " } }]) ?? "", /titre/i);
});

test("limits the maximum number of steps and text size", () => {
  const steps = Array.from({ length: MAX_EXPERIENCE_STEPS + 1 }, (_, index) => ({
    ...one,
    id: `step_${index}`,
  }));
  assert.equal(parseExperienceSteps(steps), null);
  assert.equal(parseExperienceSteps([{ ...one, fr: { ...text, description: "a".repeat(2001) } }]), null);
});
