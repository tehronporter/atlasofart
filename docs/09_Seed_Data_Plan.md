# Atlas of Art — Seed Data Plan

## Purpose
This document defines how the MVP seed dataset should be shaped.

## Goal
Create a dataset that is:
- visually interesting on a world map
- historically diverse
- strong enough to demo timeline filtering
- strong enough to demo related works

## Seed count
Target:
- 20 to 30 artworks

This is enough for:
- visible map coverage
- timeline changes
- related item logic
- a polished MVP demo

## Geographic spread
Include artworks from examples like:
- Florence
- Athens
- Cairo
- Isfahan
- Kyoto
- Delhi
- Istanbul
- Paris
- Mexico City
- Beijing

## Time spread
The dataset should cover multiple periods, such as:
- Ancient world
- Medieval period
- Early modern period
- 19th century
- 20th century

## Medium spread
Use a mix of:
- manuscript
- sculpture
- painting
- ceramic
- textile
- decorative arts

## What makes a good seed record
Each record should:
- have a clear place of creation
- have valid lat/lng
- have at least one image path or placeholder image
- have a readable short description
- have metadata strong enough for basic related-works logic

## Demo quality rules
The seed data should feel intentional, not random.
It should help the user quickly understand:
- art comes from real places
- art spans long time periods
- similar works can be grouped and discovered

## What to avoid
Do not:
- use 200+ records for the MVP
- add incomplete records
- add records without coordinates
- depend on live API pulls before the UI works
- overcomplicate the dataset

## Suggested build order
1. define the TypeScript type
2. create 20 to 30 seed records
3. verify coordinates
4. connect to marker rendering
5. connect to timeline filtering
6. connect to related works
