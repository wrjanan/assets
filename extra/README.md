# ET Assets

This repository manages assets for ET Finder. Relevant files are maintained in the `extra/` subdirectory.

## Download / Setup

1. `git clone https://github.com/etfinder/assets.git`
2. `cd assets/extra`

Work from the `extra` subdirectory for ET assets.

## Project Structure

- `/` home directory is synced with original assets repository.
- `extra/`: ET assets
- `extra/cw20/`: csv files which override values from their corresponding files in `/cw20`
- `extra/json` output files read by ET Finder. Output JSON files are committed to the project. The `master` branch is currently read by the ET frontend.

## Decoding a Contract for ET Finder

1. Open `extra/cw20/contracts.csv`.
2. Add contract info as a new row (one per row).
3. `cd extra/`
4. `npm run contracts`
5. `git commit` csv and json changes.
6. Push PR to this repository.

## Decoding a Token for ET Finder

Similar to contract decoding above, but edit `exgtra/cw20/tokens.csv` for step 1 and run `npm run tokens` for step 4.

## Decoding Named Accounts

Edit `extra/json/named_accounts.json` directly and submit a PR.
