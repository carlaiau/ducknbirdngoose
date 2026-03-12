import type { PaletteDefinition, PaletteId, SpeciesDefinition, SpeciesId } from '../types/game'

export const SPECIES: SpeciesDefinition[] = [
  {
    id: 'bird',
    name: 'Barn Bird',
    blurb: 'Quick on tiny feet, bright-eyed, and ready to sprint between the eggs.',
    assetId: 'bird-marketplace',
    palettes: [
      {
        id: 'bird-dawn',
        name: 'Dawn Finch',
        colors: {
          body: '#f0c8a3',
          accent: '#d55f4a',
          beak: '#f2a13d',
          wing: '#8e5f52',
          eye: '#20171a',
        },
      },
      {
        id: 'bird-lilac',
        name: 'Lilac Chirp',
        colors: {
          body: '#cabce8',
          accent: '#7f6db5',
          beak: '#f7b453',
          wing: '#685989',
          eye: '#161017',
        },
      },
      {
        id: 'bird-berry',
        name: 'Berry Wren',
        colors: {
          body: '#e9a0a1',
          accent: '#793f4d',
          beak: '#ffb46c',
          wing: '#4e2830',
          eye: '#170d10',
        },
      },
      {
        id: 'bird-seafoam',
        name: 'Seafoam Swift',
        colors: {
          body: '#b6e3da',
          accent: '#4f8d81',
          beak: '#efb968',
          wing: '#39645d',
          eye: '#172221',
        },
      },
    ],
  },
  {
    id: 'duck',
    name: 'Pond Duck',
    blurb: 'Rounded, cheerful, and perfect for waddling a full worm pouch back to the nest.',
    assetId: 'duck-marketplace',
    palettes: [
      {
        id: 'duck-classic',
        name: 'Classic Mallard',
        colors: {
          body: '#d8dbc5',
          accent: '#37665a',
          beak: '#f3b14b',
          wing: '#61766d',
          eye: '#171717',
        },
      },
      {
        id: 'duck-sunrise',
        name: 'Sunrise Duck',
        colors: {
          body: '#f4d7a7',
          accent: '#c56a4e',
          beak: '#ec9e2f',
          wing: '#906356',
          eye: '#221616',
        },
      },
      {
        id: 'duck-pond',
        name: 'Pond Mint',
        colors: {
          body: '#b3d7c7',
          accent: '#417667',
          beak: '#f2b76a',
          wing: '#5b726c',
          eye: '#1b2221',
        },
      },
      {
        id: 'duck-cloud',
        name: 'Cloud Puddle',
        colors: {
          body: '#eff3f4',
          accent: '#7c8e93',
          beak: '#e5a356',
          wing: '#95a7ac',
          eye: '#1d2123',
        },
      },
    ],
  },
  {
    id: 'goose',
    name: 'Farm Goose',
    blurb: 'Long-necked, confident, and made for patrolling the far bank of the pond.',
    assetId: 'goose-marketplace',
    palettes: [
      {
        id: 'goose-harvest',
        name: 'Harvest Goose',
        colors: {
          body: '#efe4d3',
          accent: '#ad6f4f',
          beak: '#e18f2f',
          wing: '#8a796d',
          eye: '#201918',
        },
      },
      {
        id: 'goose-blush',
        name: 'Blush Goose',
        colors: {
          body: '#f3d6d6',
          accent: '#b66776',
          beak: '#dd8c57',
          wing: '#8f7481',
          eye: '#201618',
        },
      },
      {
        id: 'goose-river',
        name: 'River Goose',
        colors: {
          body: '#cadce2',
          accent: '#5e7881',
          beak: '#d89a3c',
          wing: '#60707b',
          eye: '#182125',
        },
      },
      {
        id: 'goose-moss',
        name: 'Moss Goose',
        colors: {
          body: '#d6deca',
          accent: '#6e8960',
          beak: '#d89d48',
          wing: '#7f8570',
          eye: '#202318',
        },
      },
    ],
  },
]

export const SPECIES_BY_ID = Object.fromEntries(
  SPECIES.map((species) => [species.id, species]),
) as Record<SpeciesId, SpeciesDefinition>

export const PALETTES_BY_ID = Object.fromEntries(
  SPECIES.flatMap((species) => species.palettes.map((palette) => [palette.id, palette])),
) as Record<PaletteId, PaletteDefinition>
