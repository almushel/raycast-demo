# Raycast Demo

## What is a raycaster?

In simple terms, a raycaster is a 2D renderer that fakes a first person 3D perspective by casting a set of rays (lines) for each x coordinate of the display from the camera to the nearest wall in front of the camera. Walls are drawn in vertical stripes and the height of each stripe is determined by the distance from the camera. The creates the illusion of a 3D space with depth, while the camera or player is moving within a 2 dimensional grid. It's a much simpler cousin of ray-tracing, which is a big deal in real-time 3D graphics in 2019.

This approach isn't really used much anymore, because modern computers have much more processing power and dedicated hardware for rendering true three dimensional space in real time. However, it IS still really cool.

[Play the Demo](./demo.html)

## Making a ray-caster
So, I wanted to learn about raycasters, but I didn't really know how, not to mention my lacking (if improving) math skills. So, I found a tutorial on the subject. You can find that here:

<https://lodev.org/cgtutor/raycasting.html>

It's written in C++ and uses a simple graphics library that you can find on that site as well, but I wanted to do more with it, so I adapted it to Javascript and Canvas. I won't retread the ground covered there. Instead, I'll talk about the modifications I made and the ways that I extended the program beyond the scope of the tutorial. Most of these changes can be easily extended or improved in various ways. My main goal was to figure out the basic foundations for drawing a variety of wall shapes.

## Setting the camera direction
In the tutorial above, the camera position, direction, and camera plane are hardcoded. For obvious reasons, it would be beneficial to change those easily for positioning the camera anywhere in a map and facing in any direction. The main roadblock for this is the relationship between the camera direction vector and the camera plane vector. They must be perpendicular. This is explained in that article with quite a bit of detail, but is not demonstrated in the program itself.

To guarantee the proper relationship between them without calculating it yourself every time, the camera plane is found by rotating the direction vector by -PI/2 radians (-90 degrees) or 1.5*PI radians (270 degrees). Since FOV is determined by the ratio between the magnitudes of the direction vector and the camera plane vector, you need to multiply the camera plane vector by a scalar to change it (by default it would be equivalent to an FOV of 90 degrees).

```
    +/- (planeX, planeY) * fov
<---------------*--------------->
 \              ^              /
  \             |             /
   \            |            /
    \           |           /
     \          |          /
      \     dirX, dirY    /
       \        |        /
        \       |       /
         \      |      /
          \     |     /
           \    |    /
            \   |   /
             \  |  /
              \ | /
               \|/
                *
            posX, posY
```

```
planeX = rotateVector(dirX, dirY, -Math.PI/2).x * fov;
planeY = rotateVector(dirX, dirY, -Math.PI/2).y * fov;

function rotateVector (vx, vy, angle) {
    return  { x: vx * Math.cos(angle) - vy * Math.sin(angle),
              y: vx * Math.sin(angle) + vy * Math.cos(angle)
            }
}
```

With this change, you can just set the position, direction, and FOV scalar of the camera without worrying about the initial orientation of the camera plane. This makes move the camera start position around much simpler.

## Drawing walls
In the tutorial program, every pixel of every vertical stripe is calculated individually from the source texture. A similar approach could probably be accomplished in Javascript using ImageData, but the much simpler approach is to simply use the existing clipping and scaling of the canvas drawImage function to draw full height 1 pixel wide strips of the texture. So, that's what I did instead.

```
ctx.drawImage(wallTex, texX, 0, 1, wallTex.height, x, drawStart, 1, lineHeight);
```

## Sprites
Sprites were drawn in much the same way that walls were: one stripe at a time. For each individual vertical stripe the distance to the sprite is compared to the 1 dimensional "zBuffer" containing the distance to each wall hit to determine where it is obscured by walls that were drawn that frame. The stripe is then drawn if it is visible.

That could easily be done using drawImage, but that's a lot of individual draw calls that you don't really need, since the entire sprite will be drawn to the same scale. So, instead, I used the zBuffer to determine obstructions to the right and left sides of each sprite and then drew the entire sprite (clipped and scaled) with one drawImage call.

```
for (var stripe=drawStartX; stripe<=drawEndX; stripe++) {
	if (transformY > whichZBuffer[stripe]) {
		if (stripe - clipStartX <= 1) { //Detect leftmost obstruction
			clipStartX = stripe;
		} else {
			clipEndX = stripe; //Detect rightmost obstruction
			break;
		}
	}	
}
```

## Sprite Rotation
For objects that look similar from every angle, the basic sprite implementations is fine, but most objects and characters look pretty strange when they are always facing directly at you. So, to find the rotation for each sprite, I found the angle from the sprite to the camera. Conveniently, the sprite position relative to the camera is already used to position and scale the sprite on screen.

```
Math.atan2(spriteY, spriteY);
```
Then I find that difference between that angle and the angle of the sprite and add half of the rotation division to to account for the number rounding. The rotationDivision is determined by how many rotations are defined for the sprite.

```
deltaAng = whatAng - this.ang + this.rotationDivision/2;
newRotation = Math.floor((deltaAng)/this.rotationDivision);
```

newRotation is the value that can be plugged into the draw code to clip the correct rotation on the sprite sheet.

## Scrolling skybox
While to tutorial does offer an approach to drawing floors and ceilings, the performance impact was so significant. The program went from consistently matching the monitor refresh rate (on a 60 Hz and a 144Hz screen) to single digit framerates. So I removed it. While a monochromatic floor and ceiling is what Wolfenstein 3D settled for, I wanted to give the environment a better sense of space. My solution was a parallax scrolling skybox. Not reall a realistic approximation of 3D space, but it looks nice.

The approach is pretty simple, I converted the camera direction vector into a simple offset from 0 to 2. Then I used that to update the positions 3 background images of the screen width, 2/3 screen width, and 1/2 screen width respectively. Since the offsets are a multiple of each layer size, they move a different speeds.
```
var dirOffset = (Math.atan2(whichCamera.dirY, whichCamera.dirX) + Math.PI)/ Math.PI;
var foreOffset = Math.floor(dirOffset * canvas.width);
var midOffset = Math.floor(foreOffset/1.5);
var backOffset = Math.floor(foreOffset/2);
```

## Offset walls
A simple raycaster is designed draw orthogonal walls of equal width on a grid. Every wall is 4 sided and square. They are all the same size and on the grid. While this makes things easier, it's also kind of boring. So, the first addition I made is offset walls. More specifically, thin walls in the center of a tile.

For this purpose, I took a shortcut: I assumed that you can only see the wall from one axis (x or y). This means that there are full width walls on 2 opposing sides. This simplifies things and makes sense for doors. Given that constraint, you can simply compare half the distance to the opposite side to the distance to the adjacent side to check for a hit. Then add half the wall width in the step direction to the distance the account for the offset. If it doesn't hit, the ray will continue to the adjacent wall and draw that.

That comparison looks like this for the y-axis:

```
if (sideDistY - (deltaDistY/2) < sideDistX) {
    hit = 1;
    wallYOffset = 0.5 * stepY;
}
```

This will not work for standing thin walls, because they will appear to flip 90 degrees when viewed, or more accurately, when a ray hits them from a new axis. This also means that they cannot be set directly next to each other. Drawing thin walls that can be viewed from all sides is a bit more work. I had to deal with that later with diagonal walls.

## Doors
Doors are more complicated. You need a way to open them and some sort of opening animation, but the more complicated problem is recognizing how far open the door is and letting rays pass through that opening so you can draw the area behind it.

The first steps are pretty easily solved. Door states and offsets (how open each door is from 0.0. to 1.0) can be stored in arrays and modified when the door is interacted with. The door texture is moved by the offset while the door is opening or closing. When the door is fully open, the ray can simply pass through it (as can the camera, for collisions). When it is fully closed, it is functionally just an offset wall. But WHILE it is opening, you need to know where the empty space is.

For this, I needed to calculate where on the door the ray hits and compare that to the door's offset. Fortunately, this calculation is already used to determine which stripe of the texture to draw. But it does that AFTER the ray has registered a hit. So now the distance to the door and the x coordinate on the wall have to be calculated BEFORE the hit can be determined. And then after that, I wanted to use a different texture for the adjacent walls to create a door frame.

This is the extension of the y-axis offset wall check to account for the moving door and the door frame:

```
if (sideDistY - (deltaDistY/2) < sideDistX) { //If ray hits offset wall
	if (1.0 - wallX <= doorOffsets[mapX][mapY]){ //If ray passes through open door
		hit = 0;
		wallYOffset = 0;
	}
 } else { //Draw door frame instead
	mapX += stepX;
	side = 0;
	rayTex = 4;
	wallYOffset = 0;
} 
```

Then I needed one more set of hit conditions to ensure that doorframes are drawn on the visible adjacent wall past the door.

```
if (side == 1 && worldMap[mapX][mapY - stepY] == 3) rayTex = 4;//Draw doorframes on X sides of Y-side walls	
else if (side == 0 && worldMap[mapX - stepX][mapY] == 3) rayTex = 4;//Draw doorframes on Y sides of X-side walls
```

## Push walls
In Wolfenstein 3D, the most well-known game to use a raycasting renderer like this, secrets were hidden behind push walls. These were ordinary-looking walls that, when interacted with, would open away from the player, allowing access to a previously hidden area. Naturally, I wanted to do that, because it's fun. The solution I came up with is an extension of the offset wall and door. The key differences are: 

1. The wall does not have an offset by default
2. It opens away from the camera instead of sliding out of sight

This ended up being a lot easier than regular doors. It uses the same state system as a standard door, but the opening offset is aplied to the wall distance instead and the opening offset is capped at 2 (so it will move through the space behind it and allow the player to pass). What I ended up with was a modification of the original offset wall.

```
if (sideDistY - (deltaDistY*(1-doorOffsets[mapX][mapY])) < sideDistX) { 
	hit = 1;
	wallYOffset = doorOffsets[mapX][mapY] * stepY;
}
```

## Diagonal walls
Diagonal walls were the first feature that could no longer be built directly on the basic orthogonal hit model. Now I needed to know exactly where the ray intersected a specific line segment. For a 45 degree angled wall there are two possible line segments and they are easy to define, since we already know what map square the line occupies.

```
(mapX, mapY + 1) -> (mapX + 1, mapY)
(mapX, mapY) -> (mapX + 1, mappY + 1)
```

Given one of those two lines and the ray defined by these points

```
(posX, posY) -> (posX + rayDirX, posY + rayDirY)
```

I need to calculate the intersection. Here's a video that does a great job of explaining that math: https://www.youtube.com/watch?v=4bIsntTiKfM

Since that gives me the intersection of two lines (of infinite length), I then needed to check that it was on the line segment contained by the map tile. If it isn't, it is not registered as a hit and the ray continues to the next tile.

```
if (intersect.x >= mapX & intersect.x <= mapX + 1 &&
	intersect.y >= mapY && intersect.y <= mapY + 1) { //Check that intersect point is on wall line segment
	hit = 1;
```

Now that I have the point of intersection, I need to calculate a distance value that I can use to draw it. This is a bit different from any of the other walls, because the ray isn't guaranteed to hit one of 4 sides.

```
perpWallDist = ((intersect.x - whichCamera.posX + intersect.y - whichCamera.posY) / 2) / ((rayDirX + rayDirY)/2);
```

## Circular columns

Circular columns were a similar problem, except now I needed to find the intersection of the ray with a circle with a center point of mapX + 0.5, mapY + 0.5 and a radius of 0.5. Honestly, I don't fully understand the math behind this, but I ended up with an intersection function based on this: http://paulbourke.net/geometry/circlesphere/raysphere.c

There are two possible intersections for almost all of these rays. This function returns the distance from the ray origin to both intersections points, but I only need the one closest to the camera position. This happens to be the second value this function returns, so I don't need to compare them to find out. I can get the coordinates of the intersection point by adding the rayDir vector times the distance to the intersection to the camera position.

```
var intersect = {x: whichCamera.posX + rayDirX * intersectDist.b, 
				 y: whichCamera.posY + rayDirY * intersectDist.b}
```

If I only needed the distance, I could skip this step and simply plug that value into the distance calculation directly:

```
perpWallDist = ((intersectDist.b * rayDirX + intersectDist.b * rayDirY) / 2) / ((rayDirX + rayDirY)/2);
```

However, I want to know the exact coordinates so that I can calculate the angle from the circle center point to the intersect. So instead, I substract the camera position from the intersection point I already found to avoid repeating that multiplication:

```
perpWallDist = ((intersect.x - whichCamera.posX + intersect.y - whichCamera.posY) / 2) / ((rayDirX + rayDirY)/2);
```

I can find that angle in radians with atan2 and convert it to an x coordinate on the wall for texture mapping. Doubling this value will repeat the texture around the column twice, which is ideal for a square:

```
wallX = Math.atan2(mapY + 0.5 - intersect.y, mapX + 0.5 - intersect.x) / (Math.PI * 2);
wallX += wallX;
```

## Transparent walls
In a simple program that draws only walls, this is pretty easy to do. You can just store the transparent wall hits for each ray you cast and then draw them in reverse order after you draw the solid wall stripe. The problem with that is that all of your sprites will then be drawn on top of it. I knew this would happen, but pretty quickly got that solution working, assuming that depth sorting from there would be simple. It wasn't exactly.

The solution I landed on involves creating a TransparentWall object that stores the bare minimum information I need to draw each wall. To make things simpler, I again assumed that the camera can only see the wall from one axis. In this case, the values I stored were the screen x value of the ray that hit the wall, the x and y map coordinates of the wall, and the side of the tile that the ray hit. This allows me to store all of the stripes of each wall in a single object. And they are already (mostly) sorted by distance in reverse order.

```
var wallDefined = false;
for (var i=0; i<tpWalls.length; i++) {
	if (tpWalls[i].mapX == mapX && tpWalls[i].mapY == mapY) {
		tpWalls[i].screenX.push(x);
		wallDefined = true;
		break;
	}
}
if (!wallDefined) {
	var tpWall = new TransparentWall(whichCamera, mapX, mapY, side, x);
	tpWalls.push(tpWall);
}
```

After all of the solid walls are drawn, I can compare the distance to each wall with the distance to each of the sprites (which are already sorted). For each iteration of the sprite loop, I draw every wall that is further away than the current sprite before drawing that sprite.

```
for (tp; tp>=0; tp--) {
	var tpDist = ((whichCamera.posX - tpWalls[tp].mapX)*(whichCamera.posX - tpWalls[tp].mapX)) + 
				 ((whichCamera.posY - tpWalls[tp].mapY) * (whichCamera.posY - tpWalls[tp].mapY));

	if (spriteDistance[i] < tpDist) {
		tpWalls[tp].draw();
	} else {
		break;
	}
}
```

Once I've iterated through all of the sprites, any remaining walls can be drawn and the array containing them reset for the next frame.

```
for (tp; tp >= 0; tp--) {//Draw the remaining transparent walls
	tpWalls[tp].draw();
}
tpWalls.length = 0;
```

