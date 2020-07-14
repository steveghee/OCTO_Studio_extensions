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
  
    this.RotateFromEuler = function(x, y, z, deg) {
        var mt = new Matrix4()
                     .Rotate([1,0,0], x, deg)
                     .Rotate([0,1,0], y, deg)
                     .Rotate([0,0,1], z, deg);
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
    
    this.ToString = function () {
        var s = '';
        for (var i = 0; i < 4; i++) {
            s = s.concat(this.m[i].toString());
            s = s.concat(',');
        }
        // now replace the commas with spaces
        s = s.replace(/,/g, ' ');
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


function Vector4() {
    this.v = [0, 0, 0, 1];

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
    
    this.Set4a = function (a) {
        this.v[0] = a[0];
        this.v[1] = a[1];
        this.v[2] = a[2];
        this.v[3] = a[3];
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

    this.FromString = function (str) {
        var pcs = str.split(',');                // split by comman
        if (pcs.length < 3) pcs = str.split(' ');// try spaces
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
        var rad = this.Length();
        this.v[0] = this.v[0] / rad;
        this.v[1] = this.v[1] / rad;
        this.v[2] = this.v[2] / rad;
        return this;
    }
    
    this.Negate = function () {
        this.v[0] = - this.v[0];
        this.v[1] = - this.v[1];
        this.v[2] = - this.v[2];
        return this;
    }

    this.DotP = function (v2) {
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
    
    this.Scale = function (s) {
        var scale = new Vector4().Set3(this.v[0]*s, this.v[1]*s, this.v[2]*s);
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
        var i = v2.Sub(this).Scale(d).Add(this);
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
    
    this.ToString = function () {
        var s = this.v.toString();
        // now replace the commas with spaces
        s = s.replace(/,/g, ' ');
        return s;
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
    // same but for a point
    this.EnvelopePoint = function(vox) {
        if (vox != undefined) {
            for (var i=0; i<3; i++) {
                if (this.min[i] === undefined)   this.min[i] = vox.v[i];
                else if (this.min[i] > vox.v[i]) this.min[i] = vox.v[i];
                if (this.max[i] === undefined)   this.max[i] = vox.v[i];
                else if (this.max[i] < vox.v[i]) this.max[i] = vox.v[i];
            }
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
            var dst = new Object();
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
    
    this.ToString = function () {
        var s = 'min:';
        s = s.concat(this.min.toString());
        s = s.concat(',max:');
        s = s.concat(this.max.toString());
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

