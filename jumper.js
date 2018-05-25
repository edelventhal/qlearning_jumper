let Jumper = function()
{
    this.GRAVITY = 30;
    this.FRICTION = 1.05;
    this.REST_VELOCITY_X = 0.5;
    this.SIZE = 25;
    this.x = 0;
    this.y = 0;
    this.width = this.SIZE;
    this.height = this.SIZE;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isJumping = false;
    
    //Also used to initialize the Jumper in the first place
    this.reset = function( newX, newY )
    {
        this.x = newX;
        this.y = newY;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
    };
    
    this.jump = function( velX, velY )
    {
        this.velocityX = velX;
        this.velocityY = velY;
        this.isJumping = true;
    };
    
    //shouldn't these just use the game loop delta? why the fuck tau?
    this.tick = function( tau )
    {
        this.x += this.velocityX * tau;
        this.y += this.velocityY * tau;
    };
    
    this.applyGravity = function( tau )
    {
        this.velocityY += this.GRAVITY * tau;
    };
    
    //shouldn't THIS take a tau or delta or whatever? yeesh...
    this.touchGround = function()
    {
        
        if ( this.velocityY > 0 )
        {
            this.velocityY = 0;
        }
        this.velocityX /= this.FRICTION;
        
        if (  Math.abs( this.velocityX ) < this.REST_VELOCITY_X )
        {
            this.velocityX = 0;
        }
    }
    
    this.intersects = function( rect )
    {
        let bounds = new Rectangle( this.x, this.y, this.width, this.height );
        return rect.intersects( bounds );
    };
}
