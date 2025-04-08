# CPS406-QIX Game Clone
A modern JavaScript remake of the classic QIX arcade game using the p5.js library.
by group 75;    Cengiz, Zehra
                Huang, Sean
                Oparina, Kirill
                To, Benjamin

## Description
QIX is a territory-claiming game where the player must claim areas of the screen while avoiding enemies. This implementation features:
- Dynamic trail drawing
- Multiple enemy types (QIX and Sparx)
- Score and Area tracking

## Installation
1. Clone this repository
2. Make sure you have a local server set up (like Live Server extension for VS Code)
3. Open the project's html file and run the server.

## How to Play
- Use arrow keys to move around the game feild
- Draw lines with your movements to claim territory
- Avoid enemies while drawing lines;
    - If enemies hit your trail while drawing, you lose a life  
    - If you are on a border you are safe from being hit by Qix
- Claim 75% of the screen to win the game

## Technologies Used
- JavaScript
- p5play.js / q5.js
- HTML5 Canvas

## Project Structure
- `QIX.js`: Main game code
- `index.html`: Game HTML wrapper
- `assets/`: Contains images and fonts

## Credits
- Original QIX game by Taito (1981)
- Assets: 
    - Font: LLDEtechnoGlitchGX.ttf 
    - Heart.png: https://www.onlygfx.com/6-pixel-heart-png-transparent/
    - CoverArt.png: Claude 3.7 Sonnet
