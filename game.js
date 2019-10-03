var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer(960, 800, {backgroundColor : 0xb8a4f5});

gameport.appendChild(renderer.view);

var stage = new PIXI.Container();

var texture = PIXI.Texture.fromImage("cat.png");

var i;

// Create the Bee sprite
var bee = new PIXI.Sprite(PIXI.Texture.fromImage("bee.png"));
bee.anchor.x = 0.5;
bee.anchor.y = 0.5;
bee.position.x = Math.round(Math.floor((Math.random()*896)+64)/32)*32;
bee.position.y = Math.round(Math.floor((Math.random()*736)+64)/32)*32;
stage.addChild(bee);

//Create the background of the map
var grassland = new PIXI.Sprite(PIXI.Texture.fromImage("grassland.png"));
grassland.anchor.x = 0.5;
grassland.anchor.y = 0.5;
grassland.position.x = 480;
grassland.position.y = 400;
stage.addChild(grassland);

//Create the flower
var flower_texture1 = PIXI.Texture.fromImage("flower1.png");
var flower1 = new PIXI.Sprite(flower_texture1);
flower1.texture = flower_texture1;

flower1.anchor.x = 0.5;
flower1.anchor.y = 0.5;
flower1.position.x = Math.round(Math.floor((Math.random()*(896-64)+64))/64)*64;
flower1.position.y = Math.round(Math.floor((Math.random()*(736-64)+64))/64)*64;
stage.addChild(flower1);

//Flower's "eaten" texture
var flower_texture2 = PIXI.Texture.fromImage("flower2.png");


//Score display initialized
var score = 0;
var score_display = new PIXI.Text("Score: " + score.toString(), {fill: "white"});
stage.addChild(score_display);

//Function for synamically updating the score
function updateScore()
{
    score += 1;
    score_gain += 1;
    score_display.setText("Score: " + score.toString());
}

//Variables used to determine Bee movement and speed
bee_should_move = 0;
bee_motivation = 3;
score_gain = 0;

//Function to move the bee
function beeMove()
{
    //The Bee will move more frequently every 10 flowers eaten
    if (score_gain >= 10)
    {
        bee_motivation -= 1;
        score_gain = 0;
    }

    //The Bee moves toward the Cat
    if (bee_should_move >= bee_motivation)
    {
        //Bee y movement
        if (cat.position.y > bee.position.y)
        {
            bee.position.y += 32;
        }
        else if (cat.position.y < bee.position.y)
        {
            bee.position.y -= 32;
        }

        //Bee x movement
        if (cat.position.x > bee.position.x)
        {
            bee.position.x += 32;
        }
        else if (cat.position.x < bee.position.x)
        {
            bee.position.x -= 32;
        }

        bee_should_move = 0;
    }
    else
    {
        bee_should_move += 1;
    }

    stage.addChild(bee);

    //If the Bee has stung the Cat, then the gameover screen is displayed
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

        //Player is prompted to press R to restart
        stage.addChild(game_over);
    }
}

//Create the Cat as the player character
var cat = new PIXI.Sprite(texture);

cat.anchor.x = 0.5;
cat.anchor.y = 0.5;

cat.position.x = 512;
cat.position.y = 448;

cat.height = 32;
cat.width = 32;

stage.addChild(cat);

var cat_direction = 0; //Cat is facing left

var flower_locations_x = [30];
//flower_locations_x.push(flower);
var flower_locations_y = [25];
function moveFlower()
{
    //Move the flower
    flower1.position.x = Math.round(Math.floor((Math.random()*(896-64)+64))/64)*64;
    flower1.position.y = Math.round(Math.floor((Math.random()*(736-64)+64))/64)*64;

    //Making sure the flower's new position is within range
    if (flower1.position.x >= 864 || flower1.position.x <= 64)
    {
        flower1.position.x = 480;
    }
    if (flower1.position.y >= 704 || flower1.position.x <= 64)
    {
        flower1.position.y = 416;
    }

    //Check if a flower has grown at this location
    if (flower_locations_x.includes(flower1.position.x) &&
        flower_locations_y.includes(flower1.position.y))
    {
        //If a flower has been ehre before, pick a new location
        moveFlower();
    }
    //Otherwise, note that a flower has now grown at this location
    else
    {
        flower_locations_x.push(flower1.position.x);
        flower_locations_y.push(flower1.position.y);
    }
}


//Handles events for WASD and E
function keydownEventHandler(e)
{
    //Cat movement with WASD

    //W Key
    if (e.keyCode == 87)
    {
        if (cat.position.y >= 64)
        {
            cat.position.y -= 32;
        }
        beeMove();
    }

    //S Key
    if (e.keyCode == 83)
    {
        if (cat.position.y <= 736)
        {
            cat.position.y += 32;
        }
        beeMove();
    }

    //A Key
    if (e.keyCode == 65)
    {
        //Checking if the cat needs to change direction it is facing
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

    //D Key
    if (e.keyCode == 68)
    {
        //Checking if the cat needs to change direction it is facing
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

    //Eating a flower with E
    if (e.keyCode == 69)
    {
        //If the cat is on top of the flower, then it can be eaten
        if (cat.position.x >= flower1.position.x &&
            cat.position.x <= flower1.position.x+32 &&
            cat.position.y >= flower1.position.y &&
            cat.position.y <= flower1.position.y+32)
        {
            //Make an "eaten" flower to replace the original
            var flower_eaten = new PIXI.Sprite(flower_texture2);
            flower_eaten.texture = flower_texture2;

            flower_eaten.anchor.x = 0.5;
            flower_eaten.anchor.y = 0.5;
            flower_eaten.position.x = cat.position.x;
            flower_eaten.position.y = cat.position.y;
            stage.addChild(flower_eaten);

            //Call updateScore to increment the score display
            updateScore();

            moveFlower();
            stage.addChild(flower1);
            stage.addChild(cat);
        }
        beeMove();
    }

    //Restarting with R
    if (e.keyCode == 82)
    {
        //Program.restart();
        window.location.reload(true);
    }
}

document.addEventListener("keydown", keydownEventHandler);


function mouseHandler(e)
{
  cat.position.x = 200;
  cat.position.y = 200;
}

cat.interactive = true;
cat.on("mousedown", mouseHandler);

function animate()
{
  requestAnimationFrame(animate);
  renderer.render(stage);
}

animate();
