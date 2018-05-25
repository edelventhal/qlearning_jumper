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

let Array4D = function( sizeX, sizeY, sizeZ, sizeW, defaultFillValue )
{
    this.arr = {};
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.sizeZ = sizeZ;
    this.sizeW = sizeW;
    
    this.findIndex = function( x, y, z, w )
    {
        return x * sizeY * sizeZ * sizeW +
               y * sizeZ * sizeW +
               z * sizeW +
               w;
    };
    
    this.fill = function( val )
    {
        for ( let x = 0; x < this.sizeX; x++ )
        {
            for ( let y = 0; y < this.sizeY; y++ )
            {
                for ( let z = 0; z < this.sizeZ; z++ )
                {
                    for ( let w = 0; w < this.sizeW; w++ )
                    {
                        this.set( x, y, z, w, val );
                    }
                }
            }
        }
    };
    
    this.get = function( x, y, z, w )
    {
        return this.arr[ this.findIndex( x, y, z, w ) ];
    };
    
    this.set = function( x, y, z, w, val )
    {
        this.arr[ this.findIndex( x, y, z, w ) ] = val;
    };
    
    if ( defaultFillValue !== undefined )
    {
        this.fill( defaultFillValue );
    }
}
