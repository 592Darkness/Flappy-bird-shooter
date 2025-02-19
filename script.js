
const bird = document.getElementById('bird');
const gameContainer = document.getElementById('game-container');
const scoreDisplayValue = document.getElementById('score-value');
const rocketCountDisplayValue = document.getElementById('rocket-value');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button'); // Fix: 2.-  (no startGame )

let birdY = 200; // bird position
let birdVelocity = 0;  // value, starts.
const gravity = 0.5;  // force going always
const jumpStrength = -8; //Up the birds - const strength , for jump with certain velocity and force to Y.
let gameLoopInterval;
let pipeSpawnInterval;  // ID games as setInterval to display

//
let score = 0;
let isGameOver = false;  // Initial value , (at Start ) no value
let pipes = []; //pipes (general , element objects, with ) . Top  x, top, down .
let pipeSpeed = 2;
let rockets = [];// elements, travel  on every elements created. Add more for  every shoot. Start = empty array = not start shoot action user;

let rocketCount = 0;  // total number
const ROCKET_SPEED = 8;   // speed ( x axis, going- x + forward, constant)

//Variables related to count scores, total . Scores variable- ( to  get  at  final or after play again . Final Score set
// increase one rocket ever passed two-pipes and check/ set. And
let pipesPassedForRocket = 0;   // to display

let scoreToDisplay = 0;

let rocketBoostTimeout = null;

//
let touchStartX = 0;
let touchStartY = 0;
function startGame() { // function that creates/ and
  isGameOver = false; //set Game State - variable state of general, on new game

birdY = gameContainer.offsetHeight * 0.3333;  // bird position set correctly on initial Y axys. 33% correctly - to

 birdVelocity = 0; // set and keep ,velocity as intial, withouot jump for
 score = 0; //Resets to set score value correct initial value, restart correct

    scoreToDisplay = 0; //sets intials, correct.
    rocketCount = 0;   //rocket initial  initial variable value, not rocket as available. (new one after every two pased pipe

pipesPassedForRocket = 0;   //set  count passed, restting too to star- pipes to
 scoreDisplayValue.textContent = "0";
 rocketCountDisplayValue.textContent =  "0";

  pipes = [];  //cleared general objects pips.
    rockets = [];   //Clear rockest internal arrray objects

  gameOverScreen.style.display = 'none';  //not displaying games. And show initial display

document.querySelectorAll('.pipe, .rocket').forEach(el => el.remove());
   clearTimeout(rocketBoostTimeout); //clear timer bird . Clean up to last

// add and creates a game (game loop). Every time add loop time - set a interval (set)
     gameLoopInterval = setInterval(gameLoop, 20);  // set setInterval to loop

   //and crates new loop intervals(game loops (spawn)) pipes .

        //New interval ID spawn interval - pipe appear at games on start and  add a set Time, start- first- every

 pipeSpawnInterval = setInterval(spawnPipe, 1500);
  // bird position bird, Y .initial state, first games- user no touched.

     //  initial bird correct to position to star playing in start

 bird.style.top = birdY + 'px';
   bird.style.transform = 'rotate(0deg)';// initial set bird, rotate, reset
 }

     // add force the user- when Jump- Touch -Space .  jump variable
  function jump() { //Function , Up, and drop when get the gravity, after  . Top set the velocity ( velocity + velocity), Up at display- add bird to velocity

   if (!isGameOver) {    //  Checks if its game. Game over display on, it's check, isGameOver to no set (actions - event
  birdVelocity = jumpStrength;  //add to bird at the strength value to. ( bird and strength to be

 bird.style.transform = 'rotate(-20deg)';  //rotates bird

     }
      }



// Create - show display for new Rocket user on click / touch for  rockets and start shot user at this. (when you can
  // ( x) shot and new - bird , add

       function shootRocket() {  //Function of create, rocket
   if (!isGameOver && rocketCount > 0) { // Checks before, isGameOver and > of
  rocketCount--;

   rocketCountDisplayValue.textContent = rocketCount; //Update, variable  get on rockets
    // rockes create - display add, on  and   at rocket.

           const rocket = document.createElement('div');

 rocket.classList.add('rocket');

  rocket.innerHTML = '<i class="fas fa-rocket"></i>';  // Set rockt image in game, display style for a good view of all rocket that travel game - game
   rocket.style.left = bird.offsetLeft + bird.offsetWidth + 'px';  // left horizontal of screen,
  rocket.style.top = bird.offsetTop + bird.offsetHeight / 2 + 'px'; // bird Y to center top
    gameContainer.appendChild(rocket);
      rockets.push({ element: rocket, x: parseFloat(rocket.style.left) });//push in rockets to new. Rockets array internal,

       clearTimeout(rocketBoostTimeout);   // Clean rocket, Clean up time - times when user still at this x
          birdVelocity = 0;   // add Y stop to bird velocity force - stop add time- interval time , not for  drop ( gravity down or up), just stop- stop add-set a new. Force, at 0 and (not set with rocket) when shoot the x
       rocketBoostTimeout = setTimeout(() => { birdVelocity = gravity; }, 150); // and restore
          }

        }

   function spawnPipe() {

          if(isGameOver) return;

   const gapHeight = gameContainer.offsetHeight * 0.25; //get % value, Responsive-Design and Responsive pipes

            const minPipeHeight = gameContainer.offsetHeight * 0.083; //responsive
          const maxPipeHeight = gameContainer.offsetHeight - gapHeight - minPipeHeight;
           // pipe down create- show and make the element be - games with element- created add to this document HTML - pipes. Game and get add,  it.
      // down
       const topPipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
  const bottomPipeHeight = gameContainer.offsetHeight - gapHeight - topPipeHeight;

  const topPipe = document.createElement('div');

          topPipe.classList.add('pipe', 'pipe-top');

   topPipe.style.height = `${topPipeHeight}px`; // get style. Set height of pips to appear. Dynamic- heigt- up height of element top. With up-down range of min

      gameContainer.appendChild(topPipe);

       // down , botton-pips create- botom down, second div element games as element on DOM elements- bottom part, for appear  display correct,
      const bottomPipe = document.createElement('div');
           bottomPipe.classList.add('pipe', 'pipe-bottom');   // Add Bottom pipe style classes

   bottomPipe.style.height = `${bottomPipeHeight}px`;// display correctly on style

    gameContainer.appendChild(bottomPipe);

     pipes.push({ top: topPipe, bottom: bottomPipe, x: gameContainer.offsetWidth }); //Pips x start. Pipes appears to all width on bottom of horizontal line- right, right to  games
     }



  function gameLoop() {  // set time a time interval, all actions display and internal games control and ( score) get this

 if (isGameOver) return;
    if (birdVelocity > 2) {  // bird velocity as check
           bird.style.transform = 'rotate(45deg)';// Tilt, up - when
       }
   else if (birdVelocity < -2)

   {

  bird.style.transform = 'rotate(-20deg)';// tilt Up, top to
       }

            else {
           bird.style.transform = 'rotate(0deg)';
   }

           birdVelocity += gravity; //  bird get-gravity . Add velocity top birs after action , add bird the drop
             birdY += birdVelocity;    // force up as after get this at this variable in ( up- birdvelocity in Y ( up and down, goies top  with jump, with gravity velocity drops, add
                bird.style.top = birdY + 'px'; // Bird is on. All  game time. After jumps add, for time after the bird. Go down and
 // Colissions bird- on top or roof .
           if (birdY + bird.offsetHeight > gameContainer.offsetHeight || birdY < 0)
   {
    gameOver();

   }
          //Rockets elements travels at this, (forward) rockets as  set variable as time  for the pipes (x) that
         //  rockets as pipes travels with (move), but set its   for x to  and  move as loop a loop (travel), for  every array - x(horizontal travel forward in all ele

              //rocket set in interval of timer

     for (let i = rockets.length - 1; i >= 0; i--)  // Travels from rocket last - elements - loop from i. i > -

      {


           rockets[i].x += ROCKET_SPEED;


           rockets[i].element.style.left = rockets[i].x + 'px';  // travels


                 for (let j = pipes.length - 1; j >= 0; j--)
              {


        if (rockets[i] &&


                   rockets[i].x + rockets[i].element.offsetWidth > pipes[j].x &&  // Collision with Pips top / bottom

                        rockets[i].x < pipes[j].x + pipes[j].top.offsetWidth && // Check horizontal x between pipes range for - pipes and rockets, top range  in all range betw


                    (rockets[i].element.offsetTop < pipes[j].top.offsetHeight || // Top. And top element from the user. Pipes- rocket - colissions between  from Y up ( top for
                      rockets[i].element.offsetTop + rockets[i].element.offsetHeight > gameContainer.offsetHeight - pipes[j].bottom.offsetHeight))
                    {

             pipes[j].top.remove();

                  pipes[j].bottom.remove();  //Bottom pipe to bottom / roof for pipe and up for bottom pipe (pipe top) - and floor.

                    pipes.splice(j, 1); // removed pipe from game

                       rockets[i].element.remove();
            rockets.splice(i,1); // Removed rockert elements- rockets after check - clean

               break;

               }


              }

            if (rockets[i] && rockets[i].x > gameContainer.offsetWidth) {
        rockets[i].element.remove();

          rockets.splice(i, 1); // remove element internal games to
              }

              }
             // and pipe elementes, get forward at any moment
                for (let i = pipes.length - 1; i >= 0; i--) {
                  pipes[i].x -= pipeSpeed; //

              pipes[i].top.style.left = pipes[i].x + 'px'; //x-cordinate. Pipes goes travel to left,  always top for loop
                  pipes[i].bottom.style.left = pipes[i].x + 'px';  //pipes botto


            if (  //check if get position,  horizontal , x
                  bird.offsetLeft + bird.offsetWidth > pipes[i].x &&   // check birds ( if inside position), range horizontal

                bird.offsetLeft < pipes[i].x + pipes[i].top.offsetWidth &&


                  (birdY < pipes[i].top.offsetHeight ||


                      birdY + bird.offsetHeight > gameContainer.offsetHeight - pipes[i].bottom.offsetHeight)
           )
            { // checks pipe down (vertical Y of pipes bottom)

           gameOver(); // call game ( collisions -pipe. Game) and reset
                }

             if (pipes[i].x + pipes[i].top.offsetWidth < bird.offsetLeft && !pipes[i].scored) { // Check user has been pass
     pipes[i].scored = true; //check-if user to game. No, or,
                score++; // set score in a counter - to plus score for games(internal) with add variable with total of this score (value)  games and.

                    scoreToDisplay = score;
                      pipesPassedForRocket++;
            if (pipesPassedForRocket >= 2)
         {  // every + to for games check rockets

                    rocketCount++;

                   pipesPassedForRocket = 0; //increase/set - when pipes gets passed

               }

            scoreDisplayValue.textContent = scoreToDisplay;  //score , update values display to for-text, from

                 rocketCountDisplayValue.textContent = rocketCount;   // text content

                   }



  // check pipes  and off all games - for to be x to right- clean/
              if(pipes[i].x + pipes[i].top.offsetWidth < 0)
               { // out, out of  . Off now

                   pipes[i].top.remove();  //
       pipes[i].bottom.remove();  //

        pipes.splice(i,1);
          } //out
         }

         }


          function gameOver() { // check status if final scores- stopes a interval that.

             isGameOver = true;


            clearInterval(gameLoopInterval);

            clearInterval(pipeSpawnInterval);

         finalScoreDisplay.textContent = "Final Score: " + scoreToDisplay;
        gameOverScreen.style.display = "block"; //
      clearTimeout(rocketBoostTimeout); // clean, check the rocket

     }
          // Event touches starts, user going- Up
    gameContainer.addEventListener('touchstart', (event) => {

         event.preventDefault();
   touchStartX = event.touches[0].clientX;
 touchStartY = event.touches[0].clientY; // Set touches Y - horizontal line

         jump();

             });


  // event finish. Fire Rockects

   gameContainer.addEventListener('touchend', (event) => { // user and the.
     event.preventDefault();


       const touchEndX = event.changedTouches[0].clientX; //x final
        const touchEndY = event.changedTouches[0].clientY;

       const deltaX = touchEndX - touchStartX;

       const deltaY = touchEndY - touchStartY;


         if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {

                shootRocket(); // fire x  rocke


          }
             });
   // key supports. ( computer
        document.addEventListener('keydown', (event) => {

    if (event.code === 'Space') {  //

              jump();
            }

   else if (event.code === 'KeyX'){

              shootRocket();


        }


    });

restartButton.addEventListener('click', startGame);
  startGame();
</script>
  </body>
   </html>
