const allRoundedGroups: string[] = [
  "rounded",
  "rounded-s",
  "rounded-e",
  "rounded-t",
  "rounded-r",
  "rounded-b",
  "rounded-l",
  "rounded-ss",
  "rounded-se",
  "rounded-es",
  "rounded-ee",
  "rounded-tl",
  "rounded-tr",
  "rounded-br",
  "rounded-bl",
];

export const squircleMergeConfig = {
  extend: {
    classGroups: {
      squircle: [
        { squircle: [() => true] },
        { "squircle-t": [() => true] },
        { "squircle-r": [() => true] },
        { "squircle-b": [() => true] },
        { "squircle-l": [() => true] },
        { "squircle-s": [() => true] },
        { "squircle-e": [() => true] },
        { "squircle-tl": [() => true] },
        { "squircle-tr": [() => true] },
        { "squircle-br": [() => true] },
        { "squircle-bl": [() => true] },
        { "squircle-ss": [() => true] },
        { "squircle-se": [() => true] },
        { "squircle-es": [() => true] },
        { "squircle-ee": [() => true] },
      ],
      "squircle-amt": [{ "squircle-amt": [() => true] }],
    },
    conflictingClassGroups: {
      squircle: [...allRoundedGroups, "squircle-amt"],
      ...Object.fromEntries(allRoundedGroups.map((g) => [g, ["squircle", "squircle-amt"]])),
    },
  },
} as const;
