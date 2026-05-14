---
name: 1-scope
description: Use when planning new custom software, scoping a project, defining requirements for something to build, or starting Phase 1 of software development.
---

# Szoftver Scope — 1. Fazis

Guide the user through a structured interview to produce a clean scope document. Ask one question at a time. After all answers are collected, generate the scope.

**IMPORTANT: All questions, option labels, option descriptions, and the final scope document MUST be written in Hungarian.**

## Interview Flow

### Step 1: Funkciok

Use AskUserQuestion in Hungarian.

Question: "Milyen funkciokat szeretnel a szoftverben? Ird le a sajat szavaiddal, hogy mit tudjon csinalni a szoftver — sorold fel a fo kepessegeket, amiket elkepzelsz."
Header: "Funkciok"
multiSelect: false
Options (in Hungarian):
- label: "Leirom a sajat otleteimet", description: "A sajat szavaiddal irod le, milyen funkciokat szeretnel — ez a legjobb kiindulas"
- label: "Segits otletekkel", description: "Nem tudom pontosan, mire van szuksegem — adj pelda funkcio-tipusokat, amikbol valaszthatok"

If user picks "Leirom a sajat otleteimet": Let them describe freely. Ask follow-up if vague: "Ezt kicsit bontsuk ki — mit jelent pontosan [funkcio neve]? Mit csinal a felhasznalo, amikor ezt hasznalja?"

If user picks "Segits otletekkel": Ask a follow-up AskUserQuestion with context-relevant function categories based on what the user has already described about their project. If no context yet, ask first: "Mielott otleteket adnek, ird le 1-2 mondatban, milyen szoftvert kepzelsz el?" Then offer 3-4 relevant options tailored to their leirasukat, plus always allow free-text input.

### Step 2: Idealis Workflow

Use AskUserQuestion in Hungarian.

Question: "Ird le az idealis hasznalati folyamatot — mi tortenik, amikor valaki tenylegesen hasznalja a szoftvert? Jard vegig egy tipikus hasznalat az elejetol a vegeig."
Header: "Workflow"
Options (in Hungarian):
- label: "Leirom", description: "Magam irom le a teljes folyamatot"
- label: "Kerdezz inkabb", description: "Inkabb kerdesekkel vezess vegig"

If user picks "Kerdezz inkabb", break the workflow into smaller Hungarian prompts:
- "Mi az elso dolog, amit a felhasznalo csinal?"
- "Mi tortenik ezutan?"
- "Hogyan fejezodik be egy hasznalat?"

### Step 3: Peldak

Ask TWO separate AskUserQuestion calls, both in Hungarian.

**Funkcio referencia:**
Question: "Melyik letezo szoftver hasonlit leginkabb arra, amit szeretnel? (Ez a funkcio peldad.)"
Header: "Funkcio pelda"
Options: well-known apps relevant to the features mentioned in Step 1, plus "Other"

**Design referencia:**
Question: "Melyik szoftver dizajnjat vagy felhasznaloi elmenyet szeretned kovetni? (Lehet mas, mint a funkcio pelda.)"
Header: "Dizajn pelda"
Options (in Hungarian):
- label: "Ugyanaz, mint a funkcio pelda", description: "Ugyanazt a szoftvert kovetem dizajnban is"
- (2-3 well-known apps based on context)

### Step 4: Kulonbsegek

Use AskUserQuestion in Hungarian.

Question: "Miben legyen mas a te szoftvered, mint a peldak? Kevesebb funkcio? Mas fokusz? Mas celkozonseg?"
Header: "Kulonbsegek"
multiSelect: true
Options (in Hungarian):
- label: "Egyszerubb / kevesebb funkcio", description: "A peldanal letisztultabb, kevesebb kepesseggel"
- label: "Mas celkozonseg", description: "Mas tipusu felhasznaloknak szol"
- label: "Mas fokusz", description: "A lenyeg mashol van, mint a peldanal"
- label: "Egyedi megkozelites", description: "Teljesen mas workflow vagy megoldas"

User picks relevant ones and elaborates via "Other".

### Step 5: Scope Generalas

After all answers, generate the scope document **in Hungarian** using this format:

```
# [Projekt Neve] — Scope

## Attekintes
- Egymondatos osszefoglalo: mi ez es kinek szol

## Fo Funkciok
- Funkcio 1
- Funkcio 2
- Funkcio 3
- (az osszes funkcio az 1. lepesbol)

## Hasznalati Folyamat
- A szoftver hasznalatat lepesenrol lepesre leirasa
- A 2. lepes valaszai alapjan
- Tiszta, egymas utani pontokba szedve

## Referenciak
- **Funkcio referencia**: [App neve] — mit veszunk at belole
- **Dizajn referencia**: [App neve] — mit veszunk at belole

## Fo Kulonbsegek
- Miben mas ez, mint a referenciak
- Mi az, ami szandekosan kimarad
- Mi az egyedi szog

## Scope-on Kivul
- Ami kifejezetten NEM resze a projektnek
- A kulonbsegek valaszaibol levezetve
```

Present the scope to the user for review. Ask in Hungarian: "Szeretnel valamit modositani?" Save as `SCOPE.md` in the current working directory when confirmed.
