!function(j){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=j();else if("function"==typeof define&&define.amd)define([],j);else{var k;k="undefined"==typeof window?"undefined"==typeof global?"undefined"==typeof self?this:self:global:window,k.toolbox=j()}}(function(){return function j(k,q,z){function A(D,F){if(!q[D]){if(!k[D]){var G="function"==typeof require&&require;if(!F&&G)return G(D,!0);if(B)return B(D,!0);var H=new Error("Cannot find module '"+D+"'");throw H.code="MODULE_NOT_FOUND",H}var I=q[D]={exports:{}};k[D][0].call(I.exports,function(J){var K=k[D][1][J];return A(K?K:J)},I,I.exports,j,k,q,z)}return q[D].exports}for(var B="function"==typeof require&&require,C=0;C<z.length;C++)A(z[C]);return A}({1:[function(j,k){"use strict";function z(N,O){O=O||{};var P=O.debug||L.debug;P&&console.log("[sw-toolbox] "+N)}function A(N){var O;return N&&N.cache&&(O=N.cache.name),O=O||L.cache.name,caches.open(O)}function C(N,O,P){var Q=D.bind(null,N,O,P);K=K?K.then(Q):Q()}function D(N,O,P){var Q=N.url,R=P.maxAgeSeconds,S=P.maxEntries,T=P.name,U=Date.now();return z("Updating LRU order for "+Q+". Max entries is "+S+", max age is "+R),M.getDb(T).then(function(V){return M.setTimestampForUrl(V,Q,U)}).then(function(V){return M.expireEntries(V,S,R,U)}).then(function(V){z("Successfully updated IDB.");var W=V.map(function(X){return O.delete(X)});return Promise.all(W).then(function(){z("Done with cache cleanup.")})}).catch(function(V){z(V)})}function J(N){var O=Array.isArray(N);if(O&&N.forEach(function(P){"string"==typeof P||P instanceof Request||(O=!1)}),!O)throw new TypeError("The precache method expects either an array of strings and/or Requests or a Promise that resolves to an array of strings and/or Requests.");return N}var K,L=j("./options"),M=j("./idb-cache-expiration");k.exports={debug:z,fetchAndCache:function(N,O){O=O||{};var P=O.successResponses||L.successResponses;return fetch(N.clone()).then(function(Q){return"GET"===N.method&&P.test(Q.status)&&A(O).then(function(R){R.put(N,Q).then(function(){var S=O.cache||L.cache;(S.maxEntries||S.maxAgeSeconds)&&S.name&&C(N,R,S)})}),Q.clone()})},openCache:A,renameCache:function(N,O,P){return z("Renaming cache: ["+N+"] to ["+O+"]",P),caches.delete(O).then(function(){return Promise.all([caches.open(N),caches.open(O)]).then(function(Q){var R=Q[0],S=Q[1];return R.keys().then(function(T){return Promise.all(T.map(function(U){return R.match(U).then(function(V){return S.put(U,V)})}))}).then(function(){return caches.delete(N)})})})},cache:function(N,O){return A(O).then(function(P){return P.add(N)})},uncache:function(N,O){return A(O).then(function(P){return P.delete(N)})},precache:function(N){N instanceof Promise||J(N),L.preCacheItems=L.preCacheItems.concat(N)},validatePrecacheInput:J}},{"./idb-cache-expiration":2,"./options":4}],2:[function(j,k){"use strict";function z(M){return new Promise(function(N,O){var P=indexedDB.open(G+M,H);P.onupgradeneeded=function(){var Q=P.result.createObjectStore(I,{keyPath:J});Q.createIndex(K,K,{unique:!1})},P.onsuccess=function(){N(P.result)},P.onerror=function(){O(P.error)}})}function C(M,N,O){return N?new Promise(function(P,Q){var S=[],T=M.transaction(I,"readwrite"),U=T.objectStore(I),V=U.index(K);V.openCursor().onsuccess=function(W){var X=W.target.result;if(X&&O-1e3*N>X.value[K]){var Y=X.value[J];S.push(Y),U.delete(Y),X.continue()}},T.oncomplete=function(){P(S)},T.onabort=Q}):Promise.resolve([])}function D(M,N){return N?new Promise(function(O,P){var Q=[],R=M.transaction(I,"readwrite"),S=R.objectStore(I),T=S.index(K),U=T.count();T.count().onsuccess=function(){var V=U.result;V>N&&(T.openCursor().onsuccess=function(W){var X=W.target.result;if(X){var Y=X.value[J];Q.push(Y),S.delete(Y),V-Q.length>N&&X.continue()}})},R.oncomplete=function(){O(Q)},R.onabort=P}):Promise.resolve([])}var G="sw-toolbox-",H=1,I="store",J="url",K="timestamp",L={};k.exports={getDb:function(M){return M in L||(L[M]=z(M)),L[M]},setTimestampForUrl:function(M,N,O){return new Promise(function(P,Q){var R=M.transaction(I,"readwrite"),S=R.objectStore(I);S.put({url:N,timestamp:O}),R.oncomplete=function(){P(M)},R.onabort=function(){Q(R.error)}})},expireEntries:function(M,N,O,P){return C(M,O,P).then(function(Q){return D(M,N).then(function(R){return Q.concat(R)})})}}},{}],3:[function(j,k){"use strict";function B(H){return H.reduce(function(I,J){return I.concat(J)},[])}j("serviceworker-cache-polyfill");var D=j("./helpers"),F=j("./router"),G=j("./options");k.exports={fetchListener:function(H){var I=F.match(H.request);I?H.respondWith(I(H.request)):F.default&&"GET"===H.request.method&&0===H.request.url.indexOf("http")&&H.respondWith(F.default(H.request))},activateListener:function(H){D.debug("activate event fired");var I=G.cache.name+"$$$inactive$$$";H.waitUntil(D.renameCache(I,G.cache.name))},installListener:function(H){var I=G.cache.name+"$$$inactive$$$";D.debug("install event fired"),D.debug("creating cache ["+I+"]"),H.waitUntil(D.openCache({cache:{name:I}}).then(function(J){return Promise.all(G.preCacheItems).then(B).then(D.validatePrecacheInput).then(function(K){return D.debug("preCache list: "+(K.join(", ")||"(none)")),J.addAll(K)})}))}}},{"./helpers":1,"./options":4,"./router":6,"serviceworker-cache-polyfill":16}],4:[function(j,k){"use strict";var z;z=self.registration?self.registration.scope:self.scope||new URL("./",self.location).href,k.exports={cache:{name:"$$$toolbox-cache$$$"+z+"$$$",maxAgeSeconds:null,maxEntries:null},debug:!1,networkTimeoutSeconds:null,preCacheItems:[],successResponses:/^0|([123]\d\d)|(40[14567])|410$/}},{}],5:[function(j,k){"use strict";var z=new URL("./",self.location),A=z.pathname,B=j("path-to-regexp"),C=function(D,F,G,H){F instanceof RegExp?this.fullUrlRegExp=F:(0!==F.indexOf("/")&&(F=A+F),this.keys=[],this.regexp=B(F,this.keys)),this.method=D,this.options=H,this.handler=G};C.prototype.makeHandler=function(D){var F;if(this.regexp){var G=this.regexp.exec(D);F={},this.keys.forEach(function(H,I){F[H.name]=G[I+1]})}return function(H){return this.handler(H,F,this.options)}.bind(this)},k.exports=C},{"path-to-regexp":15}],6:[function(j,k){"use strict";function z(F){return F.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}var A=j("./route"),B=j("./helpers"),C=function(F,G){for(var K,H=F.entries(),I=H.next(),J=[];!I.done;)K=new RegExp(I.value[0]),K.test(G)&&J.push(I.value[1]),I=H.next();return J},D=function(){this.routes=new Map,this.routes.set(RegExp,new Map),this.default=null};["get","post","put","delete","head","any"].forEach(function(F){D.prototype[F]=function(G,H,I){return this.add(F,G,H,I)}}),D.prototype.add=function(F,G,H,I){I=I||{};var J;G instanceof RegExp?J=RegExp:(J=I.origin||self.location.origin,J=J instanceof RegExp?J.source:z(J)),F=F.toLowerCase();var K=new A(F,G,H,I);this.routes.has(J)||this.routes.set(J,new Map);var L=this.routes.get(J);L.has(F)||L.set(F,new Map);var M=L.get(F),N=K.regexp||K.fullUrlRegExp;M.has(N.source)&&B.debug("\""+G+"\" resolves to same regex as existing route."),M.set(N.source,K)},D.prototype.matchMethod=function(F,G){var H=new URL(G),I=H.origin,J=H.pathname;return this._match(F,C(this.routes,I),J)||this._match(F,[this.routes.get(RegExp)],G)},D.prototype._match=function(F,G,H){if(0===G.length)return null;for(var I=0;I<G.length;I++){var J=G[I],K=J&&J.get(F.toLowerCase());if(K){var L=C(K,H);if(0<L.length)return L[0].makeHandler(H)}}return null},D.prototype.match=function(F){return this.matchMethod(F.method,F.url)||this.matchMethod("any",F.url)},k.exports=new D},{"./helpers":1,"./route":5}],7:[function(j,k){"use strict";var A=j("../helpers");k.exports=function(B,C,D){return A.debug("Strategy: cache first ["+B.url+"]",D),A.openCache(D).then(function(F){return F.match(B).then(function(G){return G?G:A.fetchAndCache(B,D)})})}},{"../helpers":1}],8:[function(j,k){"use strict";var A=j("../helpers");k.exports=function(B,C,D){return A.debug("Strategy: cache only ["+B.url+"]",D),A.openCache(D).then(function(F){return F.match(B)})}},{"../helpers":1}],9:[function(j,k){"use strict";var A=j("../helpers"),B=j("./cacheOnly");k.exports=function(C,D,F){return A.debug("Strategy: fastest ["+C.url+"]",F),new Promise(function(G,H){var I=!1,J=[],K=function(M){J.push(M.toString()),I?H(new Error("Both cache and network failed: \""+J.join("\", \"")+"\"")):I=!0},L=function(M){M instanceof Response?G(M):K("No result returned")};A.fetchAndCache(C.clone(),F).then(L,K),B(C,D,F).then(L,K)})}},{"../helpers":1,"./cacheOnly":8}],10:[function(j,k){k.exports={networkOnly:j("./networkOnly"),networkFirst:j("./networkFirst"),cacheOnly:j("./cacheOnly"),cacheFirst:j("./cacheFirst"),fastest:j("./fastest")}},{"./cacheFirst":7,"./cacheOnly":8,"./fastest":9,"./networkFirst":11,"./networkOnly":12}],11:[function(j,k){"use strict";var A=j("../options"),B=j("../helpers");k.exports=function(C,D,F){F=F||{};var G=F.successResponses||A.successResponses,H=F.networkTimeoutSeconds||A.networkTimeoutSeconds;return B.debug("Strategy: network first ["+C.url+"]",F),B.openCache(F).then(function(I){var J,K,L=[];if(H){var M=new Promise(function(O){J=setTimeout(function(){I.match(C).then(function(P){P&&O(P)})},1e3*H)});L.push(M)}var N=B.fetchAndCache(C,F).then(function(O){if(J&&clearTimeout(J),G.test(O.status))return O;throw B.debug("Response was an HTTP error: "+O.statusText,F),K=O,new Error("Bad response")}).catch(function(O){return B.debug("Network or response error, fallback to cache ["+C.url+"]",F),I.match(C).then(function(P){if(P)return P;if(K)return K;throw O})});return L.push(N),Promise.race(L)})}},{"../helpers":1,"../options":4}],12:[function(j,k){"use strict";var A=j("../helpers");k.exports=function(B,C,D){return A.debug("Strategy: network only ["+B.url+"]",D),fetch(B)}},{"../helpers":1}],13:[function(j,k){"use strict";var z=j("./options"),A=j("./router"),B=j("./helpers"),C=j("./strategies"),D=j("./listeners");B.debug("Service Worker Toolbox is loading"),self.addEventListener("install",D.installListener),self.addEventListener("activate",D.activateListener),self.addEventListener("fetch",D.fetchListener),k.exports={networkOnly:C.networkOnly,networkFirst:C.networkFirst,cacheOnly:C.cacheOnly,cacheFirst:C.cacheFirst,fastest:C.fastest,router:A,options:z,cache:B.cache,uncache:B.uncache,precache:B.precache}},{"./helpers":1,"./listeners":3,"./options":4,"./router":6,"./strategies":10}],14:[function(j,k){k.exports=Array.isArray||function(z){return"[object Array]"==Object.prototype.toString.call(z)}},{}],15:[function(j,k){function z(Q){for(var R,S=[],T=0,U=0,V="";null!=(R=P.exec(Q));){var W=R[0],X=R[1],Y=R.index;if(V+=Q.slice(U,Y),U=Y+W.length,X)V+=X[1];else{var Z=Q[U],$=R[2],_=R[3],aa=R[4],ba=R[5],ca=R[6],da=R[7];V&&(S.push(V),V="");var ha=R[2]||"/",ia=aa||ba||(da?".*":"[^"+ha+"]+?");S.push({name:_||T++,prefix:$||"",delimiter:ha,optional:"?"===ca||"*"===ca,repeat:"+"===ca||"*"===ca,partial:null!=$&&null!=Z&&Z!==$,asterisk:!!da,pattern:G(ia)})}}return U<Q.length&&(V+=Q.substr(U)),V&&S.push(V),S}function B(Q){return encodeURI(Q).replace(/[\/?#]/g,function(R){return"%"+R.charCodeAt(0).toString(16).toUpperCase()})}function C(Q){return encodeURI(Q).replace(/[?#]/g,function(R){return"%"+R.charCodeAt(0).toString(16).toUpperCase()})}function D(Q){for(var R=Array(Q.length),S=0;S<Q.length;S++)"object"==typeof Q[S]&&(R[S]=new RegExp("^(?:"+Q[S].pattern+")$"));return function(T,U){for(var $,V="",W=T||{},X=U||{},Y=X.pretty?B:encodeURIComponent,Z=0;Z<Q.length;Z++)if($=Q[Z],"string"!=typeof $){var _,aa=W[$.name];if(null==aa){if($.optional){$.partial&&(V+=$.prefix);continue}throw new TypeError("Expected \""+$.name+"\" to be defined")}if(O(aa)){if(!$.repeat)throw new TypeError("Expected \""+$.name+"\" to not repeat, but received `"+JSON.stringify(aa)+"`");if(0===aa.length){if($.optional)continue;throw new TypeError("Expected \""+$.name+"\" to not be empty")}for(var ba=0;ba<aa.length;ba++){if(_=Y(aa[ba]),!R[Z].test(_))throw new TypeError("Expected all \""+$.name+"\" to match \""+$.pattern+"\", but received `"+JSON.stringify(_)+"`");V+=(0===ba?$.prefix:$.delimiter)+_}}else{if(_=$.asterisk?C(aa):Y(aa),!R[Z].test(_))throw new TypeError("Expected \""+$.name+"\" to match \""+$.pattern+"\", but received \""+_+"\"");V+=$.prefix+_}}else V+=$;return V}}function F(Q){return Q.replace(/([.+*?=^!:${}()[\]|\/\\])/g,"\\$1")}function G(Q){return Q.replace(/([=!:$\/()])/g,"\\$1")}function H(Q,R){return Q.keys=R,Q}function I(Q){return Q.sensitive?"":"i"}function J(Q,R){var S=Q.source.match(/\((?!\?)/g);if(S)for(var T=0;T<S.length;T++)R.push({name:T,prefix:null,delimiter:null,optional:!1,repeat:!1,partial:!1,asterisk:!1,pattern:null});return H(Q,R)}function K(Q,R,S){for(var T=[],U=0;U<Q.length;U++)T.push(N(Q[U],R,S).source);var V=new RegExp("(?:"+T.join("|")+")",I(S));return H(V,R)}function L(Q,R,S){for(var T=z(Q),U=M(T,S),V=0;V<T.length;V++)"string"!=typeof T[V]&&R.push(T[V]);return H(U,R)}function M(Q,R){R=R||{};for(var Y,S=R.strict,T=!1!==R.end,U="",V=Q[Q.length-1],W="string"==typeof V&&/\/$/.test(V),X=0;X<Q.length;X++)if(Y=Q[X],"string"==typeof Y)U+=F(Y);else{var Z=F(Y.prefix),$="(?:"+Y.pattern+")";Y.repeat&&($+="(?:"+Z+$+")*"),$=Y.optional?Y.partial?Z+"("+$+")?":"(?:"+Z+"("+$+"))?":Z+"("+$+")",U+=$}return S||(U=(W?U.slice(0,-2):U)+"(?:\\/(?=$))?"),U+=T?"$":S&&W?"":"(?=\\/|$)",new RegExp("^"+U,I(R))}function N(Q,R,S){return R=R||[],O(R)?S||(S={}):(S=R,R=[]),Q instanceof RegExp?J(Q,R):O(Q)?K(Q,R,S):L(Q,R,S)}var O=j("isarray");k.exports=N,k.exports.parse=z,k.exports.compile=function(Q){return D(z(Q))},k.exports.tokensToFunction=D,k.exports.tokensToRegExp=M;var P=new RegExp(["(\\\\.)","([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))"].join("|"),"g")},{isarray:14}],16:[function(){!function(){var z=Cache.prototype.addAll,A=navigator.userAgent.match(/(Firefox|Chrome)\/(\d+\.)/);if(A)var B=A[1],C=parseInt(A[2]);z&&(!A||"Firefox"===B&&46<=C||"Chrome"===B&&50<=C)||(Cache.prototype.addAll=function(D){function F(H){this.name="NetworkError",this.code=19,this.message=H}var G=this;return F.prototype=Object.create(Error.prototype),Promise.resolve().then(function(){if(1>arguments.length)throw new TypeError;return D=D.map(function(H){return H instanceof Request?H:H+""}),Promise.all(D.map(function(H){"string"==typeof H&&(H=new Request(H));var I=new URL(H.url).protocol;if("http:"!==I&&"https:"!==I)throw new F("Invalid scheme");return fetch(H.clone())}))}).then(function(H){if(H.some(function(I){return!I.ok}))throw new F("Incorrect response status");return Promise.all(H.map(function(I,J){return G.put(D[J],I)}))}).then(function(){})},Cache.prototype.add=function(D){return this.addAll([D])})}()},{}]},{},[13])(13)});