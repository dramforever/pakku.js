// (C) 2017 @dramforever, @xmcp, @fanthos. THIS PROJECT IS LICENSED UNDER GPL VERSION 3. SEE `LICENSE.txt`.

var ed_counts = new Int16Array (0x10ffff);
var ed_a = new Int16Array (1048576);
var ed_b = new Int16Array (1048576);

var MIN_DANMU_SIZE=10;

function hash(a, b) {
    return ((a<<10)^b)&1048575;
}

function edit_distance (P, Q) {
    'use strict';
    // TODO: Make this less hacky

    for (var i = 0; i < P.length; i ++) ed_counts [P.charCodeAt (i)] ++;
    for (var i = 0; i < Q.length; i ++) ed_counts [Q.charCodeAt (i)] --;

    var ans = 0;

    for (var i = 0; i < P.length; i ++) {
        ans += Math.abs (ed_counts[P.charCodeAt (i)]);
        ed_counts[P.charCodeAt (i)] = 0;
    }

    for (var i = 0; i < Q.length; i ++) {
        ans += Math.abs (ed_counts[Q.charCodeAt (i)]);
        ed_counts[Q.charCodeAt (i)] = 0;
    }

    return ans;
}

function cosine_distance (P, Q) {
    'use strict';
    
    if(MAX_COSINE>100) return 0;

    var P_length_1=P.length, Q_length_1=Q.length;
    P+=P.charAt(0); Q+=Q.charAt(0);

	for (var i = 0; i < P_length_1; i++)
		ed_a[hash(P.charCodeAt(i), P.charCodeAt(i + 1))]++;
	for (var i = 0; i < Q_length_1; i++)
		ed_b[hash(Q.charCodeAt(i), Q.charCodeAt(i + 1))]++;

	var x = 0, y = 0, z = 0;

    for (var i = 0; i < P_length_1; i ++) {
        var h1=hash(P.charCodeAt(i), P.charCodeAt(i + 1));
        if (ed_a[h1]) {
			y += ed_a[h1] * ed_a[h1];
			if (ed_b[h1]) {
                x += ed_a[h1] * ed_b[h1];
                z += ed_b[h1] * ed_b[h1];
				ed_b[h1] = 0;
			}
			ed_a[h1] = 0;
		}
    }

    for (var i = 0; i < Q_length_1; i ++) {
        var h1=hash(Q.charCodeAt(i), Q.charCodeAt(i + 1));
        if (ed_b[h1]) {
            z += ed_b[h1] * ed_b[h1];
            ed_b[h1] = 0;
        }
    }
    
	return x*x/y/z;
}

function similar(P,Q,S) {
    if(P==Q) {
        S.identical++;
        return '==';
    }
    var dis=edit_distance(P,Q);
    if((P.length+Q.length < MIN_DANMU_SIZE) ? dis<(P.length+Q.length)/MIN_DANMU_SIZE*MAX_DIST-1 : dis<=MAX_DIST) {
        S.edit_distance++;
        return '≤'+dis;
    }
    var cos=~~(cosine_distance(P,Q)*100);
    if(cos>=MAX_COSINE) {
        S.cosine_distance++;
        return cos+'%';
    }
    return false;
}
