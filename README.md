# 🚊 poznan-transport-cli

Unofficial command line interface for ZTM Poznań API \
Check positions and timetables for buses and trams in Poznań

![GitHub release (latest by date)](https://img.shields.io/github/v/release/bartekl1/poznan-transport-cli?style=flat-square)
![GitHub Repo stars](https://img.shields.io/github/stars/bartekl1/poznan-transport-cli?style=flat-square)
![GitHub watchers](https://img.shields.io/github/watchers/bartekl1/poznan-transport-cli?style=flat-square)
![GitHub forks](https://img.shields.io/github/forks/bartekl1/poznan-transport-cli?style=flat-square)

<!-- [📖 Documentation](https://github.com/bartekl1/poznan-transport-cli/wiki) -->
[🕑 Changelog](https://github.com/bartekl1/poznan-transport-cli/blob/main/CHANGELOG.md)
[🎁 Acknowledgements](https://github.com/bartekl1/poznan-transport-cli/blob/main/ACKNOWLEDGEMENTS.md)
[🇵🇱 Polish version of README](https://github.com/bartekl1/poznan-transport-cli/blob/main/README_PL.md)

## Available functions

- Check position of vehicle
- List all lines
- Get line description
- Check timetable

## Installation

[Node.js](https://nodejs.org/) is required to install and use this program.

```bash
npm install -g poznan-transport-cli
```

## Usage

```bash
poznan-transport-cli <command> <options>
```

### Get help

#### Global help

```bash
poznan-transport-cli help
poznan-transport-cli --help
poznan-transport-cli -h
```

#### Command help

```bash
poznan-transport-cli <command> --help
poznan-transport-cli <command> -h
```

### Get version

```bash
poznan-transport-cli version
poznan-transport-cli --version
poznan-transport-cli -v
```

### Vehicle positions

```bash
poznan-transport-cli position <options> <search>
```

Command displays line number, vehicle number, brigade number, position and direction.

#### Search

If you do not specify a search query, the command displays the positions of all vehicles.

You can search by line number, vehicle number or brigade number.

If you pass `--line-number` argument, the command searches only by line number.
If you pass `--vehicle-number` argument, the command searches only by vehicle number.
If you pass `--brigade-number` argument, the command searches only by brigade number.

#### Example commands

```bash
poznan-transport-cli position
poznan-transport-cli position 5
poznan-transport-cli position 5 --line-number
poznan-transport-cli position 427 --vehicle-number
poznan-transport-cli position 5/9 --brigade-number
```

#### Example

Command:

```bash
poznan-transport-cli position 5
```

Output:

```text
┌──────┬─────────┬─────────┬────────────────────────────────────────┬──────────────┐
│ Line │ Vehicle │ Brigade │ Position                               │ Direction    │
├──────┼─────────┼─────────┼────────────────────────────────────────┼──────────────┤
│ 5    │ 450     │ 5/10    │ 52.38100814819336, 16.879940032958984  │ Zawady       │
│ 5    │ 436     │ 5/6     │ 52.40298843383789, 16.915029525756836  │ Górczyn PKM │
│ 5    │ 447     │ 5/7     │ 52.4033317565918, 16.954439163208008   │ Górczyn PKM │
│ 5    │ 418     │ 5/8     │ 52.40589904785156, 16.93073081970215   │ Zawady       │
│ 5    │ 427     │ 5/9     │ 52.381099700927734, 16.881160736083984 │ Zawady       │
└──────┴─────────┴─────────┴────────────────────────────────────────┴──────────────┘
```

### Routes

```bash
poznan-transport-cli route <search>
```

Command displays line number, vehicle type, direction and agency.

If you do not specify a search query, the command displays all routes.

#### Examples

1.

Command:

```bash
poznan-transport-cli route
```

Output:

```text
┌──────┬──────┬──────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────┐
│ Line │ Type │ Direction                                                    │ Agency                                                        │
├──────┼──────┼──────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
│ 0    │ Tram │ PL. WIELKOPOLSKI - PL. WIELKOPOLSKI                          │ Miejskie Przedsiębiorstwo Komunikacyjne Sp. z o.o. w Poznaniu │
│ 1    │ Tram │ BUDZISZYŃSKA - FRANOWO                                       │ Miejskie Przedsiębiorstwo Komunikacyjne Sp. z o.o. w Poznaniu │
│ 2    │ Tram │ DĘBIEC PKM - STARE ZOO                                       │ Miejskie Przedsiębiorstwo Komunikacyjne Sp. z o.o. w Poznaniu │
│ 3    │ Tram │ UNII LUBELSKIEJ - BŁAŻEJA                                   │ Miejskie Przedsiębiorstwo Komunikacyjne Sp. z o.o. w Poznaniu │
│ 5    │ Tram │ ZAWADY - GÓRCZYN PKM                                         │ Miejskie Przedsiębiorstwo Komunikacyjne Sp. z o.o. w Poznaniu │
│ 6    │ Tram │ MIŁOSTOWO - BUDZISZYŃSKA                                    │ Miejskie Przedsiębiorstwo Komunikacyjne Sp. z o.o. w Poznaniu │
│ 7    │ Tram │ POŁABSKA - OGRODY                                           │ Miejskie Przedsiębiorstwo Komunikacyjne Sp. z o.o. w Poznaniu │
│ 8    │ Tram │ OGRODY - MIŁOSTOWO                                          │ Miejskie Przedsiębiorstwo Komunikacyjne Sp. z o.o. w Poznaniu │
│ 9    │ Tram │ DĘBIEC PKM - PIĄTKOWSKA                                      │ Miejskie Przedsiębiorstwo Komunikacyjne Sp. z o.o. w Poznaniu │
...
│ 905  │ Bus  │ OS. SOBIESKIEGO - CHLUDOWO SZKOŁA                           │ Zakład Komunikacji Publicznej Suchy Las Sp. z o.o.           │
│ 907  │ Bus  │ OS. SOBIESKIEGO - CHLUDOWO SZKOŁA                           │ Zakład Komunikacji Publicznej Suchy Las Sp. z o.o.           │
│ 911  │ Bus  │ RONDO ŚRÓDKA - BIEDRUSKO PARK                                │ Miejskie Przedsiębiorstwo Komunikacyjne Sp. z o.o. w Poznaniu │
└──────┴──────┴──────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────┘
```

2.

Command:

```bash
poznan-transport-cli route 5
```

Output:

```text
ROUTE 5
Direction: ZAWADY - GÓRCZYN PKM
Type: Tram
Agency: Miejskie Przedsiębiorstwo Komunikacyjne Sp. z o.o. w Poznaniu

Route:
┌───────────────────────┬───────────────────────┐
│ ZAWADY                │ GÓRCZYN PKM           │
│ Podwale               │ Matyi                 │
│ Jana Pawła II        │ Towarowa              │
│ Kórnicka             │ Święty Marcin         │
│ Mostowa               │ Aleje Marcinkowskiego │
│ pl. Bernardyński     │ Podgórna             │
│ Podgórna             │ pl. Bernardyński     │
│ Aleje Marcinkowskiego │ Mostowa               │
│ 27 Grudnia            │ Kórnicka             │
│ Gwarna                │ Jana Pawła II        │
│ Święty Marcin         │ Podwale               │
│ Towarowa              │ ZAWADY                │
│ Matyi                 │                       │
│ Głogowska            │                       │
│ GÓRCZYN PKM           │                       │
└───────────────────────┴───────────────────────┘
```

### Timetables

```bash
poznan-transport-cli timetable <line> <stop>
```

You need to specify line number and stop ID.

#### Example

Command:

```bash
poznan-transport-cli timetable 5 134
```

Output:

```text
 WORKDAYS                   SATURDAYS                  SUNDAYS
┌────┬───────────────────┐ ┌────┬───────────────────┐ ┌────┬───────────────────┐
│ 04 │                   │ │ 04 │ 53                │ │ 04 │                   │
│ 05 │ 00 14 28 43 58    │ │ 05 │ 13 32 52          │ │ 05 │                   │
│ 06 │ 13 23 33 43 53    │ │ 06 │ 12 32 52          │ │ 06 │ 07 37             │
│ 07 │ 03 13 23 33 43 53 │ │ 07 │ 12 32 52          │ │ 07 │ 07 37             │
│ 08 │ 03 13 23 33 43 53 │ │ 08 │ 12 32 52          │ │ 08 │ 07 37             │
│ 09 │ 03 13 28 33 43 58 │ │ 09 │ 12 32 52          │ │ 09 │ 07 37             │
│ 10 │ 13 28 43 58       │ │ 10 │ 12 32 52          │ │ 10 │ 07 32 52          │
│ 11 │ 13 28 43 58       │ │ 11 │ 12 32 52          │ │ 11 │ 12 32 52          │
│ 12 │ 13 28 43 58       │ │ 12 │ 12 32 52          │ │ 12 │ 12 32 52          │
│ 13 │ 13 23 33 43 53    │ │ 13 │ 12 32 52          │ │ 13 │ 12 32 52          │
│ 14 │ 03 13 23 33 43 53 │ │ 14 │ 12 32 52          │ │ 14 │ 12 32 52          │
│ 15 │ 03 13 23 33 43 53 │ │ 15 │ 12 32 52          │ │ 15 │ 12 32 52          │
│ 16 │ 03 13 23 33 43 53 │ │ 16 │ 12 32 52          │ │ 16 │ 12 32 52          │
│ 17 │ 03 13 23 33 43 53 │ │ 17 │ 12 32 52          │ │ 17 │ 12 32 52          │
│ 18 │ 03 13 23 33 42 52 │ │ 18 │ 12 32 52          │ │ 18 │ 12 32 52          │
│ 19 │ 02 12 32 52       │ │ 19 │ 12 32 52          │ │ 19 │ 12 32 52          │
│ 20 │ 12 32 52          │ │ 20 │ 12 32 52          │ │ 20 │ 12 32 52          │
│ 21 │ 12 32 52          │ │ 21 │ 12 32 52          │ │ 21 │ 12 32 52          │
│ 22 │ 12 32 47          │ │ 22 │ 12 32 47          │ │ 22 │ 12 32 47          │
│ 23 │ 07                │ │ 23 │ 07                │ │ 23 │ 07                │
└────┴───────────────────┘ └────┴───────────────────┘ └────┴───────────────────┘
```
