/*global requestAnimationFrame*/
/*global performance*/

let GameLoop =
{
    init:function()
    {
        this.listeners = [];
        this.lastFrameTime = performance.now();
        this.mainLoop( this.lastFrameTime );
    },
    
    mainLoop:function( timestamp )
    {
        let delta = ( timestamp - this.lastFrameTime ) / 1000;
        
        for ( let listenerIndex = 0; listenerIndex < this.listeners.length; listenerIndex++ )
        {
            this.listeners[ listenerIndex ].update( delta, timestamp / 1000 );
        }
        
        this.lastFrameTime = timestamp;
        requestAnimationFrame( this.mainLoop.bind(this) );
    }
};