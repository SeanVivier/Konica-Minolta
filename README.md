# Konica-Minolta
Technical assessment for Konica Minolta interview process

The code to create the grid and connect with the API came from Konica Minolta.  I added gameplay.js and placed a link to it in the head of the index file.

Within gameplay.js, I used a setTimeout of 0 to make sure it didn't attempt anything until the API had connected and the grid had loaded.  Then, in the first call, I initialized the game and I looped through the nodes to add an event listener to each, taking advantage of the iteration in the loop to pinpoint which node had been pressed.  I made sure to use constants to keep better track of which position in an array variable stored which value.  From there, I set it to draw lines and only prevented it from doing so when it failed the followRules function.  I broke it down into further functions, for the sake of some separation of concerns, and to make it more semantic.  After each move, it checked for a win by considering all possible moves and determining if any legal moves remain, again using the followRules function to keep the code DRY.

You can try the game at seanvivier.com/kmbs
