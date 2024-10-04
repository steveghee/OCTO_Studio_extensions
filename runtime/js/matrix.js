(function (root, undefined) {
 
function Matrix4() {
    this.m = [ [1, 0, 0, 0],
               [0, 1, 0, 0],
               [0, 0, 1, 0],
               [0, 0, 0, 1]];
    
    this.Set3V = function(v1,v2,v3) {
        this.m[0][0] = v1.v[0];
        this.m[0][1] = v1.v[1];
        this.m[0][2] = v1.v[2];

        this.m[1][0] = v2.v[0];
        this.m[1][1] = v2.v[1];
        this.m[1][2] = v2.v[2];

        this.m[2][0] = v3.v[0];
        this.m[2][1] = v3.v[1];
        this.m[2][2] = v3.v[2];
        return this;
    }
    
    this.Set4V = function(v1,v2,v3,v4) {
        this.m[0][0] = v1.v[0];
        this.m[0][1] = v1.v[1];
        this.m[0][2] = v1.v[2];
        
        this.m[1][0] = v2.v[0];
        this.m[1][1] = v2.v[1];
        this.m[1][2] = v2.v[2];
        
        this.m[2][0] = v3.v[0];
        this.m[2][1] = v3.v[1];
        this.m[2][2] = v3.v[2];
        
        this.m[3][0] = v4.v[0];
        this.m[3][1] = v4.v[1];
        this.m[3][2] = v4.v[2];
        return this;
    }
    
    this.Set4A = function(a) {
        this.m[0][0] = a[0][0];
        this.m[0][1] = a[0][1];
        this.m[0][2] = a[0][2];
        this.m[0][3] = a[0][3];
        
        this.m[1][0] = a[1][0];
        this.m[1][1] = a[1][1];
        this.m[1][2] = a[1][2];
        this.m[1][3] = a[1][3];
        
        this.m[2][0] = a[2][0];
        this.m[2][1] = a[2][1];
        this.m[2][2] = a[2][2];
        this.m[2][3] = a[2][3];
        
        this.m[3][0] = a[3][0];
        this.m[3][1] = a[3][1];
        this.m[3][2] = a[3][2];
        this.m[3][3] = a[3][3];
        return this;
    }
    this.Set16A = function(a) {
        this.m[0][0] = a[0];
        this.m[0][1] = a[1];
        this.m[0][2] = a[2];
        this.m[0][3] = a[3];
        
        this.m[1][0] = a[4];
        this.m[1][1] = a[5];
        this.m[1][2] = a[6];
        this.m[1][3] = a[7];
        
        this.m[2][0] = a[8];
        this.m[2][1] = a[9];
        this.m[2][2] = a[10];
        this.m[2][3] = a[11];
        
        this.m[3][0] = a[12];
        this.m[3][1] = a[13];
        this.m[3][2] = a[14];
        this.m[3][3] = a[15];
        return this;
    }
    this.SetM4 = function(m) {
        this.m[0][0] = m.m[0][0];
        this.m[0][1] = m.m[0][1];
        this.m[0][2] = m.m[0][2];
        this.m[0][3] = m.m[0][3];

        this.m[1][0] = m.m[1][0];
        this.m[1][1] = m.m[1][1];
        this.m[1][2] = m.m[1][2];
        this.m[1][3] = m.m[1][3];
        
        this.m[2][0] = m.m[2][0];
        this.m[2][1] = m.m[2][1];
        this.m[2][2] = m.m[2][2];
        this.m[2][3] = m.m[2][3];
        
        this.m[3][0] = m.m[3][0];
        this.m[3][1] = m.m[3][1];
        this.m[3][2] = m.m[3][2];
        this.m[3][3] = m.m[3][3];
        return this;
    }
    
    this.SetM3 = function(m) {
        this.m[0][0] = m.m[0][0];
        this.m[0][1] = m.m[0][1];
        this.m[0][2] = m.m[0][2];
        this.m[0][3] = 0;

        this.m[1][0] = m.m[1][0];
        this.m[1][1] = m.m[1][1];
        this.m[1][2] = m.m[1][2];
        this.m[1][3] = 0;
        
        this.m[2][0] = m.m[2][0];
        this.m[2][1] = m.m[2][1];
        this.m[2][2] = m.m[2][2];
        this.m[2][3] = 0;
        
        this.m[3][0] = 0;
        this.m[3][1] = 0;
        this.m[3][2] = 0;
        this.m[3][3] = 1;
        return this;
    }
    
    this.Clone = function() {
        return new Matrix4().SetM4(this);
    }
    
    this.FromString = function (str) {
        var pcs = str.trim().split(',');                // split by comma
        if (pcs.length < 6) pcs = str.trim().split(' ');// try spaces
        if (pcs.length === 16) {
            //its a matrix
            for (var i=0;i<4;i++) {
                for (var j=0;j<4;j++) {
                    this.m[i][j]=parseFloat(pcs[4*i + j]);      
                }
            }
        } else if (pcs.length === 6) {
            // euler/translation
            this.SetM4(this.RotateFromEuler(pcs[0],pcs[1],pcs[2],true)
                           .Translate(pcs[3],pcs[4],pcs[5]));
        } else if (pcs.length === 12) {
            // its a 3x4  matrix
            for (var i=0;i<4;i++) {
                for (var j=0;j<3;j++) {
                    this.m[i][j]=parseFloat(pcs[3*i + j]);      
                }
            }
        }
        return this;
    }
    
    this.FromNormalAt = function(N,at) {
        var up = new Vector4().Set3(0,1,0);
        var gaze = N.Normalize();
        if (Math.abs(up.DotP(gaze)) > 0.999) {
          up = new Vector4().Set3(1,0,0); //choose a different axes
        }
        var xd   = up.Normalize().CrossP(gaze);
        var nup  = gaze.CrossP(xd).Normalize(); // recalc up
        var pose = new Matrix4().Set4V(xd,nup,gaze,at);
        return pose;
    }

    this.RotateFromQuaternion = function(q) {
        var x = q.x,
            y = q.y,
            z = q.z,
            w = q.w;
        var x2 = x + x,
            y2 = y + y,
            z2 = z + z;
        var xx = x * x2,
            xy = x * y2,
            xz = x * z2;
        var yy = y * y2,
            yz = y * z2,
            zz = z * z2;
        var wx = w * x2,
            wy = w * y2,
            wz = w * z2;
            
        var r =[ [ (1 - (yy + zz)), (xy + wz),       (xz - wy), 0],
                 [ (xy - wz),       (1 - (xx + zz)), (yz + wx), 0],
                 [ (xz + wy),       (yz - wx), (1 - (xx + yy)), 0],
                 [ 0,               0,               0,         1] ];
        return this.Multiply(r);
    }
    
    this.Translate = function (x, y, z) {
        var t = [ [1, 0, 0, 0],
                  [0, 1, 0, 0],
                  [0, 0, 1, 0],
                  [x, y, z, 1]];
        return this.Multiply(t);
    }

    this.TranslateV = function (v) {  // takes an array vector
        var t = [ [1,    0,    0,    0],
                  [0,    1,    0,    0],
                  [0,    0,    1,    0],
                  [v[0], v[1], v[2], 1]];
        return this.Multiply(t);
    }
    
    this.TranslateV4 = function (v) {  // takes a Vector4
        var t = [ [1, 0, 0, 0],
                  [0, 1, 0, 0],
                  [0, 0, 1, 0],
                  [v.v[0], v.v[1], v.v[2], 1]];
        return this.Multiply(t);
    }
    
    this.Scale = function (x, y, z) {
        var s = [ [x, 0, 0, 0],
                  [0, y, 0, 0],
                  [0, 0, z, 0],
                  [0, 0, 0, 1]];
        return this.Multiply(s);
    }
    
    this.ScaleU = function (u) {  // uniform scale
        var s = [ [u, 0, 0, 0],
                  [0, u, 0, 0],
                  [0, 0, u, 0],
                  [0, 0, 0, 1]];
        return this.Multiply(s);
    }
    
    this.ScaleV = function (v) {  // takes an array
        var s = [ [v[0], 0,    0,    0],
                  [0,    v[1], 0,    0],
                  [0,    0,    v[2], 0],
                  [0,    0,    0,    1]];
        return this.Multiply(s);
    }
    
    this.ScaleV4 = function (v) {  // takes a Vector4
        var s = [ [v.v[0], 0,      0,      0],
                  [0,      v.v[1], 0,      0],
                  [0,      0,      v.v[2], 0],
                  [0,      0,      0,      v.v[3]]];
        return this.Multiply(s);
    }
    
    this.RotateA = function(a) {  // set from an array
        var r = [ [a[0], a[1], a[2], 0],
                  [a[3], a[4], a[5], 0],
                  [a[6], a[7], a[8], 0],
                  [0   , 0   , 0   , 1] ];
        return this.Multiply(r);
    }
    
    this.Rotate = function (axis,angle,deg) {
        function deg2rad(d) { return (deg!=undefined) ? d * Math.PI / 180 : d; }
        
        var s  = Math.sin(deg2rad(angle));
        var c0 = Math.cos(deg2rad(angle));
        var c1 = 1 - c0;
        
        // assume normalised input vector
        var u = axis[0];
        var v = axis[1];
        var w = axis[2];
        var r = [
            [(u * u * c1) + c0,      (u * v * c1) + (w * s), (u * w * c1) - (v * s), 0],
            [(u * v * c1) - (w * s), (v * v * c1) + c0,      (v * w * c1) + (u * s), 0],
            [(u * w * c1) + (v * s), (w * v * c1) - (u * s), (w * w * c1) + c0,      0],
            [0,                      0,                      0,                      1]
        ];
        return this.Multiply(r);
    }
    
    this.RotateFromAxisAngle = this.Rotate;
  
    this.RotateFromAxisAngleV = function (aa,deg) {
        function deg2rad(d) { return (deg!=undefined) ? d * Math.PI / 180 : d; }
        
        var s  = Math.sin(deg2rad(aa.W()));
        var c0 = Math.cos(deg2rad(aa.W()));
        var c1 = 1 - c0;
        
        // assume normalised input vector
        var u = aa.X();
        var v = aa.Y();
        var w = aa.Z();
        var r = [
            [(u * u * c1) + c0,      (u * v * c1) + (w * s), (u * w * c1) - (v * s), 0],
            [(u * v * c1) - (w * s), (v * v * c1) + c0,      (v * w * c1) + (u * s), 0],
            [(u * w * c1) + (v * s), (w * v * c1) - (u * s), (w * w * c1) + c0,      0],
            [0,                      0,                      0,                      1]
        ];
        return this.Multiply(r);
    }
    
    this.RotateFromEuler = function(x, y, z, deg) {
        var mt = new Matrix4()
                     .Rotate([1,0,0], x, deg)
                     .Rotate([0,1,0], y, deg)
                     .Rotate([0,0,1], z, deg);
        return this.Multiply(mt.m); 
    }
    
    this.RotateFromEulerV = function(ev, deg) {
        var mt = new Matrix4()
                     .Rotate([1,0,0], ev.X(), deg)
                     .Rotate([0,1,0], ev.Y(), deg)
                     .Rotate([0,0,1], ev.Z(), deg);
        return this.Multiply(mt.m); 
    }

    this.Transpose = function () {

	var tmp;

	tmp = this.m[0][1]; this.m[0][1] = this.m[1][0]; this.m[1][0] = tmp;
	tmp = this.m[0][2]; this.m[0][2] = this.m[2][0]; this.m[2][0] = tmp;
	tmp = this.m[1][2]; this.m[1][2] = this.m[2][1]; this.m[2][1] = tmp;

	tmp = this.m[0][3]; this.m[0][3] = this.m[3][0]; this.m[3][0] = tmp;
	tmp = this.m[1][3]; this.m[1][3] = this.m[3][1]; this.m[3][1] = tmp;
	tmp = this.m[2][3]; this.m[2][3] = this.m[3][2]; this.m[3][2] = tmp;

	return this;

    },
    
    this.Determinant = function () {

	// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
        var
        
        n11 = this.m[0][0], n12 = this.m[0][1], n13 = this.m[0][2], n14 = this.m[0][3],
        n21 = this.m[1][0], n22 = this.m[1][1], n23 = this.m[1][2], n24 = this.m[1][3],
        n31 = this.m[2][0], n32 = this.m[2][1], n33 = this.m[2][2], n34 = this.m[2][3],
        n41 = this.m[3][0], n42 = this.m[3][1], n43 = this.m[3][2], n44 = this.m[3][3],
        
        t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
        t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
        t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
        t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
        
        var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
        return det;
    },

    this.Invert = function ( throwOnDegenerate ) {

	// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
        var
        
        n11 = this.m[0][0], n12 = this.m[0][1], n13 = this.m[0][2], n14 = this.m[0][3],
        n21 = this.m[1][0], n22 = this.m[1][1], n23 = this.m[1][2], n24 = this.m[1][3],
        n31 = this.m[2][0], n32 = this.m[2][1], n33 = this.m[2][2], n34 = this.m[2][3],
        n41 = this.m[3][0], n42 = this.m[3][1], n43 = this.m[3][2], n44 = this.m[3][3],
        
       	t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
        t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
        t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
        t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
        
        var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
        if ( det === 0 ) {
            var msg = "Invert() can't invert matrix, determinant is 0";
            if ( throwOnDegenerate === true ) {
                throw new Error( msg );
            } else {
                console.warn( msg );
            }
            return new Matrix4();
        }

        var detInv = 1 / det;
        
        this.m[0][0] = t11 * detInv;
        this.m[1][0] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
        this.m[2][0] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
        this.m[3][0] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

        this.m[0][1] = t12 * detInv;
        this.m[1][1] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
        this.m[2][1] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
        this.m[3][1] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

        this.m[0][2] = t13 * detInv;
        this.m[1][2] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
        this.m[2][2] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
        this.m[3][2] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

        this.m[0][3] = t14 * detInv;
        this.m[1][3] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
        this.m[2][3] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
        this.m[3][3] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;

        return this;
    },

    this.Multiply = function (b) {
          var dst = [ 
            [   ((this.m[0][0] * b[0][0]) + (this.m[0][1] * b[1][0]) + (this.m[0][2] * b[2][0]) + (this.m[0][3] * b[3][0])),
                ((this.m[0][0] * b[0][1]) + (this.m[0][1] * b[1][1]) + (this.m[0][2] * b[2][1]) + (this.m[0][3] * b[3][1])),
                ((this.m[0][0] * b[0][2]) + (this.m[0][1] * b[1][2]) + (this.m[0][2] * b[2][2]) + (this.m[0][3] * b[3][2])),
                ((this.m[0][0] * b[0][3]) + (this.m[0][1] * b[1][3]) + (this.m[0][2] * b[2][3]) + (this.m[0][3] * b[3][3])) ],
            [   ((this.m[1][0] * b[0][0]) + (this.m[1][1] * b[1][0]) + (this.m[1][2] * b[2][0]) + (this.m[1][3] * b[3][0])),
                ((this.m[1][0] * b[0][1]) + (this.m[1][1] * b[1][1]) + (this.m[1][2] * b[2][1]) + (this.m[1][3] * b[3][1])),
                ((this.m[1][0] * b[0][2]) + (this.m[1][1] * b[1][2]) + (this.m[1][2] * b[2][2]) + (this.m[1][3] * b[3][2])),
                ((this.m[1][0] * b[0][3]) + (this.m[1][1] * b[1][3]) + (this.m[1][2] * b[2][3]) + (this.m[1][3] * b[3][3])) ],
            [   ((this.m[2][0] * b[0][0]) + (this.m[2][1] * b[1][0]) + (this.m[2][2] * b[2][0]) + (this.m[2][3] * b[3][0])),
                ((this.m[2][0] * b[0][1]) + (this.m[2][1] * b[1][1]) + (this.m[2][2] * b[2][1]) + (this.m[2][3] * b[3][1])),
                ((this.m[2][0] * b[0][2]) + (this.m[2][1] * b[1][2]) + (this.m[2][2] * b[2][2]) + (this.m[2][3] * b[3][2])),
                ((this.m[2][0] * b[0][3]) + (this.m[2][1] * b[1][3]) + (this.m[2][2] * b[2][3]) + (this.m[2][3] * b[3][3])) ],
            [   ((this.m[3][0] * b[0][0]) + (this.m[3][1] * b[1][0]) + (this.m[3][2] * b[2][0]) + (this.m[3][3] * b[3][0])),
                ((this.m[3][0] * b[0][1]) + (this.m[3][1] * b[1][1]) + (this.m[3][2] * b[2][1]) + (this.m[3][3] * b[3][1])),
                ((this.m[3][0] * b[0][2]) + (this.m[3][1] * b[1][2]) + (this.m[3][2] * b[2][2]) + (this.m[3][3] * b[3][2])),
                ((this.m[3][0] * b[0][3]) + (this.m[3][1] * b[1][3]) + (this.m[3][2] * b[2][3]) + (this.m[3][3] * b[3][3])) ]];
        this.m = dst;
        return this;
    }

    this.makeOrtho = function(left, right, bottom, top, znear, zfar) {
        var X = -(right + left) / (right - left);
        var Y = -(top + bottom) / (top - bottom);
        var Z = -(zfar + znear) / (zfar - znear);
        var A = 2 / (right - left);
        var B = 2 / (top - bottom);
        var C = -2 / (zfar - znear);

        this.m = [[A, 0, 0, 0],
                  [0, B, 0, 0],
                  [0, 0, C, 0],
                  [X, Y, Z, 1]];
        return this;
    }

    this.makePerspective = function(fovy, aspect, znear, zfar) {
        var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
        var ymin = -ymax;
        var xmin = ymin * aspect;
        var xmax = ymax * aspect;

        this.makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
        return this;
    }

    this.makeFrustum = function(left, right, bottom, top, znear, zfar) {
        var X = 2 * znear / (right - left);
        var Y = 2 * znear / (top - bottom);
        var A = (right + left) / (right - left);
        var B = (top + bottom) / (top - bottom);
        var C = -(zfar + znear) / (zfar - znear);
        var D = -2 * zfar * znear / (zfar - znear);

        this.m = [[X, 0, 0, 0],
                  [0, Y, 0, 0],
                  [A, B, C, -1],
                  [0, 0, D, 1]];
        return this;
    }
    
    this.makeShadow = function(p0, p1, p2, light) {
        // work out plane equation Ax+By+Cz+D=0 from p0,1,2
        var p01 = p1.Sub(p0);
        var p02 = p2.Sub(p0);
        var ABC = p01.CrossP(p02);
        // work out D by substituting one of the points
        var D   = 0.0 - (p0.v[0]*ABC.v[0] + p0.v[1]*ABC.v[1] + p0.v[2]*ABC.v[2]);
        var ground     = new Vector4().SetV3(ABC);
            ground.v[3]= D;
        console.log(ground.ToString());            
        console.log(light.ToString());
        //
        var dot = ground.DotP(light);
        // and now create the projection matrix
        this.m = [[dot-(light.v[0]*ground.v[0]), 0.0-(light.v[1]*ground.v[0]), 0.0-(light.v[2]*ground.v[0]), 0.0-(light.v[3]*ground.v[0])],
                  [0.0-(light.v[0]*ground.v[1]), dot-(light.v[1]*ground.v[1]), 0.0-(light.v[2]*ground.v[1]), 0.0-(light.v[3]*ground.v[1])],
                  [0.0-(light.v[0]*ground.v[2]), 0.0-(light.v[1]*ground.v[2]), dot-(light.v[2]*ground.v[2]), 0.0-(light.v[3]*ground.v[2])],
                  [0.0-(light.v[0]*ground.v[3]), 0.0-(light.v[1]*ground.v[3]), 0.0-(light.v[2]*ground.v[3]), dot-(light.v[3]*ground.v[3])]];
        return this;
    }
    
    // builds a lookat matrix where the Z (gaze) axis will point in the 
    // direction specified by the at,from points. if forceup is defined and true, the
    // given up vector is retained
    this.makeLookat = function(at,from,up,forceup) {
        var lookv  = at.Sub(from).Normalize();
        var xd     = up.Normalize().CrossP(lookv.Normalize());
        var nup    = (forceup === undefined || forceup === false) ? lookv.CrossP(xd).Normalize() : up; // recalc up?
        if (forceup != undefined && forceup === true) lookv = xd.CrossP(nup).Normalize();              // recalc lookv
        return new Matrix4().Set4V(xd,nup,lookv,from);
    }
    
    // builds a pose matrix from the pos,gaze,up vectors
    // for example the vectors passed in the 'tracking' event
    this.makePose = function(at,gaze,up) {
        var xd   = up.Normalize().CrossP(gaze.Normalize());
        var nup  = gaze.CrossP(xd).Normalize(); // recalc up
        var pose = new Matrix4().Set4V(xd,nup,gaze,at);
        return pose;
    }
    
    // builds a pose matrix from a location and quaternion orientation
    this.makePoseWithQuat = function(at,quat) {
        // first rotate
        var rot = new Matrix4().RotateFromQuaternion(quat);
        // then translate
        return rot.Translate(at);
    }
  
    this.Flatten = function () {
        var f = [];
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4 ; j++) {
                f.push(this.m[i][j]);
            }
        }
        return f;
    }
    
    this.ToEuler = function(toDeg) {
        var clamp = function(x) {
            if (Math.abs(x) < 1e-6)
              return 0;
            else 
              return x;
        }
    
        // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
        var m11 = this.m[0][0], m12 = this.m[1][0], m13 = this.m[2][0];
        var m21 = this.m[0][1], m22 = this.m[1][1], m23 = this.m[2][1];
        var m31 = this.m[0][2], m32 = this.m[1][2], m33 = this.m[2][2];
        var sy = Math.sqrt(m32 * m32 + m33 * m33);
        
        var singular = (sy < 0.000001) ? true : false;
        var _x, _y, _z;
        
        if (singular === false) {
            _x = Math.atan2(  m32, m33);
            _y = Math.atan2(- m31, sy);
            _z = Math.atan2(  m21, m11);
        } else {
            _x = Math.atan2(- m23, m22);
            _y = Math.atan2(- m31, sy);
            _z = 0;
        }
        
        // convert to degrees?
        var deg = (toDeg != undefined) ? 180.0/Math.PI : 1; 
        var attitude = clamp(deg * _x);
        var heading  = clamp(deg * _y);
        var bank     = clamp(deg * _z);
        
        return { 
          attitude:attitude, 
          heading :heading, 
          bank    :bank 
        };
    }
    
    this.ToString = function (p) {
        var s = '';
        for (var i = 0; i < 4; i++) {
            if (p!=undefined) s = s.concat(this.m[i].map(x => parseFloat(x).toFixed(p)).toString());
            else s = s.concat(this.m[i].toString());
            s = s.concat(',');
        }
        // now replace the commas with spaces
        s = s.replace(/,/g, ' ');
        return s;
    }
    
    this.To3x3String = function (p,c) {
        var s = '';
        for (var i = 0; i < 3; i++) {
            if (p!=undefined) s = s.concat(this.m[i].map(x => parseFloat(x).toFixed(p)).toString());
            else s = s.concat(this.m[i].slice(0,3).toString());
            s = s.concat(',');
        }
        // now replace the commas with spaces
        if (c == undefined) s = s.replace(/,/g, ' ');
        return s;
    }
    
    this.ToPosEuler = function(toDeg) {
        var clamp = function(x) {
            if (Math.abs(x) < 1e-6)
              return 0;
            else 
              return x;
        }

        var rot = this.ToEuler(toDeg);
        
        var simple = {};
        simple.pos = new Vector4().Set3(clamp(this.m[3][0]), clamp(this.m[3][1]), clamp(this.m[3][2]));
        simple.rot = new Vector4().Set3(rot.attitude, rot.heading, rot.bank);
        return simple;
    }
    
    this.toPosGazeUp = function() {
        var clamp = function(x) {
            if (Math.abs(x) < 1e-6)
              return 0;
            else 
              return x;
        }
        var simple = {};
        simple.pos  = new Vector4().Set3(clamp(this.m[3][0]), clamp(this.m[3][1]), clamp(this.m[3][2]));
        simple.gaze = new Vector4().Set3(clamp(this.m[2][0]), clamp(this.m[2][1]), clamp(this.m[2][2]));
        simple.up   = new Vector4().Set3(clamp(this.m[1][0]), clamp(this.m[1][1]), clamp(this.m[1][2]));
        return simple;
    }
    
    this.ToPosRotM3 = function() {
        var clamp = function(x) {
            if (Math.abs(x) < 1e-6)
              return 0;
            else 
              return x;
        }

        var simple = {};
        simple.pos = new Vector4().Set3(clamp(this.m[3][0]), clamp(this.m[3][1]), clamp(this.m[3][2]));
        simple.rot = new Matrix4().SetM3(this);
        return simple;
    }
    
    this.ToPosAxisAngle = function() {
        var clamp = function(x) {
            if (Math.abs(x) < 1e-6)
              return 0;
            else 
              return x;
        }

        var simple = {};
        simple.pos = new Vector4().Set3(clamp(this.m[3][0]), clamp(this.m[3][1]), clamp(this.m[3][2]));
        simple.rot = new Quat().FromMatrix(this).ToAxisAngle();
        return simple;
    }
}

// quick way to do perspective matrices
function MatrixP() { }
MatrixP.prototype = new Matrix4()
function MatrixP(fovy, aspect, znear, zfar) {
    this.makePerspective(fovy, aspect, znear, zfar);
}

// quick way to do orthographic matrices
function MatrixO() { }
MatrixO.prototype = new Matrix4()
function MatrixO(left, right, bottom, top, znear, zfar) {
    this.makeOrtho(left, right, bottom, top, znear, zfar);
}
// quick way to do projected shadow matrices
function MatrixS() { }
MatrixS.prototype = new Matrix4()
function MatrixS(p0,p1,p2,light) {
    this.makeShadow(p0,p1,p2,light);
}

function Plane() {
    this.v = [0, 0, 0, 0];
    this.m = undefined;
    this.n = undefined;
    this.w = undefined;
    this.h = undefined;
    
    this.SetSize = function(w,h) {
      this.w = w;
      this.h = h;
    }
    
    this.SetABCD = function(a,b,c,d) {
      this.Set4(a,b,c,d);                            
      return this;
    }
    
    this.FromPosEuler = function(x,y,z,rx,ry,rz,deg) {
      this.m = new Matrix4().RotateFromEuler(rx,ry,rz,deg).Translate(x,y,z);
      var n = new Vector4().Set3a(this.m.m[2]);
      var D = - (n.X()*x + n.Y()*y + n.Z()*z);
      this.Set4(n.X(), n.Y(), n.Z(), D);                            
      return this;
    }
    
    this.FromPoints = function(points) {
      //assume this is an array of Vectors
      let AB = points[1].Clone().Sub(points[0]).Normalize();
      let AC = points[2].Clone().Sub(points[0]).Normalize();
      //let dp = AB.DotP(AC);
      //if (Math.abs(dp) > 0.999999999) return undefined;
      let N  = AC.CrossP(AB).Normalize();
      //plane eq = Ax + By + Cz + D =0
      //substiture a point to calculare D
      let D = - N.Mul(points[0]);
      this.SetABCD(N.X(),N.Y(),N.Z(),D);
      return this;
    }
    
    this.X = function() { return this.v[0] }
    this.Y = function() { return this.v[1] }
    this.Z = function() { return this.v[2] }
    this.D = function() { return this.v[3] }
    this.M = function() { return this.m }
    this.I = function() { return this.m.Clone().Invert() }
    this.XYZ = function() { return new Vector4().Set3(this.X(),this.Y(),this.Z()) };

    this.Set4 = function (x, y, z, w) {
      this.v[0] = x;
      this.v[1] = y;
      this.v[2] = z;
      this.v[3] = w;
      return this;
    }
  
    this.Distance = function(point) {
        return (this.v[0] * point.v[0]) +  //Ax
               (this.v[1] * point.v[1]) +  //By
               (this.v[2] * point.v[2]) +  //Cz
                this.v[3];                //D
    }
  
    // raytrace this plane (ABCD) from starting point x0 and direction x1
    this.Raytrace = function(x0,x1) {
      var Pn = this.XYZ();
      var Rd = x1.Normalize(); 
      var Ro = x0;
      var vd = - Pn.DotP(Rd);
        
      // plane and ray are parallel?
      if (Math.abs(vd) < 0.0000000001 ) {
        return { t:undefined }
      }
      
      // compute intersection point
      var vo = Pn.DotP(Ro) + this.D();
      var t = vo / vd;
      var p = Ro.Add(Rd.Scale(t));
      if (this.IsPointInBounds(p))
        return { t:t, p:p };
      else 
        return { t:undefined };
    }
    
    this.IsPointInBounds = function(p) {
        
      if (this.w == undefined || this.h == undefined) 
        return true;
        
      var s = p.Clone().Transform(this.I());
        
      //assumes image is centered at 0,0  
      var dh = Math.abs(s.Y()) - this.h / 2;
      var dw = Math.abs(s.X()) - this.w / 2;
      var inbounds = (dh < 0 && dw <0);
      
      return inbounds;
    }
    
    this.Quantize = function(p,u,v) {
        
      function isEven(n) {
        return n % 2 == 0;
      }
      // returns a position that is centered on a grid of u,v blocks that
      // are mapped to the plane

      if (this.w == undefined || this.h == undefined) 
        return { p:p }; 
        
      var dw = this.w / u;
      var dh = this.h / v;
      
      //transform into the space of the plane
      var s = p.Transform(this.I());
      var t = new Vector4().Set3(isEven(u)?0.5:0, isEven(v)?0.5:0, 0);
      var nx = t.X() + Math.floor(s.X()/ dw); 
      var ny = t.Y() + Math.floor(s.Y()/ dh);
      var ix = Math.ceil(nx+u/2);
      var iy = Math.ceil(ny+v/2);
      //and transform back out into 3d space
      var q = new Vector4().Set3(nx*dw, ny*dh, 0).Transform(this.m);
      
      //return quantised point and the index offset
      return { p:q, ix:ix, iy:iy };
    }
    
    // turn a point into a pose relative to the plane orientation
    this.MakePose = function (p) {
      return new Matrix4().SetM3(this.m).TranslateV(p.v);
    }
}

function Vector4() {
    this.v = [0, 0, 0, 1];
    
    this.Clone = function() {
        return new Vector4().SetV4(this);
    }
    
    this.Set = function (x) {
        this.v[0] = x.v[0];
        this.v[1] = x.v[1];
        this.v[2] = x.v[2];
        return this;
    }
    
    this.Set1 = function (xyz) {
        this.v[0] = xyz;
        this.v[1] = xyz;
        this.v[2] = xyz;
        return this;
    }
    
    this.Set3 = function (x, y, z) {
        this.v[0] = x;
        this.v[1] = y;
        this.v[2] = z;
        return this;
    }

    this.SetV3 = function (v) {
        this.v[0] = v.v[0];
        this.v[1] = v.v[1];
        this.v[2] = v.v[2];
        return this;
    }
    
    this.SetV4 = function (v) {
        this.v[0] = v.v[0];
        this.v[1] = v.v[1];
        this.v[2] = v.v[2];
        this.v[3] = v.v[3];
        return this;
    }
    
    this.Set4 = function (x, y, z, w) {
        this.v[0] = x;
        this.v[1] = y;
        this.v[2] = z;
        this.v[3] = w;
        return this;
    }
    
    this.Set3a = function (a) {
        this.v[0] = a[0];
        this.v[1] = a[1];
        this.v[2] = a[2];
        return this;
    }
    
    this.Set3o = function (o) {
        this.v[0] = o.x;
        this.v[1] = o.y;
        this.v[2] = o.z;
        return this;
    }
    
    this.Set3a = function (a) {
        this.v[0] = a[0];
        this.v[1] = a[1];
        this.v[2] = a[2];
        return this;
    }
    
    this.Set4a = function (a) {
        this.v[0] = a[0];
        this.v[1] = a[1];
        this.v[2] = a[2];
        this.v[3] = a[3];
        return this;
    }
    
    this.Set4o = function (o) {
        this.v[0] = o.x;
        this.v[1] = o.y;
        this.v[2] = o.z;
        this.v[3] = o.w || o.a || 1;
        return this;
    }
    
    this.FromEuler = function (e) {
        this.v[0] = e.attitude;
        this.v[1] = e.heading;
        this.v[2] = e.bank;
        this.v[3] = 1.0;
        return this;
    }
    
    this.X = function() { return this.v[0] }
    this.Y = function() { return this.v[1] }
    this.Z = function() { return this.v[2] }
    this.W = function() { return this.v[3] }
    this.XYZ = function() { return new Vector4().Set3(this.X(),this.Y(),this.Z()) };
    this.YZW = function() { return new Vector4().Set3(this.Y(),this.Z(),this.W()) };

    this.FromString = function (str) {
        var pcs = str.trim().split(',');                // split by comma
        if (pcs.length < 3) pcs = str.trim().split(' ');// try spaces
        this.v[0] = parseFloat(pcs[0]);
        this.v[1] = parseFloat(pcs[1]);
        this.v[2] = parseFloat(pcs[2]);
        this.v[3] = pcs.length > 3 ? parseFloat(pcs[3]) : 1.0;
        return this;
    }
    
    this.Length = function () {
        var hyp = (this.v[0] * this.v[0]) + (this.v[1] * this.v[1]) + (this.v[2] * this.v[2]);
        var rad = (hyp > 0) ? Math.sqrt(hyp) : 0;
        return rad;
    }
    
    this.Distance = function(v2,mask) {
        // mask alllows different planar dimensions e.g mask=[1,0,1] will mask out the Y (height) component
        // returning the xz distance between 2 points
        if (mask === undefined) mask = [1,1,1];
        var x = mask[0]*(this.v[0] - v2.v[0]);
        var y = mask[1]*(this.v[1] - v2.v[1]);
        var z = mask[2]*(this.v[2] - v2.v[2]);
        var hyp = (x * x) + (y * y) + (z* z);
        var dist = (hyp > 0) ? Math.sqrt(hyp) : 0;
        return dist;    
    }

    this.Normalize = function () {
        var rad  = this.Length();
        if (rad > 0) {
            this.v[0] = this.v[0] / rad,
            this.v[1] = this.v[1] / rad,
            this.v[2] = this.v[2] / rad;
        }
        return this;
    }
    
    this.Negate = function () {
        this.v[0] = - this.v[0];
        this.v[1] = - this.v[1];
        this.v[2] = - this.v[2];
        return this;
    }
    this.Normalize2 = function () {
        var rad  = this.Length();
        var norm = new Vector4().Set3(
            this.v[0] / rad,
            this.v[1] / rad,
            this.v[2] / rad
        );
        return norm;
    }
    this.Negate2 = function () {
        var neg = new Vector4().Set3(
            0.0 - this.v[0],
            0.0 - this.v[1],
            0.0 - this.v[2]
        );
        return neg;
    }

    this.DotP = function (v2) {
        // cos(theta)
        var cost = (this.v[0] * v2.v[0]) + (this.v[1] * v2.v[1]) + (this.v[2] * v2.v[2]);
        return cost;
    }

    this.DotP4 = function (v2) {
        // cos(theta)
        var cost = (this.v[0] * v2.v[0]) + (this.v[1] * v2.v[1]) + (this.v[2] * v2.v[2]) + (this.v[3] * v2.v[3]);
        return cost;
    }
    
    this.CrossP = function (v2) {
        var x = (this.v[1] * v2.v[2]) - (v2.v[1] * this.v[2]);
        var y = (this.v[2] * v2.v[0]) - (v2.v[2] * this.v[0]);
        var z = (this.v[0] * v2.v[1]) - (v2.v[0] * this.v[1]);
        
        //this.v = [x, y, z, 1];
        //return this;
        var cross = new Vector4().Set3(x, y, z);
        return cross;
    }
    
    this.Add = function (v2) {
        var add = new Vector4().Set3(
          	(this.v[0] + v2.v[0]),
        	(this.v[1] + v2.v[1]),
        	(this.v[2] + v2.v[2]));        
        return add;
    }
    
    this.Sub = function (v2) {
        var sub = new Vector4().Set3(
          	(this.v[0] - v2.v[0]),
        	(this.v[1] - v2.v[1]),
        	(this.v[2] - v2.v[2]));        
        return sub;
    }
    
    this.Mul = function (v2) {
        var prod = (this.v[0] * v2.v[0]) + 
        	   (this.v[1] * v2.v[1]) +
        	   (this.v[2] * v2.v[2]) ;        
        return prod;
    }
    
    this.Scale = function (s) {
        var scale = new Vector4().Set3(this.v[0]*s, this.v[1]*s, this.v[2]*s);
        return scale;
    }
    
    this.ScaleV4 = function (v) {
        var scale = new Vector4().Set3(this.v[0]*v.v[0], this.v[1]*v.v[1], this.v[2]*v.v[2]);
        return scale;
    }
    
    this.Tween = function(v2,d) {
      // result = a + (b-a).d, assuming d normalised 0..1
      //        = v2.Sub(this).Scale(d).Add(this);
      var mid = new Vector4().Set3(
          	(v2.v[0] - this.v[0]) * d + this.v[0],
        	(v2.v[1] - this.v[1]) * d + this.v[1],
        	(v2.v[2] - this.v[2]) * d + this.v[2]   );        
      return mid;
    }
    
    this.Tween2 = function(v2,d,c) {
      var bezier = function(t)
      {
        return t * t * (3 - 2 * t); 
      }
      var saturate = function(x) {
        if (Math.abs(x) < 1e-6)
          return 0;
        else if (x > 1)
          return 1;  
        else 
          return x;
      }
  
      // result = a + (b-a).d, assuming d normalised 0..1
      if (c!=undefined && c===true) d=saturate(d);  
      var i = v2.Sub(this).Scale(bezier(d)).Add(this);
      return i;
    }
  
    this.Inside = function(box) {
        if (box != undefined)
            return box.Contains(this);
        else 
            return false;
    }
    
    // raytrace this point from starting point x0 and direction x1
    this.Raytrace = function(x0,x1) {
        var nx1 = x1.Normalize();  
        var x2  = x0.Add(nx1);
        var n21 = x2.Sub(x0);
        var n10 = x0.Sub(this);
        var n1  = n10.DotP(n21);
        var l21 = n21.Length();
        var t   = - n1 / (l21 * l21);
        var l10 = n10.Length();
        var d2   = ((l10*l10)*(l21*l21)-(n1*n1))/(l21*l21);
        return { t:t, d:Math.sqrt(d2) };
    }
    
    this.Transform = function(b) {
        var dst = new Vector4().Set4(
                ((this.v[0] * b.m[0][0]) + (this.v[1] * b.m[1][0]) + (this.v[2] * b.m[2][0]) + (this.v[3] * b.m[3][0])),
                ((this.v[0] * b.m[0][1]) + (this.v[1] * b.m[1][1]) + (this.v[2] * b.m[2][1]) + (this.v[3] * b.m[3][1])),
                ((this.v[0] * b.m[0][2]) + (this.v[1] * b.m[1][2]) + (this.v[2] * b.m[2][2]) + (this.v[3] * b.m[3][2])),
                ((this.v[0] * b.m[0][3]) + (this.v[1] * b.m[1][3]) + (this.v[2] * b.m[2][3]) + (this.v[3] * b.m[3][3]))
                );
        return dst;
    }
    
    this.ApplyQuaternion = function(q) {
        var x = this.v[0],
            y = this.v[1],
            z = this.v[2];
        var qx = q.x,
            qy = q.y,
            qz = q.z,
            qw = q.w; // calculate quat * vector

        var ix =  qw * x + qy * z - qz * y;
        var iy =  qw * y + qz * x - qx * z;
        var iz =  qw * z + qx * y - qy * x;
        var iw = -qx * x - qy * y - qz * z; // calculate result * inverse quat

        this.v[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        this.v[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        this.v[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        return this;

    }
    
    this.ClampScalar = function(min,max) {
        function _clamp(x,min,max) {
            if (x < min)      return min;
            else if (x > max) return max;
            else              return x;
        }
        var clamped = new Vector4().Set4(_clamp(this.v[0],min,max),
                                         _clamp(this.v[1],min,max),
                                         _clamp(this.v[2],min,max),
                                         _clamp(this.v[3],min,max));
        return clamped;
    }
    
    this.Floor = function() {
        return new Vector4().Set4(Math.floor(this.v[0]),
                                  Math.floor(this.v[1]),
                                  Math.floor(this.v[2]),
                                  Math.floor(this.v[3]));
    }
    
    this.ToString = function (p) {
        var s;
        if (p!=undefined) s = this.v.map(x => parseFloat(x).toFixed(p)).toString();
        else s = this.v.toString();
        // now replace the commas with spaces
        s = s.replace(/,/g, ' ');
        return s;
    }
    
    this.ToObject = function(incW) {
        var o = incW ? { x:this.v[0], y:this.v[1], z:this.v[2], w:this.v[3] }
                     : { x:this.v[0], y:this.v[1], z:this.v[2]} ;
        return o;
    }
}

function Bbox() {
    this.min = [undefined, undefined, undefined];
    this.max = [undefined, undefined, undefined];
    
    // set the starting size of the box
    this.Set = function(min, max) {
        this.min = min;
        this.max = max;
        return this;
    }
    this.SetBox = function(box) {
        this.min = box.min;
        this.max = box.max;
        return this;
    }
    this.FromString = function (str) {
        var pcs = str.trim().split(',');                // split by comma
        if (pcs.length < 6) pcs = str.trim().split(' ');// try spaces
        this.min[0] = parseFloat(pcs[0]);
        this.min[1] = parseFloat(pcs[1]);
        this.min[2] = parseFloat(pcs[2]);
        this.max[0] = parseFloat(pcs[3]);
        this.max[1] = parseFloat(pcs[4]);
        this.max[2] = parseFloat(pcs[5]);
        return this;
    }
    this.FromArray = function(box) {
        this.min = box.slice(0,3);
        this.max = box.slice(-3);
        return this;
    }
    
    this.Add = function(box) {
        if (this.children === undefined)
            this.children = [];
        
        this.children.push(box);
        return this;    
    }
    
    // take a (possibly null) input and make sure that we grow to 
    // consume it
    this.Envelope = function(box) {
        if (box != undefined) {
            for (var i=0; i<3; i++) {
                if (this.min[i] === undefined)     this.min[i] = box.min[i];
                else if (this.min[i] > box.min[i]) this.min[i] = box.min[i];
                if (this.max[i] === undefined)     this.max[i] = box.max[i];
                else if (this.max[i] < box.max[i]) this.max[i] = box.max[i];
            }
        } else {
            // operate on all children
            if (this.children != undefined) {
                var box = new Bbox(); box.SetBox(this);
                this.children.forEach(function(child) {
                    box.Envelope(child.Envelope());
                });
            }
        }
        return this;
    }
    
    //we technically only need 3 points to check planarity
    this.voxes = [];
    this.plane = undefined;
    this.IsPlanar = function(vox) {
      let newv = vox.Clone();
      //keep a record of the first three (or should it be th elast three?)  
      if (this.voxes.length < 3) {
          this.voxes.push(newv);
          if (this.voxes.length < 3) return false ; // we dont know yet
      }
      if (this.voxes.length == 3)  {
        //test planarity.
        this.voxes[2] = newv;  
        if (this.plane == undefined) {
          this.plane = new Plane().FromPoints(this.voxes);
          if (this.plane == undefined) {
              //cycle the points
              this.voxes[1] = this.voxes[2];
              this.voxes.pop();
          }
        }
      }
      if (this.plane != undefined) {
        let dist = this.plane.Distance(vox);
        let isplanar = (Math.abs(dist) < 0.0001) ? true : false;   
        return isplanar;
      } else 
        return false;
    }
    
    // same but for a point
    this.EnvelopePoint = function(vox) {
        if (vox != undefined) {
            for (var i=0; i<3; i++) {
                if (this.min[i] === undefined)   this.min[i] = vox.v[i];
                else if (this.min[i] > vox.v[i]) this.min[i] = vox.v[i];
                if (this.max[i] === undefined)   this.max[i] = vox.v[i];
                else if (this.max[i] < vox.v[i]) this.max[i] = vox.v[i];
            }
            this.planar = this.IsPlanar(vox);
        }
    }
    
    this.Size = function () {
        var diag = Math.sqrt(
            ((this.max[0]-this.min[0])*(this.max[0]-this.min[0])) +
    	    ((this.max[1]-this.min[1])*(this.max[1]-this.min[1])) + 
    	    ((this.max[2]-this.min[2])*(this.max[2]-this.min[2])) 
            );
        return diag;
    }
    
    this.Center = function() {
        var center = new Vector4().Set3(
            (this.max[0] + this.min[0]) / 2,
            (this.max[1] + this.min[1]) / 2,
            (this.max[2] + this.min[2]) / 2
            );
        return center;
    }

    this.Dims = function() {
        var dims = new Vector4().Set3(
            (this.max[0] - this.min[0]),
            (this.max[1] - this.min[1]),
            (this.max[2] - this.min[2])
            );
        return dims;
    }
    
    // is point inside/on box
    this.Contains = function(vox) {
        
        Number.prototype.round = function(decimals) {
            console.log('rounding '+this);
            return Number((Math.round(this + "e" + decimals)  + "e-" + decimals));
        }
        
        var errmin = function(p1,p2) {
            var p2e = p2.round(4);
            console.log('p1 '+p1+' p2 '+ p2e);
            var res = p1 > p2e;
            console.log('min p1 '+p1+' epsilon '+ p2e +' diff '+res);
            return res;
        }
        var errmax = function(p1,p2) {
            var p2e = p2.round(4);
            console.log('p1 '+p1+' p2 '+ p2e);
            var res = p1 < p2e;
            console.log('min p1 '+p1+' epsilon '+ p2e +' diff '+res);
            return res;
        }
        var inb = true;
        console.log('is point '+vox.ToString()+' inside box '+this.ToString());
        if (vox != undefined) {
            for (var i=0; i<3; i++) {
                if (this.min[i] === undefined)   inb = false;
                else if (errmin(this.min[i], vox.v[i])) inb = false;
                //else if (this.min[i] > vox.v[i]) inb = false;
                if (this.max[i] === undefined)   inb = false;
                else if (errmax(this.max[i], vox.v[i])) inb = false;
                //else if (this.max[i] < vox.v[i]) inb = false;
            }
        }
        return inb;
    }
    
    // get a named 'anchor' (corner/edge point). default is ccc (center)
    this.Get = function(s) {
        var comps = s.split("");
        var v = new Vector4();
        switch(comps[0]) {
            case 'l' : v.v[0] =  this.min[0]; break;
            case 'r' : v.v[0] =  this.max[0]; break;
            case 'c' : 
            default  : v.v[0] = (this.min[0] + this.max[0]) / 2; break;
        }
        switch(comps[1]) {
            case 'b' : v.v[1] =  this.min[1]; break;
            case 't' : v.v[1] =  this.max[1]; break;
            case 'c' : 
            default  : v.v[1] = (this.min[1] + this.max[1]) / 2; break;
        }
        switch(comps[2]) {
            case 'f' : v.v[2] =  this.min[2]; break;
            case 'k' : v.v[2] =  this.max[2]; break;
            case 'c' : 
            default  : v.v[2] = (this.min[2] + this.max[2]) / 2; break;
        }
        v[3] = 1;
        return v;
    }
    
    this.Corners = function(cb) {
        if (this.corners === undefined) {
            var dst = {};
            dst["ltf"] = new Vector4().Set3(this.min[0],this.max[1], this.max[2]);
            dst["lbf"] = new Vector4().Set3(this.min[0],this.min[1], this.max[2]);
            dst["ltk"] = new Vector4().Set3(this.min[0],this.max[1], this.min[2]);
            dst["lbk"] = new Vector4().Set3(this.min[0],this.min[1], this.min[2]);
            
            dst["rtf"] = new Vector4().Set3(this.max[0],this.max[1], this.max[2]);
            dst["rbf"] = new Vector4().Set3(this.max[0],this.min[1], this.max[2]);
            dst["rtk"] = new Vector4().Set3(this.max[0],this.max[1], this.min[2]);
            dst["rbk"] = new Vector4().Set3(this.max[0],this.min[1], this.min[2]);
            
            this.corners = dst;
        }
        return (cb != undefined) ? cb(this.corners) : this.corners;
    }
    
    this.Transform = function(b) {
        var cns = this.Corners( function(x) {
                      for(key in x) {
                          x[key] = x[key].Transform(b);
                      }
                      return x;
                  });
        var min = [undefined, undefined, undefined];
        var max = [undefined, undefined, undefined];
        for(point in cns)
        {
            var v = cns[point].v;
            for (var i=0; i<3; i++) {
                if (min[i] === undefined) min[i] = v[i];
                else if (min[i] > v[i])   min[i] = v[i];
                if (max[i] === undefined) max[i] = v[i];
                else if (max[i] < v[i])   max[i] = v[i];
            }
        }
        this.min = min;
        this.max = max;
        return this;
    }
    
    this.ToString = function (p) {
        var s = 'min:';
        if (p!=undefined) s = s.concat(this.min.map(x => parseFloat(x).toFixed(p)).toString());
        else s = s.concat(this.min.toString());
        s = s.concat(',max:');
        if (p!=undefined) s = s.concat(this.max.map(x => parseFloat(x).toFixed(p)).toString());
        else s = s.concat(this.max.toString());
        // now replace the commas with spaces
        s = s.replace(/,/g, ' ');
        return s;
    }
    
    this.EnumerateCorners = function (fn) {
        this.Corners();
        for(c in this.corners) {
            fn(c, this.corners[c]);
        }
    }
    
    this.EnumerateAll = function (fn,isolate) {
        if (isolate != undefined && isolate === '*') 
            isolate = undefined;
        this.Corners();
        var x = ['l','r','c'];  // left. right, center
        var s1 = x.shift();
        while (s1 != undefined) {
            var y = ['t','b','c'];  // top, bottom, center
            var s2 = y.shift();
            while (s2 != undefined) {
                var z = ['f','k','c'];  // front. back, center
                var s3 = z.shift();
                while (s3 != undefined) {
                    var sc = s1 + s2 + s3;
                    if (isolate != undefined && isolate == sc)
                      fn(sc, this.Get(sc));
                    else if (isolate === undefined)  
                      fn(sc, this.Get(sc));
                    s3 = z.shift();
                }
                s2 = y.shift();
            }
            s1 = x.shift();
        }
    }
    
    // raytrace a vector from starting point x0, direction x1, and test for 
    // interaction against this box
    this.Raytrace = function(x0,x1) {
        console.log('tracing '+this.ToString());
        
        var min = function(t1,t2) {
            if (t1 === undefined) return t2; 
            else return (t1 < t2)? t1:t2;
        }
        var max = function(t1,t2) {
            if (t1 === undefined) return t2; 
            else return (t1 > t2)? t1:t2;
        }
        // boxes are axially aligned
        var lx1 = x1.Length();
        if (lx1 === 0) {
            return { t:undefined, p:undefined, error:"invalid ray" };
        }
        
        var nx1 = x1.Normalize();
        
        //we do this for each axis;
        var tnear = undefined;
        var tfar  = undefined;
        for(var i=0; i<3; i++) {
            //
            var rd = nx1.v[i]; //ray direction for this axis
            var rs =  x0.v[i];
            //console.log(rd);
            if(rd != 0) {
                var t1 = (this.min[i] - rs) / rd;
                var t2 = (this.max[i] - rs) / rd;
                tnear  = max(tnear,min(t1,t2));
                tfar   = min(tfar, max(t1,t2));
                if ((tnear > tfar) || (tfar < 0)) {
                    return {t:undefined, p:undefined };
                }
            }
        }
        
        //console.log(tnear);
        // we hit the box, so lets see if there is substructure
        if (tnear != undefined && this.children != undefined) {
            this.children.forEach(function(child) {
                var kt = child.Raytrace(x0,x1);
                console.log(kt);                  
                tnear  = kt.t;
            });
        }
        if (tnear === undefined)    
            return { t:undefined, p:undefined, error:"missed" };
        
        var ipoint = x0.Add(nx1.Scale(tnear));
        //console.log(ipoint.ToString());    
        var inbox  = this.Contains(ipoint);
        if (inbox === false)
            return { t:undefined, p:undefined, error:"missed" };
        else {
            //console.log(ipoint.ToString());    
            return { t:tnear, p:x0.Add(nx1.Scale(tnear)) };
        }
    }
}



function Quat() {
    
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 1;
    
    this.Set4 = function(x,y,z,w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }
    this.Set4a = function(a) {
        this.x = a[0];
        this.y = a[1];
        this.z = a[2];
        this.w = a[3];
        return this;
    }
    this.SetQ = function(quat) {
        this.x = quat.x;
        this.y = quat.y;
        this.z = quat.z;
        this.w = quat.w;
        return this;
    }
    this.Clone = function(q) {
        return new Quat().SetQ(q != undefined ? q : this);
    }
    this.FromEuler3 = function(x,y,z,deg) {
        function deg2rad(d) { return (deg!=undefined) ? d * Math.PI / 180 : d; }
        var cos = Math.cos;
        var sin = Math.sin;
        
        var _x = deg2rad(x); 
        var _y = deg2rad(y); 
        var _z = deg2rad(z);
        
        var c1 = cos(_x / 2);
        var c2 = cos(_y / 2);
        var c3 = cos(_z / 2);
        var s1 = sin(_x / 2);
        var s2 = sin(_y / 2);
        var s3 = sin(_z / 2);

        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;
        
        return this;
    }
    this.FromEuler = function(e,deg) {
        return this.FromEuler3(e.attitude, e.heading, e.bank, deg);
    }
    this.FromAxisAngle = function(axis,angle,deg) {
        // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
        // assumes axis is normalized
        function deg2rad(d) { return (deg!=undefined) ? d * Math.PI / 180 : d; }
	
        var halfAngle = deg2rad(angle) / 2,
	 	    s = Math.sin(halfAngle);
        this.x = axis[0] * s;
        this.y = axis[1] * s;
        this.z = axis[2] * s;
        this.w = Math.cos(halfAngle);

        return this;
    }
    this.FromMatrix = function(m) {
        // set from rotation matrix
        var te  = m.m;
        var m11 = m.m[0][0], m12 = m.m[1][0], m13 = m.m[2][0];
        var m21 = m.m[0][1], m22 = m.m[1][1], m23 = m.m[2][1];
        var m31 = m.m[0][2], m32 = m.m[1][2], m33 = m.m[2][2];
        var trace = m11 + m22 + m33;

        if (trace > 0) {
            var s = 0.5 / Math.sqrt(trace + 1.0);
            this.w = 0.25 / s;
            this.x = (m32 - m23) * s;
            this.y = (m13 - m31) * s;
            this.z = (m21 - m12) * s;
        } else if (m11 > m22 && m11 > m33) {
            var _s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
                
            this.w = (m32 - m23) / _s;
            this.x = 0.25 * _s;
            this.y = (m12 + m21) / _s;
            this.z = (m13 + m31) / _s;
        } else if (m22 > m33) {
            var _s2 = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

            this.w = (m13 - m31) / _s2;
            this.x = (m12 + m21) / _s2;
            this.y = 0.25 * _s2;
            this.z = (m23 + m32) / _s2;
        } else {
            var _s3 = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

            this.w = (m21 - m12) / _s3;
            this.x = (m13 + m31) / _s3;
            this.y = (m23 + m32) / _s3;
            this.z = 0.25 * _s3;
        }

        return this;
    }
    this.From2V = function(vFrom,vTo) {
        // assume normalized vectors
        var EPS = 0.000001;
        var r = vFrom.DotP(vTo) + 1;

        if (r < EPS) {
            r = 0;

            if (Math.abs(vFrom.v[0]) > Math.abs(vFrom.v[2])) {
                this.x = -vFrom.v[1];
                this.y =  vFrom.v[0];
                this.z = 0;
                this.w = r;
            } else {
                this.x = 0;
                this.y = -vFrom.v[2];
                this.z =  vFrom.v[1];
                this.w = r;
            }
        } else {
            // crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3
            this.x = vFrom.v[1] * vTo.v[2] - vFrom.v[2] * vTo.v[1];
            this.y = vFrom.v[2] * vTo.v[0] - vFrom.v[0] * vTo.v[2];
            this.z = vFrom.v[0] * vTo.v[1] - vFrom.v[1] * vTo.v[0];
            this.w = r;
        }
        
        return this.Normalize();
    }
    this.ToAxisAngle = function() {
        // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm
        // q is assumed to be normalized
        var aa = new Vector4();
        aa.v[3] = 2 * Math.acos(this.w);
        var s = Math.sqrt(1 - this.w * this.w);

        if (s < 0.0001) {
            aa.v[0] = 1;
            aa.v[1] = 0;
            aa.v[2] = 0;
        } else {
            aa.v[0] = this.x / s;
            aa.v[1] = this.y / s;
            aa.v[2] = this.z / s;
        }

	return aa;
    }
    this.AngleTo = function(q,deg) {
        function clamp(x,min,max) {
            if (x < min)      return min;
            else if (x > max) return max;
            else              return x;
        }
        function rad2deg(d) { return (deg!=undefined) ? d * 180 / Math.PI : d; }

        var a = 2 * Math.acos(Math.abs(clamp(this.DotP(q), -1, 1)));
        return rad2deg(a);
    }
    this.RotateTowards= function(q,step) {
        var angle = this.AngleTo(q);
        if (angle === 0) return this;
        var t = Math.min(1, step / angle);
        this.Slerp(q, t);
        return this;
    }
    this.Identity = function() {
        this.Set4(0,0,0,1);
        return this;
    }
    this.Invert = function() {
        this.x *= -1;
        this.y *= -1;
        this.z *= -1;
        return this;
    }
    this.DotP = function(v) {
        return this.x * v.x +
               this.y * v.y +
               this.z * v.z +
               this.w * v.w ;
    }
    this.Length2 = function() {
        return this.x * this.x + 
               this.y * this.y +
               this.z * this.z + 
               this.w * this.w ;
    }
    this.Length = function() {
        return Math.sqrt(this.Length2());
    }
    this.Normalize = function() {
        var l = this.Length();
        if (l === 0) {
            this.Set4(0,0,0,1);
        } else {
            p = 1 / l;
            this.x = this.x * p;
            this.y = this.y * p;
            this.z = this.z * p;
            this.w = this.w * p;
        }
        return this;
    }
    this.Multiply = function(b) {
        var a = this;
        // muultiply a * b;
        var qax = a.x,
            qay = a.y,
            qaz = a.z,
            qaw = a.w;
        var qbx = b.x,
            qby = b.y,
            qbz = b.z,
            qbw = b.w;
        this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
        
        return this;
    }
    this.Slerp = function(qb,t) {
        var qa = this.Clone();
        if (t<=0) return qa;
        if (t>=1) return qb;
        
        var x = this.x, 
            y = this.y,
            z = this.z, 
            w = this.w;
        var cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;
        
        if (cosHalfTheta < 0) {
            qa.w = -qb.w;
            qa.x = -qb.x;
            qa.y = -qb.y;
            qa.z = -qb.z;
            cosHalfTheta = -cosHalfTheta;
        } else {
            qa.SetQ(qb);
        }

        if (cosHalfTheta >= 1.0) {
            qa.w = w;
            qa.x = x;
            qa.y = y;
            qa.z = z;
            return qa;
        }

        var sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;
        
        if (sqrSinHalfTheta <= Number.EPSILON) {
            var s = 1 - t;
            qa.w = s * w + t * qa.w;
            qa.x = s * x + t * qa.x;
            qa.y = s * y + t * qa.y;
            qa.z = s * z + t * qa.z;
            return qa.Normalize();
        }

        var sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
        var halfTheta    = Math.atan2(sinHalfTheta, cosHalfTheta);
        var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
            ratioB = Math.sin(t       * halfTheta) / sinHalfTheta;
            
        qa.w = w * ratioA + qa.w * ratioB;
        qa.x = x * ratioA + qa.x * ratioB;
        qa.y = y * ratioA + qa.y * ratioB;
        qa.z = z * ratioA + qa.z * ratioB;
        return qa;        
    } 
    this.Tween = function (qb,t) {
        return this.Slerp(qb,t);
    }
    this.ToString = function (p) {
        var s;
        if (p!=undefined) s = `[${this.x.toFixed(p)} ${this.y.toFixed(p)} ${this.z.toFixed(p)} ${this.w.toFixed(p)}]`;
        else s = `[${this.x} ${this.y} ${this.z} ${this.w}]`;
        return s;
    }

}

    root.Matrix4 = Matrix4;
    root.MatrixO = MatrixO;
    root.MatrixP = MatrixP;	
    root.Vector4 = Vector4;
    root.BBox    = Bbox;
    root.Quat    = Quat;

})(this);
