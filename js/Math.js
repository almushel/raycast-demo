function lineIntersect(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
var A1 = p1y - p0y,
    B1 = p0x - p1x,
    C1 = A1 * p0x + B1 * p0y,
    A2 = p3y - p2y,
    B2 = p2x - p3x, 
    C2 = A2 * p2x + B2 * p2y,
    denominator = A1 * B2 - A2 * B1;

    return {
        x: (B2 * C1 - B1 * C2) / denominator,
        y: (A1 * C2 - A2 * C1) / denominator
    };
}

//Based on http://paulbourke.net/geometry/circlesphere/raysphere.c
/*
   Calculate the intersection of a ray and a sphere
   The line segment is defined from p1 to p2
   The sphere is of radius r and centered at sc
   There are potentially two points of intersection given by
   p = p1 + mu1 (p2 - p1)
   p = p1 + mu2 (p2 - p1)
   Return FALSE if the ray doesn't intersect the sphere.
*/
function RayCircle(p1, p2, sc, r,) {
   var  a,b,c;
   var bb4ac;
   var dp = {x: 0, y: 0};

   dp.x = p2.x - p1.x;
   dp.y = p2.y - p1.y;
   a = dp.x * dp.x + dp.y * dp.y;
   b = 2 * (dp.x * (p1.x - sc.x) + dp.y * (p1.y - sc.y));
   c = sc.x * sc.x + sc.y * sc.y;
   c += p1.x * p1.x + p1.y * p1.y;
   c -= 2 * (sc.x * p1.x + sc.y * p1.y);
   c -= r * r;
   bb4ac = b * b - 4 * a * c;
   if (bb4ac < 0) {
      return false;
   }

   var intersectDist1 = (-b + Math.sqrt(bb4ac)) / (2 * a);
   var intersectDist2 = (-b - Math.sqrt(bb4ac)) / (2 * a);

   return {
       a: intersectDist1,
       b: intersectDist2
   }
}

function rotateVector (vx, vy, angle) {
    
    return  { x: vx * Math.cos(angle) - vy * Math.sin(angle),
              y: vx * Math.sin(angle) + vy * Math.cos(angle)
            }
}