/**
 * Theme tokens lifted from opt-c-v1-flat.html ("Option C" — the live-site
 * light theme, class .C). Only a light palette is defined in the source file
 * (the mock notes dark mode "falls out of the same tokens" but doesn't ship
 * one), so darkColors/darkShadows below are derived to match the same teal +
 * sage-green design language rather than lifted directly — treat those as a
 * reasonable extrapolation, not a literal source.
 */

import { ColorSchemeName } from "react-native";

export const lightColors = {
  background: '#F6F8F7',        // --bg
  foreground: '#16302B',        // --ink
  card: '#FFFFFF',              // --sf
  cardForeground: '#16302B',
  popover: '#FFFFFF',
  popoverForeground: '#16302B',
  primary: '#17A08C',           // --ac — Add to Cart, stat figures, buttons
  primaryForeground: '#FFFFFF',
  secondary: '#D4EAE4',         // --pale — selected chip fill, badges
  secondaryForeground: '#0B4B41',
  muted: '#E4EAE8',             // --ln — rules/borders doubling as muted fill
  mutedForeground: '#7C8B85',   // --mu
  accent: '#17A08C',            // site uses one teal for all actions/links
  accentForeground: '#FFFFFF',
  destructive: '#E0342B',       // --red — GST/ICC warnings
  destructiveForeground: '#FFFFFF',
  border: '#E4EAE8',            // --ln
  input: '#E4EAE8',
  ring: '#17A08C',
  // chart palette borrowed from the four logo dots (d1–d4) plus the primary teal
  chart1: '#00AEEF',
  chart2: '#EC008C',
  chart3: '#FFD200',
  chart4: '#F5821F',
  chart5: '#17A08C',
  sidebar: '#F6F8F7',
  sidebarForeground: '#16302B',
  sidebarPrimary: '#17A08C',
  sidebarPrimaryForeground: '#FFFFFF',
  sidebarAccent: '#D4EAE4',
  sidebarAccentForeground: '#0B4B41',
  sidebarBorder: '#E4EAE8',
  sidebarRing: '#17A08C',
  // extra tokens present in the source but with no slot in the standard set
  bodyText: '#46564F',          // --bd2 — spec bullets, secondary body copy
  linkText: '#0E7A6B',          // --acd — links, wallet chip text
} as const;

export const darkColors = {
  // --ink (#16302B) doubles nicely as a dark surface — it's already a deep
  // green-black in the light theme, so it's reused here as background/card
  // rather than inventing an unrelated dark palette.
  background: '#0E1C18',
  foreground: '#F6F8F7',
  card: '#16302B',
  cardForeground: '#F6F8F7',
  popover: '#0E1C18',
  popoverForeground: '#F6F8F7',
  primary: '#1EC2AA',           // brightened teal for contrast on dark bg
  primaryForeground: '#0E1C18',
  secondary: '#1E3B34',
  secondaryForeground: '#8FE0D0',
  muted: '#1E3B34',
  mutedForeground: '#8DA39B',
  accent: '#1EC2AA',
  accentForeground: '#0E1C18',
  destructive: '#FF6B5F',       // brightened red for contrast on dark bg
  destructiveForeground: '#0E1C18',
  border: '#26443C',
  input: '#26443C',
  ring: '#1EC2AA',
  chart1: '#33C4F5',
  chart2: '#F0439E',
  chart3: '#FFDA4D',
  chart4: '#F79A4C',
  chart5: '#1EC2AA',
  sidebar: '#0E1C18',
  sidebarForeground: '#F6F8F7',
  sidebarPrimary: '#1EC2AA',
  sidebarPrimaryForeground: '#0E1C18',
  sidebarAccent: '#1E3B34',
  sidebarAccentForeground: '#8FE0D0',
  sidebarBorder: '#26443C',
  sidebarRing: '#1EC2AA',
  bodyText: '#B7C4BE',
  linkText: '#5FD6BE',
} as const;

// --font-family: "Avenir Next","Avenir",-apple-system,sans-serif
// Note: Avenir Next is not bundled on Android and isn't guaranteed on iOS
// either — load a licensed copy with expo-font, or swap this for the
// project's actual web font at build time as the mock itself suggests.
export const fonts = {
  sans: 'AvenirNext-Regular',
  sansMedium: 'AvenirNext-Medium',
  sansSemiBold: 'AvenirNext-DemiBold',
  sansBold: 'AvenirNext-Bold',
  mono: 'ui-monospace', // used only for the token-value column in the mock
  serif: 'System',
} as const;

// Explicit radii called out in the mock: "Radius 10 chips · 12 buttons · 16 cards".
// Mapped so useThemedStyles' existing radius.md (badge/button/input) and
// radius.lg (card/avatar) land on the button and card values respectively —
// sm/xl are extrapolated one step below/above since the mock only names three.
export const radius = {
  sm: 10, // chip
  md: 12, // button / input
  lg: 16, // card
  xl: 20, // larger surfaces (hero, banners) — one step past card
} as const;

export const spacing = 4;

// --tracking-normal isn't set on body text in the mock (only headings use
// -.02em via .tt) — kept at 0 rather than guessing a body value.
export const letterSpacingEm = 0;
export const letterSpacing = 0;

// No box-shadow tokens are defined on the phone screens themselves (only on
// the presentation chrome, e.g. .frame's outer shadow) — these are modeled
// on the card style (`.cd`: 1px border, no shadow) and typical elevation for
// a light UI. Dark values are darkened/opacity-adjusted since a raised card
// won't read on a near-black background without a bit more contrast.
export const lightShadows = {
  xs: {
    shadowColor: '#16302B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#16302B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#16302B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#16302B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  xl: {
    shadowColor: '#16302B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const darkShadows = {
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.34,
    shadowRadius: 10,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

// Unrelated to the Option C site palette (print ink reference, not UI theme)
// — carried over unchanged from the existing theme.ts.
export const CMYK = {
  cyan: "#00AEEF",
  magenta: "#EC008C",
  yellow: "#FFDE00",
  orange: "#F57F20",
  pink: "#F8A4C8",
  gray: "#9BA4B0",
  black: "#231F20",
} as const;

export function getColors(scheme: ColorSchemeName)
{
  return scheme === 'dark' ? darkColors : lightColors;
}

export function getShadows(scheme: ColorSchemeName)
{
  return scheme === 'dark' ? darkShadows : lightShadows;
}