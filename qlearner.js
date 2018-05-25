let QLearner =
{
    MAX_JUMP: 50,
    epsilon: 0.3, //The chance to explore, basically means ignoring the best value
    beta: 0.9, //The amount of the old value that remains maintained
    gamma: 0.99, //The amount that the best new value is factored in
     //platform X by platform Y by jumpVelX by jumpVelY
    qValues: null,
    totalReward: 0.0,
    lastJump: {x:0,y:0},
    lastDist: {x:0,y:0},
    lastJumpWasRandom: false,
    
    init: function()
    {
        this.qValues = new Array4D( Panel.NUM_PLATFORMS_X * 2 + 3, Panel.NUM_PLATFORMS_Y * 2 + 3, this.MAX_JUMP * 2 + 10, this.MAX_JUMP * 2 + 10 );
        //I could avoid this by doing a smarter check later (coerce undefined to 0)
        this.qValues.fill( 0 );
    },
    
    /**
     * The update method is called every tick by the main loop, and performs the following:
     * 1) Choose the next action from the old LunarLander info
     * 2) Update the lander by choosing the best action, and set its new info
     */
    jump: function( jumper, goal )
    {
        let sx = Math.floor( jumper.x / Panel.PLATFORM_WIDTH );
        let sy = Math.floor( jumper.y / Panel.PLATFORM_HEIGHT );
        let gx = Math.floor( goal.x / Panel.PLATFORM_WIDTH );
        let gy = Math.floor( goal.y / Panel.PLATFORM_HEIGHT );
        
        let dist = { x: sx - gx + Panel.NUM_PLATFORMS_X, y: sy - gy + Panel.NUM_PLATFORMS_Y };
        let jumpVel = this.chooseNextJump( dist.x, dist.y );
        this.lastJump.x = jumpVel.x;
        this.lastJump.y = jumpVel.y;
        this.lastDist.x = dist.x;
        this.lastDist.y = dist.y;
        jumper.jump( jumpVel.x, jumpVel.y );
    },

    /**
     * 3) Get the reward value of the new info, and add it to the total
     * 4) Use all the totaled information of the old and new info to update the Q Values
     * @param j
     * @param goal
     */
    conclude: function( jumper, goal, successful )
    {
        let reward = this.getReward( jumper, goal, successful );
        this.totalReward += reward;
        let sx = Math.floor( jumper.x / Panel.PLATFORM_WIDTH );
        let sy = Math.floor( jumper.y / Panel.PLATFORM_HEIGHT );
        let gx = Math.floor( goal.x / Panel.PLATFORM_WIDTH );
        let gy = Math.floor( goal.y / Panel.PLATFORM_HEIGHT );
        
        this.updateQValues( sx - gx + Panel.NUM_PLATFORMS_X, sy - gy + Panel.NUM_PLATFORMS_Y, reward );
    },
    
    /**
     * The function that decides exactly how much to reward for the LunarLander's
     * current state. 
     * @param l   The LunarLander
     * @return   The reward it deserves for its current state
     */
    getReward: function( jumper, goal, successful )
    {
        //If the jumper landed on the goal, add to the reward. If the jumper died,
        //knock off some of the reward. Simple.
        if ( successful )
        {
            return 1.0;
        }
        return -2.0;
    },
    
    /**
     * Most of the Q learning happens here. This is where the actual qValues array is
     * modified to reflect sucesses and rewards recieved thusfar.
     * @param a   The index of the older altitude
     * @param v   The index of the older velocity
     * @param newA   The index of the newer altitude
     * @param newV   The index of the newer velocity
     * @param reward   The reward the Jumper recieved
     * @param thrust   The thrust that was applied from the last a/v
     */
    updateQValues: function( newX, newY, reward )
    {
        let oldReward = this.qValues.get(this.lastDist.x, this.lastDist.y, this.lastJump.x + this.MAX_JUMP, this.lastJump.y + this.MAX_JUMP );
        let newReward = this.bestQValue( newX, newY );
        let newQValue = oldReward * this.beta + (1 - this.beta) * (reward + this.gamma * newReward);
        
        this.qValues.set(this.lastDist.x, this.lastDist.y, this.lastJump.x + this.MAX_JUMP, this.lastJump.y + this.MAX_JUMP, newQValue);
    },
    
    /**
     * Find the best thrust by finding which index of thrust has the highest total
     * reward. The highest reward index is returned, which becomes the choice in thrust.
     * Depending on the EXPLORATION value, the agent may choose to do random thrust.
     * @param a   The index of the altitude grid value.
     * @param v   The index of the velocity grid value.
     * @return    The best possible thrust at this height and velocity.
     */
    chooseNextJump: function( x, y )
    {
        let best = {x:0,y:0};
        let shouldUseRandom = Math.random() <= this.epsilon;
        let randomOptions = [];
        
        if ( !shouldUseRandom )
        {
            let bestVal = -99999999;
            //this step is absurdely slow. could we have a lookup table instead?
            for (let i = 0; i < this.qValues.sizeZ; i++)
            {
                for (let j = 0; j < this.qValues.sizeW; j++)
                {
                    let val = this.qValues.get(x, y, i, j );
                    if ( val > bestVal )
                    {
                        best.x = i;
                        best.y = j;
                        bestVal = val;
                    }
                    
                    if ( val === 0.0 )
                    {
                        randomOptions.push( { x: i, y: j } );
                    }
                }
            }
            
            //if we have no succeses yet, just use a random result to speed up learning
            if ( bestVal === 0.0 )
            {
                shouldUseRandom = true;
            }
        }
        
        if ( shouldUseRandom )
        {
            if ( randomOptions.length > 0.0 )
            {
                let option = randomOptions[ Math.floor( Math.random() * randomOptions.length ) ];
                best.x = option.x;
                best.y = option.y;
            }
            else 
            {
                best.x = Math.floor(Math.round(Math.random() * this.MAX_JUMP * 2));
                best.y = Math.floor(Math.round(Math.random() * this.MAX_JUMP * 2));
            }
        }
        
        this.lastJumpWasRandom = shouldUseRandom;
        best.x -= this.MAX_JUMP;
        best.y -= this.MAX_JUMP;
        
        return best;
    },
    
    bestJump: function( x, y )
    {
        let best = {x:0,y:0};
        
        for (let i = 0; i < this.qValues.sizeZ; i++)
        {
            for (let j = 0; j < this.qValues.sizeW; j++)
            {
                if ( this.qValues.get(x, y, i, j ) > this.qValues.get(x, y, best.x, best.y ) )
                {
                    best.x = i;
                    best.y = j;
                }
            }
        }
        
        return best;
    },
    
    bestQValue: function( x, y )
    {
        if ( x >= this.qValues.sizeX )
        {
            x = this.qValues.sizeX - 1;
        }
        else if ( x < 0 )
        {
            x = 0;
        }
        
        if ( y >= this.qValues.sizeY )
        {
            y = this.qValues.sizeY - 1;
        }
        else if ( y < 0 )
        {
            y = 0;
        }
        
        let bestJump = this.bestJump( x, y );
        return this.qValues.get( x, y, bestJump.x, bestJump.y );
    },
    
    /**
     * Write the statistics up to this point to the data text file. The text file does
     * not erase itself and constantly appends data.
     */
    writeData: function()
    {
            // try
            // {
            //     PrintWriter writer = new PrintWriter(new BufferedOutputStream(new FileOutputStream(
            //             new File(System.getProperty("user.dir") + System.getProperty("file.separator") + "data.txt"),true)));
            //     writer.println("-----Commence results: " + new Date());
            //
            //     for (int i = 0; i < qValues.length; i++)
            //     {
            //         writer.print("X Distance: " + i + "\t");
            //         for (int j = 0; j < qValues[0].length; j++)
            //         {
            //             writer.print("Y Distance: " + j + "\t");
            //             for (int l = 0; l < qValues[0][0].length; l++)
            //             {
            //                 Point best = new Point(0,0);
            //                 for (int k = 0; k < qValues[0][0][0].length; k++)
            //                     if (qValues[i][j][l][k] > qValues[i][j][best.x][best.y])
            //                         {best.x = l; best.y = k;}
            //                 writer.print("\tX " + best.x + " \tY" + best.y);
            //             }
            //         }
            //         writer.println();
            //     }
            //     writer.println("-----End of results.\n");
            //     writer.close();
            // }
            // catch (Exception e) {e.printStackTrace();}
    },
    
    //Saves the layers to the HD as a .lvl, bringing up a file browser for the save location
    save: function()
    {
        // JFileChooser fc = new JFileChooser();
        //
        // String s = System.getProperty("file.separator");
        // fc.setCurrentDirectory(new File(System.getProperty("user.dir") + s + "AIs" + s));
        // fc.setAcceptAllFileFilterUsed(false);
        // fc.setFileFilter(new QFileFilter());
        // fc.setDialogTitle("Save This AI");
        //
        // int returnVal = fc.showDialog(frame, "Save This AI");
        //
        // if (returnVal == JFileChooser.APPROVE_OPTION)
        // {
        //     //Saves the file, appending .qai if it is not already there
        //         String name = fc.getSelectedFile().getPath();
        //         try
        //     {
        //             if (!name.substring(name.lastIndexOf(".")).equals(".qai"))
        //                 name += ".qai";
        //         }
        //         catch (Exception e) { name += ".qai";}
        //
        //         fc.setSelectedFile(new File(name));
        //         File file = fc.getSelectedFile();
        //
        //     try
        //     {
        //         ObjectOutputStream writer = new ObjectOutputStream(new FileOutputStream(file.getPath()));
        //         writer.writeObject(qValues);
        //         writer.close();
        //     }
        //     catch(Exception e) {System.out.println("Error writing file: " + e);}
        // }
    },
    
    //Uses a JFileChooser to open a .qai file
    open: function()
    {
        // JFileChooser fc = new JFileChooser();
        //
        // String s = System.getProperty("file.separator");
        // fc.setCurrentDirectory(new File(System.getProperty("user.dir") + s + "AIs" + s));
        // fc.setAcceptAllFileFilterUsed(false);
        // fc.setFileFilter(new QFileFilter());
        // fc.setDialogTitle("Load An AI");
        //
        // int returnVal = fc.showDialog(frame, "Load An AI");
        //
        // if (returnVal == JFileChooser.APPROVE_OPTION)
        // {
        //         File file = fc.getSelectedFile();
        //     try
        //     {
        //         ObjectInputStream bReader = new ObjectInputStream(new FileInputStream(file));
        //         qValues = (double[][][][]) bReader.readObject();
        //     }
        //     catch(Exception e) {System.out.println("Error reading file: " + e);}
        // }
    }
};
