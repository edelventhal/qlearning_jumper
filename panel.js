let Panel =
{
    //constants / settings
    NUM_PLATFORMS_X: 10,
    NUM_PLATFORMS_Y: 10,
    PLATFORM_WIDTH: 35,
    PLATFORM_HEIGHT: 35,
    BACKGROUND_COLOR: "#6b82ff",
    ACTIONS_TARGET_FPS: 30,
    
    tau: 50 / 1000.0,
    ctx: null,

    //runtime variables
    start: null, //The platform that the Jumper starts from (Rectangle)
    goal: null, //The platform that the Jumper is trying to land on (Rectangle)
    jumper: null,
    goalsReached: 0,
    iterations: 0,
    isRunning: false,
    lastActionsTime: 0,

    ASSETS:
    {
        "block": "assets/brick.gif",
        "ground": "assets/ground.gif",
        "marioStand": "assets/babymariostand.gif",
        "marioJump": "assets/babymariojump.gif"
    },
    
    hasInitialized: false,

    init: function( cb )
    {
        this.setupCanvas();
        this.loadAssets( function()
        {
            QLearner.init();
            this.jumper = new Jumper();
            this.reset();
            this.hasInitialized = true;
            this.update();
            cb();
        }.bind(this));
    },
    
    setupCanvas: function()
    {
        let canvas = document.getElementById( "gameCanvas" );
    
        if (!canvas)
        {
            return false;
        }
    
        // canvas.style.width='100%';
        // canvas.style.height='100%';
        canvas.width    = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        this.WIDTH = canvas.width;
        this.HEIGHT = canvas.height;
    
        this.ctx = canvas.getContext('2d');
    
        return true;
    },

    loadAssets: function( cb )
    {
        let loadedAssetCount = 0;
        let assetCount = 0;
        let loadComplete = function( assetName, loadedAsset )
        {
            this.ASSETS[ assetName ] = loadedAsset;
            loadedAssetCount++;
            if ( loadedAssetCount >= assetCount && cb )
            {
                cb();
            }
        };
    
        for ( assetName in this.ASSETS )
        {
            assetCount++;
            let image = new Image();
            image.onload = loadComplete.bind( this, assetName, image );
            image.src = this.ASSETS[ assetName ];
        }
    
        if ( assetCount <= 0 && cb )
        {
            cb();
        }
    },

    reset: function()
    {
        this.NUM_PLATFORMS_X = Math.floor( this.WIDTH / this.PLATFORM_WIDTH );
        this.NUM_PLATFORMS_Y = Math.floor( this.HEIGHT / this.PLATFORM_HEIGHT );
        
        let startX = Math.floor(Math.random() * this.NUM_PLATFORMS_X) * this.PLATFORM_WIDTH;
        let startY = Math.floor(Math.random() * this.NUM_PLATFORMS_Y) * this.PLATFORM_HEIGHT;
        this.start = new Rectangle(startX, startY, this.PLATFORM_WIDTH, this.PLATFORM_HEIGHT);
    
        let goalX = Math.floor(Math.random() * this.NUM_PLATFORMS_X) * this.PLATFORM_WIDTH;
        let goalY = Math.floor(Math.random() * this.NUM_PLATFORMS_Y) * this.PLATFORM_HEIGHT;
        this.goal = new Rectangle(goalX, goalY, this.PLATFORM_WIDTH, this.PLATFORM_HEIGHT);
    
        this.jumper.reset(this.start.x + this.PLATFORM_WIDTH/2 - 12, this.start.y - 25);
    },

    update: function( delta, now )
    {
        if ( !this.isRunning )
        {
            return;
        }
        
        if ( now - this.lastActionsTime >= 1.0 / this.ACTIONS_TARGET_FPS )
        {
            this.runActions();
            this.lastActionsTime = now;
        }
        
        //there is no reason whatsoever to do this since I'm not lerping between frames at all...
        //(as opposed to just putting it in the if block above)
        this.repaint();
    },

    repaint: function()
    {
        this.ctx.save();
        this.ctx.fillStyle = this.BACKGROUND_COLOR;
        this.ctx.fillRect( 0, 0, this.WIDTH, this.HEIGHT );
        this.ctx.restore();
        this.ctx.save();
        
        this.ctx.drawImage( this.ASSETS.block, this.start.x, this.start.y, this.start.width, this.start.height );
        this.ctx.drawImage( this.ASSETS.ground, this.goal.x, this.goal.y, this.goal.width, this.goal.height );
        let marioAsset = ( this.jumper.isJumping && Math.abs( this.jumper.velocityY ) > 0 ) ? this.ASSETS.marioJump : this.ASSETS.marioStand;
        this.ctx.drawImage( marioAsset, this.jumper.x, this.jumper.y, this.jumper.width, this.jumper.height );
        this.ctx.restore();
    },

    runActions: function()
    {
        this.iterations++;
        
        if ( this.jumper.intersects( this.start ) )
        {
            if ( !this.jumper.isJumping )
            {
                QLearner.jump( this.jumper, this.goal );
            }
            else if ( this.jumper.isJumping && this.jumper.velocityX === 0 && this.jumper.velocityY === 0 )
            {
                QLearner.conclude( this.jumper, this.goal, false );
                this.jumper.reset( this.start.x + this.PLATFORM_WIDTH / 2 - this.jumper.width / 2, this.start.y - this.jumper.height ); //this.reset();
            }
            this.jumper.touchGround();
        }
        else if ( this.jumper.intersects( this.goal ) )
        {
            if ( this.jumper.velocityX === 0 )
            {
                this.goalsReached++;
                QLearner.conclude( this.jumper, this.goal, true );
                this.jumper.reset( this.start.x + this.PLATFORM_WIDTH / 2 - this.jumper.width / 2, this.start.y - this.jumper.height ); //this.reset();
            }
            this.jumper.touchGround();
        }
        else
        {
            this.jumper.applyGravity( this.tau );
        }
    
        if ( this.jumper.y > this.HEIGHT || this.jumper.x < 0 || this.jumper.x > this.WIDTH )
        {
            QLearner.conclude( this.jumper, this.goal, false );
            this.jumper.reset( this.start.x + this.PLATFORM_WIDTH / 2 - this.jumper.width / 2, this.start.y - this.jumper.height );
        }
    
        this.jumper.tick( this.tau );
    },

    startStop: function()
    {
        this.isRunning = !this.isRunning;
        return this.isRunning;
    },

    skip: function()
    {
        for ( let i = 0; i < 1000000; i++ )
        {
            this.runActions();
            if ( i % 1000 == 0 )
            {
                this.reset();
            }
        }
    }
}