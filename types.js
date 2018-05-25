//x,y is the bottom left in terms of intersects
let Rectangle = function( x, y, width, height )
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    this.intersects = function( rect )
    {
        let intersects =
            this.x + this.width  >= rect.x &&
            this.y + this.height >= rect.y &&
            rect.x + rect.width  >= this.x &&
            rect.y + rect.height >= this.y;
            
        return intersects;
    }
};

//n-dimensional array, no bounds checking
let ArrayND = function( sizes, defaultFillValue )
{
    this.arr = {};
    this.sizes = sizes;
    
    //provide coordinates as arguments
    this.findIndex = function()
    {
        let index = 0;
        for ( let i = 0; i < arguments.length && i < this.sizes.length; i++ )
        {
            let indexChange = arguments[i];
            
            if ( arguments[i] < 0 || arguments[i] >= this.sizes[i] )
            {
                throw new Error( "ArrayND out of bounds: parameter #" + i + " is OOB: " + arguments[i] + " is < 0 or >= " + this.sizes[i] );
            }
            
            for ( let sizeIndex = i + 1; sizeIndex < this.sizes.length; sizeIndex++ )
            {
                indexChange *= this.sizes[sizeIndex];
            }
            
            index += indexChange;
        }
        
        return index;
    };
    
    this.fill = function( val )
    {
        if ( this.sizes.length <= 0 )
        {
            return;
        }
        
        let realLength = 1;
        
        for ( let sizeIndex = 0; sizeIndex < this.sizes.length; sizeIndex++ )
        {
            realLength *= this.sizes[ sizeIndex ];
        }
        
        for ( let i = 0; i < realLength; i++ )
        {
            this.arr[i] = val;
        }
    };
    
    //provide coordinates as arguments
    this.get = function()
    {
        let index = this.findIndex.apply( this, arguments );
        return this.arr[ index ];
    };
    
    //provide coordinates as arguments, the last argument is the value to set
    this.set = function()
    {
        let index = this.findIndex.apply( this, arguments );
        this.arr[ index ] = arguments[ arguments.length - 1 ];
    };
    
    if ( defaultFillValue !== undefined )
    {
        this.fill( defaultFillValue );
    }
}
