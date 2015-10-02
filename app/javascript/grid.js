/*jslint browser: true*/
/*global  */

const COLOURS = ['red', 'green', 'blue', 'yellow'];
const MAX_X = 100;
const MAX_Y = 100;

class Block {
    constructor (x, y) {
        this.x = x;
        this.y = y;
        this.colour = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    }
}

class BlockGrid {
    constructor () {
        this.grid = [];

        for (let x = 0; x < MAX_X; x++) {
            let col = [];
            for (let y = 0; y < MAX_Y; y++) {
                col.push(new Block(x, y));
            }

            this.grid.push(col);
        }

        return this;
    }

    render (el = document.querySelector('#gridEl')) {
        for (let x = 0; x < MAX_X; x++) {
            let id = 'col_' + x;
            let colEl = document.createElement('div');
            colEl.className = 'col';
            colEl.id = id;
            el.appendChild(colEl);

            for (let y = MAX_Y - 1; y >= 0; y--) {
                let block = this.grid[x][y],
                    id = `block_${x}x${y}`,
                    blockEl = document.createElement('div');

                blockEl.id = id;
                blockEl.className = 'block';
                //Give the blocks custom attributes, of xPos and yPos, to make it easier to grab their positions
                //Rather than mucking about trying to strip the co-ords from the ID. 
                blockEl.setAttribute('xPos', x);
                blockEl.setAttribute('yPos', y);
                blockEl.style.background = block.colour;
                //This helps keep track of blocks that disappear. 
                //blockEl.innerHTML = `${x}x${y}`;
                // blockEl.addEventListener('click', (evt) => this.blockClicked(evt, block));
                colEl.appendChild(blockEl);
            }
        }
        //I redid the way events were set up, to make it easier to reuse when we have to re-add them later.
        this.setupEvents();
        return this;
    }

    blockClicked (e, block) {
        let clickColor = block.colour;
        let xPos = block.x;
        let yPos = block.y;
        let arr = [];
        let d = document;

        //Add the clicked block to the array, which we will remove from the grid later on.
        arr.push({
            xPos: xPos,
            yPos: yPos
        });
        
        //Check the block above the current block;
        function checkTop(x, y) {
            let up = parseInt(y) + 1;
            let $el = d.querySelector(`#block_${x}x${up}`);
            if ($el === null || $el.classList.contains('checked')) return false;
            var uBlock = d.querySelector(`#block_${x}x${up}`).style.backgroundColor;
            if (uBlock === clickColor ) {
                $el.classList.add('checked');
                arr.push({ xPos: x, yPos: up });
                checkTop(x, up);
                checkRight(x, up);
                checkLeft(x, up);
            }
        }

        //Check the block below the current block.
        function checkBottom(x, y) {
            let down = parseInt(y) - 1;
            let $el = d.querySelector(`#block_${x}x${down}`);
            if ($el === null  || $el.classList.contains('checked')) return false;
            var dBlock = d.querySelector(`#block_${x}x${down}`).style.backgroundColor;
            if (dBlock === clickColor) {
                $el.classList.add('checked');
                arr.push({ xPos: x, yPos: down });
                checkBottom(x, down);
                checkRight(x, down);
                checkLeft(x, down);
            }
        }

        //Check the block to the right of the current block;
        function checkRight(x, y) {
            let right = parseInt(x) + 1;
            let $el = d.querySelector(`#block_${right}x${y}`);
            if ($el === null || $el.classList.contains('checked')) return false;
            var rBlock = d.querySelector(`#block_${right}x${y}`).style.backgroundColor;
            if (rBlock === clickColor) {
                $el.classList.add('checked');
                arr.push({ xPos: right, yPos: y });
                checkTop(right, y);
                checkBottom(right, y);
                checkRight(right, y);
            }
        }

        //Check the block to the left of the current block;
        function checkLeft(x, y) {
            let left = parseInt(x) - 1;
            let $el = d.querySelector(`#block_${left}x${y}`);
            if ($el === null || $el.classList.contains('checked')) return false; 
            var lBlock = d.querySelector(`#block_${left}x${y}`).style.backgroundColor;
            if (lBlock === clickColor) {
                $el.classList.add('checked');
                arr.push({ xPos: left, yPos: y });
                checkTop(left, y);
                checkBottom(left, y);
                checkLeft(left, y);
            }
        }

        //This starts the check to get all the blocks of the same colour, and push them to an array.
        //The functions recursively call themselves, depending on the direction they are going,
        //so we do not check the previous square to prevent infinite loops.
        //e.g checkTop only checks top, right and left, not down because that would cause a loop.
        //Also need to add in a 'checked' class for bigger shapes that can make circular loops
        function check(x, y) {
            let $el = d.querySelector(`#block_${xPos}x${yPos}`).classList.add('checked');
            checkTop(xPos, yPos);
            checkBottom(xPos, yPos);
            checkRight(xPos, yPos);
            checkLeft(xPos, yPos);        
        }
        //Start the check from the clicked box, which pushes to the array to get all the blocks of the same colour.
        check(xPos, yPos);

        //Now loop over the array and do some magic, which roughly is as follows...
        //Get the array of unchecked blocks in column, push them to new array.
        //Get the array of checked blocks, create new disabled block for each checked block, push them to front of the newBlock array.
        //Loop through new array and give the blocks ID's of 0 to 9;
        //Replace the column.
        //Copy and replace the whole grid and set up new event handlers.

        arr.map((block, i) => {
            // d.querySelector(`#block_${block.xPos}x${block.yPos}`).style.backgroundColor = 'pink';
            let $col = d.querySelector(`#col_${block.xPos}`);
            let blocks = d.querySelectorAll(`#col_${block.xPos} .block`);
            let checkedBlocks = d.querySelectorAll(`#col_${block.xPos} .checked`).length;
            let newGridArr = [];

            //Get all the non checked boxes, and push them into the array.
            for(var i = 0; i < blocks.length; i++){
                if (!blocks[i].classList.contains('checked')) {
                    newGridArr.push(blocks[i]);
                }
            }
            //Create a new empty/disabled box for every 'checked' box.
            //Put them at the start of the array, so they go to the 'top' of the browser window / beginging nodes of the columns.
            //Give them grey background, check and disabled class. 
            for (var i = 0; i < checkedBlocks; i++){
                let newBlock = document.createElement('div');
                newBlock.className = 'block checked disabled';
                newBlock.style.background = 'grey';
                newGridArr.unshift(newBlock);
            };

            //In our new array of DOM Nodes, we have to set their IDs, and give them the attributes xPos and yPos.
            //This just makes it a bit easier to select them when we have to set up the click handler again. 
            //Some funny maths going on here...MAX_Y - 1 - i. Nice. 
            newGridArr.map((newBlock, i) => {
                newBlock.id = `block_${block.xPos}x${MAX_Y - 1 - i}`;
                //This helps keep track of the blocks.   
                // newBlock.innerHTML = `${block.xPos}x${MAX_Y - 1 - i}`;
                newBlock.setAttribute('xPos', block.xPos);
                newBlock.setAttribute('yPos', MAX_Y - 1 - i);
            });

            //Destroy the column as we know it!
            $col.innerHTML = '';

            //Append our new DOM nodes to our column.
            newGridArr.forEach((el, i) => {
               $col.appendChild(el);
            });

        });

        //Remake the whole grid to remove the event handlers to ensure the next clicks work.
        this.remakeGrid();
        //Re set up event handlers on each block.
        this.setupEvents();

    }
    //Destroys and recreates the grid.
    remakeGrid(){
        let grid = document.getElementById('gridEl');
        let newGrid = grid.cloneNode(true); 
        grid.innerHTML = '';
        grid.parentNode.replaceChild(newGrid, grid);
    }
    //Set up events on the blocks. This needs to be called every time. 
    setupEvents() {
        let $blocks = document.querySelectorAll(`.block`);
        //Yuk....Apolgies, I neevr usually do the whole var that = this thing, I dont like it, but for this purpose it works. 
        let that = this;
        let listener = function (ev) {
            var blockObj = {
                x: this.getAttribute('xpos'),
                y: this.getAttribute('ypos'),
                colour: this.style.backgroundColor
            }
            that.blockClicked(ev, blockObj);
        };

        for (let i = $blocks.length - 1; i >= 0; i--) {
            $blocks[i].addEventListener('click', listener, false);
        };
        
    }
}

window.addEventListener('DOMContentLoaded', () => new BlockGrid().render());
