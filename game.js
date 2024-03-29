var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(960, 800, {backgroundColor : 0xb8a4f5});
gameport.appendChild(renderer.view);
var stage = new PIXI.Container();

// AUDIO ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Background music
PIXI.loader.add("serene.mp3").load(readySerene);
var serene;
function readySerene()
{
    serene = PIXI.audioManager.getAudio("serene.mp3");
    serene.loop = true;
    serene.volume = .35;
}

// Jingle for eating flower
PIXI.loader.add("jingle.mp3").load(readyJingle);
var jingle;
function readyJingle()
{
    jingle = PIXI.audioManager.getAudio("jingle.mp3");
    jingle.volume = .35;
}

// Tone that plays on game over
PIXI.loader.add("defeat.mp3").load(readyDefeat);
var defeat;
function readyDefeat()
{
    defeat = PIXI.audioManager.getAudio("defeat.mp3");
    defeat.volume = .35;
}


// VISUALS /////////////////////////////////////////////////////////////////////////////////////////////////////////////

var start_screen;
var credits;
var grassland;
var bee;
var flower_texture1;
var flower_texture2;
var flower1;

// Load in Sprite Sheet
PIXI.loader.add("assets.json").load(readyVisuals);

function readyVisuals()
{
    // Create Start screen
    start_screen = new PIXI.Sprite(PIXI.Texture.fromFrame("start_screen.png"));
    start_screen.anchor.x = 0.5;
    start_screen.anchor.y = 0.5;
    start_screen.position.x = 480;
    start_screen.position.y = 400;

    // Create Credits screen
    credits = new PIXI.Sprite(PIXI.Texture.fromFrame("credits.png"));

    // Create the background of the map
    grassland = new PIXI.Sprite(PIXI.Texture.fromFrame("grassland.png"));

    // Player is prompted to press Enter to start playing
    stage.addChild(start_screen);

    // Create the Bee sprite
    bee = new PIXI.Sprite(PIXI.Texture.fromFrame("bee.png"));

    // Create the flower
    flower_texture1 = PIXI.Texture.fromFrame("flower1.png");
    flower1 = new PIXI.Sprite(flower_texture1);
    flower1.texture = flower_texture1;

    // Flower's "eaten" texture
    flower_texture2 = PIXI.Texture.fromFrame("flower2.png");
}

// Create the Cat sprite (Player)
var texture = PIXI.Texture.fromImage("cat.png");

// Score display initialized
var score = 0;
var score_display = new PIXI.Text("Score: " + score.toString(), {fill: "white"});


// INITIALIZATION //////////////////////////////////////////////////////////////////////////////////////////////////////

// Variable to determine if the game has been properly initialized yet
var game_start = 0;

// Variable to track if the Credits screen is being displayed
var credits_on = 0;

// A function to initialise the default game state.
function start()
{
    //Placing bee
    bee.anchor.x = 0.5;
    bee.anchor.y = 0.5;
    bee.position.x = Math.round(Math.floor((Math.random()*896)+64)/32)*32;
    bee.position.y = Math.round(Math.floor((Math.random()*736)+64)/32)*32;
    stage.addChild(bee);

    //Placing background
    grassland.anchor.x = 0.5;
    grassland.anchor.y = 0.5;
    grassland.position.x = 480;
    grassland.position.y = 400;
    stage.addChild(grassland);

    //Placing first flower
    flower1.anchor.x = 0.5;
    flower1.anchor.y = 0.5;
    flower1.position.x = Math.round(Math.floor((Math.random()*(896-64)+64))/64)*64;
    flower1.position.y = Math.round(Math.floor((Math.random()*(736-64)+64))/64)*64;
    stage.addChild(flower1);

    //Placing cat
    cat.anchor.x = 0.5;
    cat.anchor.y = 0.5;
    cat.position.x = 512;
    cat.position.y = 448;
    cat.height = 32;
    cat.width = 32;
    stage.addChild(cat);

    //Adding score
    stage.addChild(score_display);

    serene.play();
}

// Function for dynamically updating the score
function updateScore()
{
    score += 1;
    score_gain += 1;
    score_display.text = "Score: " + score.toString();
}


// GAMEPLAY ////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Variables used to determine Bee movement and speed
bee_should_move = 0;
bee_motivation = 4;
score_gain = 0;
reset_tween = 0;

var tween;

// Function to manage the movement of the bee
function beeMove()
{
    // With changes to bee_motivation, the bee's speed will change
    if (score_gain >= 5 && bee_motivation > 1)
    {
        bee_motivation -= 0.5;
        score_gain = 0;
    }

    // Speed is also determined by proximity to the player
    distance_x = Math.abs(cat.position.x - bee.position.x);
    distance_y = Math.abs(cat.position.y - bee.position.y);
    avg_dist = (distance_x + distance_y) / 2;

    // The time is calculated and used in the tween
    time = (avg_dist * 10) * bee_motivation;

    if (reset_tween == 0)
    {
        tween = createjs.Tween.get(bee.position, {override:true}).to({x: cat.position.x, y: cat.position.y}, time);
        reset_tween = 1;
    }
    // The tween dynamically updates whenever the player changes position, overriding any previous tween
    tween = createjs.Tween.get(bee.position, {override:true}).to({x: cat.position.x, y: cat.position.y}, time);

    stage.addChild(bee);

    // If the Bee has stung the Cat, then the gameover screen is displayed
    if (cat.position.x >= bee.position.x &&
        cat.position.x <= bee.position.x+32 &&
        cat.position.y >= bee.position.y &&
        cat.position.y <= bee.position.y+32)
    {
        var game_over = new PIXI.Sprite(PIXI.Texture.fromImage("game_over.png"));
        game_over.anchor.x = 0.5;
        game_over.anchor.y = 0.5;
        game_over.position.x = 480;
        game_over.position.y = 400;

        // Player is prompted to press R to restart while the defeat tone plays
        stage.addChild(game_over);
        serene.stop();
        defeat.play();
    }
}

// Create the Cat as the player character
var cat = new PIXI.Sprite(texture);

// Cat is facing left
var cat_direction = 0;

// An array to keep track of flower placements to avoid unnecessary overlap
var flower_locations_x = [100];
flower_locations_x.push(flower1);
var flower_locations_y = [100];
var flower_conflict = 0;

// Move the flower to a new location once eaten
function moveFlower()
{
    // Move the flower
    flower1.position.x = Math.round(Math.floor((Math.random()*(896-64)+64))/64)*64;
    flower1.position.y = Math.round(Math.floor((Math.random()*(736-64)+64))/64)*64;

    // Making sure the flower's new position is within range
    if (flower1.position.x >= 864 || flower1.position.x <= 64)
    {
        flower1.position.x = 480;
    }
    if (flower1.position.y >= 704 || flower1.position.x <= 64)
    {
        flower1.position.y = 416;
    }

    // Check if a flower has grown at this location
    if (flower_locations_x.includes(flower1.position.x) &&
        flower_locations_y.includes(flower1.position.y) &&
        flower_conflict < 10)
    {
        // If a flower has been here before, pick a new location (allows for overlap as the stage fills up)
        moveFlower();
        flower_conflict += 1;
    }
    // Otherwise, note that a flower has now grown at this location
    else
    {
        flower_locations_x.push(flower1.position.x);
        flower_locations_y.push(flower1.position.y);
    }
}


// EVENT HANDLING //////////////////////////////////////////////////////////////////////////////////////////////////////

// Handles events for Enter, C, WASD, E, and R
function keydownEventHandler(e)
{
    // If the Bee has stung the Cat, then the gameover screen is displayed
    if (cat.position.x >= bee.position.x &&
        cat.position.x <= bee.position.x+32 &&
        cat.position.y >= bee.position.y &&
        cat.position.y <= bee.position.y+32 &&
        game_start == 1)
    {
        var game_over = new PIXI.Sprite(PIXI.Texture.fromImage("game_over.png"));
        game_over.anchor.x = 0.5;
        game_over.anchor.y = 0.5;
        game_over.position.x = 480;
        game_over.position.y = 400;

        // Player is prompted to press R to restart
        stage.addChild(game_over);
    }

    // C Key: Credits Toggle
    if (e.keyCode == 67)
    {
        // Turns on the Credits screen (can be turned on mid-game)
        if (credits_on == 0)
        {
            credits_on = 1;

            credits.anchor.x = 0.5;
            credits.anchor.y = 0.5;
            credits.position.x = 480;
            credits.position.y = 400;
            stage.addChild(credits);
        }
        // Turns off the Credits Screen
        else
        {
            credits_on = 0;

            stage.removeChild(credits);
        }
    }

    // Enter Key: Start Game
    if (e.keyCode == 13 && game_start == 0)
    {
        game_start = 1;
        stage.removeChild(start_screen);
        start();
    }


    // Cat movement with WASD

    // W Key: Move Up
    if (e.keyCode == 87 && game_start == 1)
    {
        if (cat.position.y >= 64)
        {
            cat.position.y -= 32;
        }
        beeMove();
    }

    // S Key: Move Down
    if (e.keyCode == 83 && game_start == 1)
    {
        if (cat.position.y <= 736)
        {
            cat.position.y += 32;
        }
        beeMove();
    }

    // A Key: Move Left
    if (e.keyCode == 65 && game_start == 1)
    {
        // Checking if the cat needs to change direction it is facing
        if (cat_direction == 1)
        {
            cat_direction = 0;
            cat.scale.x = 1;
            cat.height = 32;
            cat.width = 32;
        }

        if (cat.position.x >= 64)
        {
            cat.position.x -= 32;
        }
        beeMove();
    }

    // D Key: Move Right
    if (e.keyCode == 68 && game_start == 1)
    {
        // Checking if the cat needs to change direction it is facing
        if (cat_direction == 0)
        {
            cat_direction = 1;
            cat.scale.x = -1;
            cat.height = 32;
            cat.width = 32;
        }

        if (cat.position.x <= 896)
        {
            cat.position.x += 32;
        }
        beeMove();
    }

    // E Key: Eating Flowers
    if (e.keyCode == 69 && game_start == 1)
    {
        // If the cat is on top of the flower, then it can be eaten
        if (cat.position.x >= flower1.position.x &&
            cat.position.x <= flower1.position.x+32 &&
            cat.position.y >= flower1.position.y &&
            cat.position.y <= flower1.position.y+32)
        {
            // Jingle to accompany the eating of a flower
            jingle.play();

            // Make an "eaten" flower to replace the original
            var flower_eaten = new PIXI.Sprite(flower_texture2);
            flower_eaten.texture = flower_texture2;

            flower_eaten.anchor.x = 0.5;
            flower_eaten.anchor.y = 0.5;
            flower_eaten.position.x = cat.position.x;
            flower_eaten.position.y = cat.position.y;
            stage.addChild(flower_eaten);

            // Call updateScore to increment the score display
            updateScore();

            moveFlower();
            stage.addChild(flower1);
            stage.addChild(cat);
        }
        beeMove();
    }

    // R Key: Restart Game
    if (e.keyCode == 82)
    {
        // Resets the game to its default state
        score = 0;
        score_display.text = "Score: " + score.toString();
        start();
    }
}

document.addEventListener("keydown", keydownEventHandler);

// Mouse Handler is mostly used for testing and debugging
/*function mouseHandler(e)
{
    serene.play();
}

cat.interactive = true;
cat.on("mousedown", mouseHandler);*/


// ANIMATION ///////////////////////////////////////////////////////////////////////////////////////////////////////////

function animate()
{
    requestAnimationFrame(animate);
    renderer.render(stage);
}

animate();
